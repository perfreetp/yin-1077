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
}

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
