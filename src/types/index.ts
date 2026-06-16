export type SkillType = 'steady_beat' | 'sight_read' | 'interval_jump' | 'hand_switch' | 'continuous';

export interface Note {
  pitch: string;
  duration: number;
  hand: 'left' | 'right';
  beatPosition: number;
}

export interface Measure {
  notes: Note[];
}

export interface LevelMusicData {
  bpm: number;
  timeSignature: [number, number];
  measures: Measure[];
}

export interface Area {
  id: number;
  name: string;
  theme: string;
  bgColor: string;
  accentColor: string;
  icon: string;
  orderIndex: number;
  description: string;
}

export interface Level {
  id: number;
  areaId: number;
  name: string;
  skillType: SkillType;
  difficulty: 'easy' | 'medium' | 'hard';
  bpm: number;
  musicData: LevelMusicData;
  isBoss: boolean;
  description: string;
}

export interface Player {
  id: string;
  name: string;
  coins: number;
  avatarId: number;
  totalPlayTime: number;
  createdAt: string;
  currentAreaId: number;
}

export interface Progress {
  playerId: string;
  levelId: number;
  stars: number;
  unlocked: boolean;
  bestAccuracy: number;
  completedAt: string | null;
}

export type ItemType = 'costume' | 'badge' | 'instrument';

export interface Item {
  id: number;
  name: string;
  type: ItemType;
  price: number;
  description: string;
  icon: string;
  unlockCondition: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Inventory {
  playerId: string;
  itemId: number;
  equipped: boolean;
}

export interface Settings {
  playerId: string;
  dailyTimeLimit: number;
  maxDifficulty: number;
  pinCode: string;
}

export interface SkillScore {
  steady_beat: number;
  sight_read: number;
  interval_jump: number;
  hand_switch: number;
  continuous: number;
}

export interface WeeklyReport {
  weekStart: string;
  scores: SkillScore;
  totalPracticeTime: number;
  levelsCompleted: number;
  strongestSkill: SkillType;
  weakestSkill: SkillType;
  masteredRhythms: string[];
  masteredKeys: string[];
}

export type PracticeSpeed = 'normal' | 'slow' | 'phrase';
export type FocusType = 'pitch' | 'rhythm' | 'completeness';

export interface PracticeSession {
  id: string;
  levelId: number;
  levelName: string;
  areaId: number;
  areaName: string;
  skillType: SkillType;
  speed: PracticeSpeed;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  accuracy: number;
  passed: boolean;
  stars: number;
  wrongNoteCount: number;
  missedNoteCount: number;
  rhythmDeviationAvg: number;
  rhythmEarlyCount: number;
  rhythmLateCount: number;
  skillScore: number;
  practiceFocus?: FocusType;
}

export interface DailyPracticeLog {
  date: string;
  sessions: PracticeSession[];
}

export interface DailySummary {
  date: string;
  totalMinutes: number;
  sessionCount: number;
  passedCount: number;
  weakestSkill: SkillType;
  focusStats: Record<FocusType, number>;
}

export interface SkillTrendPoint {
  date: string;
  score: number;
}

export interface SkillTrend {
  skill: SkillType;
  points: SkillTrendPoint[];
  trend: 'improving' | 'stable' | 'declining';
}

export interface FailedLevelRecord {
  levelId: number;
  levelName: string;
  areaId: number;
  areaName: string;
  failCount: number;
  lastAttempt: string;
  avgAccuracy: number;
}

export interface LastSessionResult {
  accuracy: number;
  wrongNoteCount: number;
  missedNoteCount: number;
  rhythmDeviationAvg: number;
  rhythmEarlyCount: number;
  rhythmLateCount: number;
  suggestedFocus: FocusType;
}

export const FOCUS_LABELS: Record<FocusType, string> = {
  pitch: '音高准确',
  rhythm: '节拍稳定',
  completeness: '不漏音',
};

export const FOCUS_ICONS: Record<FocusType, string> = {
  pitch: '🎯',
  rhythm: '🎵',
  completeness: '✅',
};

export const FOCUS_TIPS: Record<FocusType, string> = {
  pitch: '先看清五线谱上的音高位置再按键',
  rhythm: '在心里默数节拍，或跟着节拍器打拍',
  completeness: '不要跳过任何音符，哪怕慢一点也没关系',
};

export const ALL_RHYTHM_PATTERNS = [
  '四分音符', '二分音符', '全音符', '八分音符',
  '四分休止', '二分休止',
  '附点二分', '附点四分',
];

export const ALL_KEY_SIGNATURES = [
  'C大调', 'G大调', 'F大调', 'D大调',
  'A小调', 'E小调',
];

export interface GameState {
  currentNoteIndex: number;
  correctCount: number;
  errorCount: number;
  isPlaying: boolean;
  beatPosition: number;
  rhythmDeviation: number;
  characterPosition: number;
  obstacleActive: boolean;
  obstacleType: string | null;
}

export const SKILL_LABELS: Record<SkillType, string> = {
  steady_beat: '稳拍',
  sight_read: '识谱',
  interval_jump: '跳进',
  hand_switch: '左右手',
  continuous: '连贯',
};

export const SKILL_DESCRIPTIONS: Record<SkillType, string> = {
  steady_beat: '保持稳定的节奏感',
  sight_read: '快速辨识不同音高',
  interval_jump: '准确演奏音程跳跃',
  hand_switch: '灵活切换左右手',
  continuous: '综合连贯视奏能力',
};

export const RARITY_COLORS: Record<string, string> = {
  common: '#9E9E9E',
  rare: '#42A5F5',
  epic: '#AB47BC',
  legendary: '#FFD54F',
};
