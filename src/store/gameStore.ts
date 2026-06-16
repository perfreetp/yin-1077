import { create } from 'zustand';
import {
  Player,
  Progress,
  Inventory,
  Settings,
  WeeklyReport,
  SkillScore,
  SkillType,
  PracticeSession,
  PracticeSpeed,
  FailedLevelRecord,
  SkillTrendPoint,
} from '@/types';
import { ALL_RHYTHM_PATTERNS, ALL_KEY_SIGNATURES, SKILL_LABELS } from '@/types';
import { AREAS, LEVELS, ITEMS, getLevelById, getAreaById } from '@/data/gameData';

const STORAGE_KEYS = {
  player: 'sightread_player',
  progress: 'sightread_progress',
  inventory: 'sightread_inventory',
  settings: 'sightread_settings',
  weeklyReport: 'sightread_weekly_report',
  dailyTime: 'sightread_daily_time',
  practiceLog: 'sightread_practice_log',
  skillTrend: 'sightread_skill_trend',
  failedLevels: 'sightread_failed_levels',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function createDefaultPlayer(): Player {
  return {
    id: 'player_1',
    name: '小冒险家',
    coins: 0,
    avatarId: 1,
    totalPlayTime: 0,
    createdAt: new Date().toISOString(),
    currentAreaId: 1,
  };
}

function createDefaultProgress(): Progress[] {
  const progress: Progress[] = [];
  for (const level of LEVELS) {
    const isFirstOfFirstArea = level.id === 101;
    progress.push({
      playerId: 'player_1',
      levelId: level.id,
      stars: 0,
      unlocked: isFirstOfFirstArea,
      bestAccuracy: 0,
      completedAt: null,
    });
  }
  return progress;
}

function createDefaultSettings(): Settings {
  return {
    playerId: 'player_1',
    dailyTimeLimit: 60,
    maxDifficulty: 3,
    pinCode: '0000',
  };
}

function createDefaultWeeklyReport(): WeeklyReport {
  return {
    weekStart: new Date().toISOString(),
    scores: {
      steady_beat: 0,
      sight_read: 0,
      interval_jump: 0,
      hand_switch: 0,
      continuous: 0,
    },
    totalPracticeTime: 0,
    levelsCompleted: 0,
    strongestSkill: 'steady_beat',
    weakestSkill: 'continuous',
    masteredRhythms: [],
    masteredKeys: [],
  };
}

interface GameStore {
  player: Player;
  progress: Progress[];
  inventory: Inventory[];
  settings: Settings;
  weeklyReport: WeeklyReport;
  todayPlayTime: number;
  lastPlayDate: string;
  levelSessionStartTime: number | null;

  initStore: () => void;
  setPlayerName: (name: string) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  completeLevel: (levelId: number, accuracy: number) => { stars: number; coins: number; passed: boolean };
  unlockNextLevel: (levelId: number) => void;
  purchaseItem: (itemId: number) => boolean;
  equipItem: (itemId: number) => void;
  unequipItem: (itemId: number) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  verifyPin: (pin: string) => boolean;
  updateWeeklyReport: (skillType: SkillType, score: number) => void;
  addPlayTime: (minutes: number) => void;
  isDailyTimeExceeded: () => boolean;
  getLevelProgress: (levelId: number) => Progress | undefined;
  getEquippedItems: () => Inventory[];
  getOwnedItems: () => Inventory[];
  isLevelUnlocked: (levelId: number) => boolean;
  getAreaProgress: (areaId: number) => { completed: number; total: number; stars: number };
  getSkillScores: () => SkillScore;
  startLevelSession: () => void;
  endLevelSession: () => void;
  recordPracticeSession: (session: Omit<PracticeSession, 'id' | 'startTime' | 'endTime'>) => void;
  getTodaySessions: () => PracticeSession[];
  getSkillTrends: () => Record<SkillType, SkillTrendPoint[]>;
  getFailedLevels: () => FailedLevelRecord[];
  checkCanEnterLevel: (levelId: number) => { allowed: boolean; reason?: 'time' | 'difficulty' | 'locked' };
}

function migrateReport(report: WeeklyReport): WeeklyReport {
  return {
    ...report,
    masteredRhythms: report.masteredRhythms ?? [],
    masteredKeys: report.masteredKeys ?? [],
  };
}

interface DailyTimeData {
  date: string;
  minutes: number;
}

function loadDailyTime(): DailyTimeData {
  const today = new Date().toDateString();
  const data = loadFromStorage<DailyTimeData>(STORAGE_KEYS.dailyTime, { date: today, minutes: 0 });
  if (data.date !== today) {
    return { date: today, minutes: 0 };
  }
  return data;
}

function saveDailyTime(minutes: number): void {
  const data: DailyTimeData = {
    date: new Date().toDateString(),
    minutes,
  };
  saveToStorage(STORAGE_KEYS.dailyTime, data);
}

export const useGameStore = create<GameStore>((set, get) => {
  const dailyTime = loadDailyTime();

  return {
    player: loadFromStorage(STORAGE_KEYS.player, createDefaultPlayer()),
    progress: loadFromStorage(STORAGE_KEYS.progress, createDefaultProgress()),
    inventory: loadFromStorage(STORAGE_KEYS.inventory, []),
    settings: loadFromStorage(STORAGE_KEYS.settings, createDefaultSettings()),
    weeklyReport: migrateReport(loadFromStorage(STORAGE_KEYS.weeklyReport, createDefaultWeeklyReport())),
    todayPlayTime: dailyTime.minutes,
    lastPlayDate: dailyTime.date,
    levelSessionStartTime: null,

    initStore: () => {
      const dailyTime = loadDailyTime();
      set({ todayPlayTime: dailyTime.minutes, lastPlayDate: dailyTime.date });
    },

  setPlayerName: (name) => {
    const player = { ...get().player, name };
    saveToStorage(STORAGE_KEYS.player, player);
    set({ player });
  },

  addCoins: (amount) => {
    const player = { ...get().player, coins: get().player.coins + amount };
    saveToStorage(STORAGE_KEYS.player, player);
    set({ player });
  },

  spendCoins: (amount) => {
    const { player } = get();
    if (player.coins < amount) return false;
    const updated = { ...player, coins: player.coins - amount };
    saveToStorage(STORAGE_KEYS.player, updated);
    set({ player: updated });
    return true;
  },

  completeLevel: (levelId, accuracy) => {
    const { progress, player, weeklyReport } = get();
    const idx = progress.findIndex(p => p.levelId === levelId);
    if (idx === -1) return { stars: 0, coins: 0, passed: false };

    let stars = 0;
    if (accuracy >= 0.9) stars = 3;
    else if (accuracy >= 0.7) stars = 2;
    else if (accuracy >= 0.5) stars = 1;

    const passed = stars >= 1;
    const prev = progress[idx];
    const improved = stars > prev.stars;
    const isFirstPass = !prev.completedAt && passed;

    const updated = [...progress];

    if (passed) {
      updated[idx] = {
        ...updated[idx],
        stars: Math.max(updated[idx].stars, stars),
        bestAccuracy: Math.max(updated[idx].bestAccuracy, accuracy),
        completedAt: new Date().toISOString(),
      };
    } else {
      updated[idx] = {
        ...updated[idx],
        bestAccuracy: Math.max(updated[idx].bestAccuracy, accuracy),
      };
    }

    let coinReward = 0;
    if (passed && improved) {
      const starGain = stars - prev.stars;
      coinReward = starGain * 10;
      if (LEVELS.find(l => l.id === levelId)?.isBoss && isFirstPass) {
        coinReward += 50;
      }
      if (isFirstPass) {
        coinReward += 5;
      }
    }

    const updatedPlayer = { ...player, coins: player.coins + coinReward };

    saveToStorage(STORAGE_KEYS.progress, updated);
    saveToStorage(STORAGE_KEYS.player, updatedPlayer);
    set({ progress: updated, player: updatedPlayer });

    if (passed) {
      get().unlockNextLevel(levelId);
    }

    if (passed) {
      const report = { ...weeklyReport };
      report.levelsCompleted = report.levelsCompleted + 1;
      report.totalPracticeTime = report.totalPracticeTime + 2;

      const lvl = LEVELS.find(l => l.id === levelId);
      if (lvl) {
        const skillKey = lvl.skillType;
        const currentScore = report.scores[skillKey];
        const newScore = currentScore === 0 ? accuracy * 100 : (currentScore * 0.6) + (accuracy * 100 * 0.4);
        report.scores = { ...report.scores, [skillKey]: newScore };

        const entries = Object.entries(report.scores) as [SkillType, number][];
        const sorted = entries.sort((a, b) => b[1] - a[1]);
        report.strongestSkill = sorted[0][0];
        report.weakestSkill = sorted[sorted.length - 1][0];
      }

      if (accuracy >= 0.7 && report.masteredRhythms.length < ALL_RHYTHM_PATTERNS.length) {
        const nextRhythm = ALL_RHYTHM_PATTERNS.find(r => !report.masteredRhythms.includes(r));
        if (nextRhythm) {
          report.masteredRhythms = [...report.masteredRhythms, nextRhythm];
        }
      }

      if (accuracy >= 0.8 && report.masteredKeys.length < ALL_KEY_SIGNATURES.length) {
        const nextKey = ALL_KEY_SIGNATURES.find(k => !report.masteredKeys.includes(k));
        if (nextKey) {
          report.masteredKeys = [...report.masteredKeys, nextKey];
        }
      }

      saveToStorage(STORAGE_KEYS.weeklyReport, report);
      set({ weeklyReport: report });
    }

    return { stars, coins: coinReward, passed };
  },

  unlockNextLevel: (levelId) => {
    const { progress } = get();
    const currentLevel = LEVELS.find(l => l.id === levelId);
    if (!currentLevel) return;

    const areaLevels = LEVELS.filter(l => l.areaId === currentLevel.areaId)
      .sort((a, b) => a.id - b.id);
    const currentIdx = areaLevels.findIndex(l => l.id === levelId);

    const updated = [...progress];

    if (currentIdx < areaLevels.length - 1) {
      const nextLevelId = areaLevels[currentIdx + 1].id;
      const nextIdx = updated.findIndex(p => p.levelId === nextLevelId);
      if (nextIdx !== -1 && !updated[nextIdx].unlocked) {
        updated[nextIdx] = { ...updated[nextIdx], unlocked: true };
      }
    }

    const allAreaCompleted = areaLevels
      .filter(l => !l.isBoss)
      .every(l => updated.find(p => p.levelId === l.id)?.completedAt);
    
    if (allAreaCompleted) {
      const boss = areaLevels.find(l => l.isBoss);
      if (boss) {
        const bossIdx = updated.findIndex(p => p.levelId === boss.id);
        if (bossIdx !== -1 && !updated[bossIdx].unlocked) {
          updated[bossIdx] = { ...updated[bossIdx], unlocked: true };
        }
      }
    }

    const bossCompleted = areaLevels.find(l => l.isBoss)?.id;
    if (bossCompleted && updated.find(p => p.levelId === bossCompleted)?.completedAt) {
      const nextArea = AREAS.find(a => a.orderIndex === currentLevel.areaId + 1);
      if (nextArea) {
        const nextAreaFirstLevel = LEVELS.find(l => l.areaId === nextArea.id && !l.isBoss);
        if (nextAreaFirstLevel) {
          const firstIdx = updated.findIndex(p => p.levelId === nextAreaFirstLevel.id);
          if (firstIdx !== -1 && !updated[firstIdx].unlocked) {
            updated[firstIdx] = { ...updated[firstIdx], unlocked: true };
          }
        }
      }
    }

    saveToStorage(STORAGE_KEYS.progress, updated);
    set({ progress: updated });
  },

  purchaseItem: (itemId) => {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item) return false;
    if (!get().spendCoins(item.price)) return false;

    const inventory = [...get().inventory, { playerId: 'player_1', itemId, equipped: false }];
    saveToStorage(STORAGE_KEYS.inventory, inventory);
    set({ inventory });
    return true;
  },

  equipItem: (itemId) => {
    const { inventory } = get();
    const item = ITEMS.find(i => i.id === itemId);
    if (!item) return;

    const updated = inventory.map(inv => {
      if (inv.itemId === itemId) return { ...inv, equipped: true };
      const invItem = ITEMS.find(i => i.id === inv.itemId);
      if (invItem?.type === item.type && inv.equipped) return { ...inv, equipped: false };
      return inv;
    });

    saveToStorage(STORAGE_KEYS.inventory, updated);
    set({ inventory: updated });
  },

  unequipItem: (itemId) => {
    const { inventory } = get();
    const updated = inventory.map(inv =>
      inv.itemId === itemId ? { ...inv, equipped: false } : inv
    );
    saveToStorage(STORAGE_KEYS.inventory, updated);
    set({ inventory: updated });
  },

  updateSettings: (newSettings) => {
    const settings = { ...get().settings, ...newSettings };
    saveToStorage(STORAGE_KEYS.settings, settings);
    set({ settings });
  },

  verifyPin: (pin) => get().settings.pinCode === pin,

  updateWeeklyReport: (skillType, score) => {
    const report = { ...get().weeklyReport };
    report.scores = { ...report.scores, [skillType]: (report.scores[skillType] + score) / 2 };
    
    const entries = Object.entries(report.scores) as [SkillType, number][];
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    report.strongestSkill = sorted[0][0];
    report.weakestSkill = sorted[sorted.length - 1][0];

    saveToStorage(STORAGE_KEYS.weeklyReport, report);
    set({ weeklyReport: report });
  },

  addPlayTime: (minutes) => {
    const dailyTime = loadDailyTime();
    const newMinutes = dailyTime.minutes + minutes;
    saveDailyTime(newMinutes);
    set({ todayPlayTime: newMinutes, lastPlayDate: dailyTime.date });
  },

  isDailyTimeExceeded: () => {
    const dailyTime = loadDailyTime();
    const settings = get().settings;
    return dailyTime.minutes >= settings.dailyTimeLimit;
  },

  startLevelSession: () => {
    if (!get().isDailyTimeExceeded()) {
      set({ levelSessionStartTime: Date.now() });
    }
  },

  endLevelSession: () => {
    const { levelSessionStartTime } = get();
    if (levelSessionStartTime) {
      const elapsedMs = Date.now() - levelSessionStartTime;
      const elapsedMinutes = Math.max(0.1, elapsedMs / 60000);
      const roundedMinutes = Math.round(elapsedMinutes * 10) / 10;
      get().addPlayTime(roundedMinutes);
    }
    set({ levelSessionStartTime: null });
  },

  checkCanEnterLevel: (levelId) => {
    const { isLevelUnlocked, settings, isDailyTimeExceeded } = get();
    const level = getLevelById(levelId);

    if (!isLevelUnlocked(levelId)) {
      return { allowed: false, reason: 'locked' as const };
    }

    if (isDailyTimeExceeded()) {
      return { allowed: false, reason: 'time' as const };
    }

    if (level) {
      const diffMap: Record<string, number> = { easy: 1, medium: 2, hard: 3 };
      const diffLevel = diffMap[level.difficulty] ?? 1;
      if (diffLevel > settings.maxDifficulty) {
        return { allowed: false, reason: 'difficulty' as const };
      }
    }

    return { allowed: true };
  },

  recordPracticeSession: (sessionData) => {
    const today = new Date().toDateString();
    const fullSession: PracticeSession = {
      ...sessionData,
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
    };

    const log = loadFromStorage<Record<string, PracticeSession[]>>(STORAGE_KEYS.practiceLog, {});
    if (!log[today]) log[today] = [];
    log[today].push(fullSession);
    saveToStorage(STORAGE_KEYS.practiceLog, log);

    const trend = loadFromStorage<Record<string, SkillTrendPoint[]>>(STORAGE_KEYS.skillTrend, {});
    const skillKey = sessionData.skillType;
    if (!trend[skillKey]) trend[skillKey] = [];
    const dateStr = new Date().toISOString().split('T')[0];
    const lastPoint = trend[skillKey][trend[skillKey].length - 1];
    if (lastPoint?.date === dateStr) {
      lastPoint.score = (lastPoint.score + sessionData.skillScore) / 2;
    } else {
      trend[skillKey].push({ date: dateStr, score: sessionData.skillScore });
    }
    if (trend[skillKey].length > 7) trend[skillKey].shift();
    saveToStorage(STORAGE_KEYS.skillTrend, trend);

    if (!sessionData.passed) {
      const failed = loadFromStorage<Record<number, FailedLevelRecord>>(STORAGE_KEYS.failedLevels, {});
      const levelKey = sessionData.levelId;
      if (!failed[levelKey]) {
        failed[levelKey] = {
          levelId: sessionData.levelId,
          levelName: sessionData.levelName,
          areaId: sessionData.areaId,
          areaName: sessionData.areaName,
          failCount: 0,
          lastAttempt: new Date().toISOString(),
          avgAccuracy: 0,
        };
      }
      failed[levelKey].failCount += 1;
      failed[levelKey].lastAttempt = new Date().toISOString();
      failed[levelKey].avgAccuracy =
        (failed[levelKey].avgAccuracy * (failed[levelKey].failCount - 1) + sessionData.accuracy) /
        failed[levelKey].failCount;
      saveToStorage(STORAGE_KEYS.failedLevels, failed);
    }
  },

  getTodaySessions: () => {
    const today = new Date().toDateString();
    const log = loadFromStorage<Record<string, PracticeSession[]>>(STORAGE_KEYS.practiceLog, {});
    return log[today] ?? [];
  },

  getSkillTrends: () => {
    const defaultTrends: Record<SkillType, SkillTrendPoint[]> = {
      steady_beat: [],
      sight_read: [],
      interval_jump: [],
      hand_switch: [],
      continuous: [],
    };
    return loadFromStorage<Record<SkillType, SkillTrendPoint[]>>(STORAGE_KEYS.skillTrend, defaultTrends);
  },

  getFailedLevels: () => {
    const failed = loadFromStorage<Record<number, FailedLevelRecord>>(STORAGE_KEYS.failedLevels, {});
    return Object.values(failed).sort((a, b) => b.failCount - a.failCount);
  },

  getLevelProgress: (levelId) => get().progress.find(p => p.levelId === levelId),

  getEquippedItems: () => get().inventory.filter(i => i.equipped),

  getOwnedItems: () => get().inventory,

  isLevelUnlocked: (levelId) => {
    const p = get().progress.find(p => p.levelId === levelId);
    return p?.unlocked ?? false;
  },

  getAreaProgress: (areaId) => {
    const areaLevelIds = LEVELS.filter(l => l.areaId === areaId).map(l => l.id);
    const areaProgress = get().progress.filter(p => areaLevelIds.includes(p.levelId));
    return {
      completed: areaProgress.filter(p => p.completedAt).length,
      total: areaLevelIds.length,
      stars: areaProgress.reduce((sum, p) => sum + p.stars, 0),
    };
  },

  getSkillScores: () => get().weeklyReport.scores,
};
});
