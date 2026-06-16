import { Area, Level, Note, LevelMusicData, Item } from '@/types';

export const AREAS: Area[] = [
  {
    id: 1,
    name: '迷雾森林',
    theme: 'forest',
    bgColor: '#E8F5E9',
    accentColor: '#4CAF50',
    icon: '🌳',
    orderIndex: 1,
    description: '在神秘的森林中学会稳拍和识谱',
  },
  {
    id: 2,
    name: '珊瑚海岛',
    theme: 'island',
    bgColor: '#E3F2FD',
    accentColor: '#64B5F6',
    icon: '🏝️',
    orderIndex: 2,
    description: '在海浪声中掌握跳进和节奏',
  },
  {
    id: 3,
    name: '水晶城堡',
    theme: 'castle',
    bgColor: '#F3E5F5',
    accentColor: '#AB47BC',
    icon: '🏰',
    orderIndex: 3,
    description: '城堡里练习左右手的灵活切换',
  },
  {
    id: 4,
    name: '熔岩火山',
    theme: 'volcano',
    bgColor: '#FBE9E7',
    accentColor: '#FF5722',
    icon: '🌋',
    orderIndex: 4,
    description: '在火山口挑战更快的节拍',
  },
  {
    id: 5,
    name: '星辰穹顶',
    theme: 'cosmos',
    bgColor: '#EDE7F6',
    accentColor: '#7C4DFF',
    icon: '🌌',
    orderIndex: 5,
    description: '在星空下完成最终视奏考验',
  },
];

function createMusicData(bpm: number, measuresData: Note[][]): LevelMusicData {
  return {
    bpm,
    timeSignature: [4, 4],
    measures: measuresData.map(notes => ({ notes })),
  };
}

const forestLevels: Level[] = [
  {
    id: 101, areaId: 1, name: '森林小径', skillType: 'steady_beat',
    difficulty: 'easy', bpm: 60, isBoss: false, description: '沿着小路保持稳定的节拍',
    musicData: createMusicData(60, [
      [{ pitch: 'C4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'D4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'E4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'C4', duration: 1, hand: 'right', beatPosition: 1 }],
    ]),
  },
  {
    id: 102, areaId: 1, name: '蘑菇圆舞', skillType: 'steady_beat',
    difficulty: 'easy', bpm: 66, isBoss: false, description: '蘑菇丛中的节拍练习',
    musicData: createMusicData(66, [
      [{ pitch: 'C4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'C4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }],
    ]),
  },
  {
    id: 103, areaId: 1, name: '萤火虫之歌', skillType: 'sight_read',
    difficulty: 'easy', bpm: 60, isBoss: false, description: '跟着萤火虫认识不同的音高',
    musicData: createMusicData(60, [
      [{ pitch: 'E4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'F4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'A4', duration: 1, hand: 'right', beatPosition: 1 }],
    ]),
  },
  {
    id: 104, areaId: 1, name: '树屋节拍', skillType: 'sight_read',
    difficulty: 'easy', bpm: 66, isBoss: false, description: '在树屋上辨识音高',
    musicData: createMusicData(66, [
      [{ pitch: 'C4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'E4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'C5', duration: 1, hand: 'right', beatPosition: 1 }],
    ]),
  },
  {
    id: 105, areaId: 1, name: '精灵之舞', skillType: 'interval_jump',
    difficulty: 'easy', bpm: 60, isBoss: false, description: '和精灵一起跳跃音程',
    musicData: createMusicData(60, [
      [{ pitch: 'C4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'E4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'C4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }],
    ]),
  },
  {
    id: 106, areaId: 1, name: '晨露旋律', skillType: 'hand_switch',
    difficulty: 'easy', bpm: 56, isBoss: false, description: '左右手交替弹奏晨露',
    musicData: createMusicData(56, [
      [{ pitch: 'C4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'G3', duration: 1, hand: 'left', beatPosition: 3 }],
      [{ pitch: 'E4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'C3', duration: 1, hand: 'left', beatPosition: 3 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'G3', duration: 1, hand: 'left', beatPosition: 3 }],
      [{ pitch: 'C5', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'C3', duration: 1, hand: 'left', beatPosition: 3 }],
    ]),
  },
  {
    id: 199, areaId: 1, name: '森林守护者', skillType: 'continuous',
    difficulty: 'medium', bpm: 72, isBoss: true, description: '击败森林Boss，证明你的实力！',
    musicData: createMusicData(72, [
      [{ pitch: 'C4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'D4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'E4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'G3', duration: 1, hand: 'left', beatPosition: 3 }],
      [{ pitch: 'F4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'C3', duration: 1, hand: 'left', beatPosition: 3 }],
      [{ pitch: 'A4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'C5', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'G3', duration: 1, hand: 'left', beatPosition: 3 }],
    ]),
  },
];

const islandLevels: Level[] = [
  {
    id: 201, areaId: 2, name: '浪花节拍', skillType: 'steady_beat',
    difficulty: 'easy', bpm: 72, isBoss: false, description: '跟着海浪的节奏',
    musicData: createMusicData(72, [
      [{ pitch: 'C4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'E4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'C5', duration: 1, hand: 'right', beatPosition: 1 }],
    ]),
  },
  {
    id: 202, areaId: 2, name: '贝壳之歌', skillType: 'sight_read',
    difficulty: 'medium', bpm: 72, isBoss: false, description: '贝壳中藏着不同音符',
    musicData: createMusicData(72, [
      [{ pitch: 'D4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'F4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'A4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'D5', duration: 1, hand: 'right', beatPosition: 1 }],
    ]),
  },
  {
    id: 203, areaId: 2, name: '海盗进行曲', skillType: 'interval_jump',
    difficulty: 'medium', bpm: 76, isBoss: false, description: '跳进音符如海盗船颠簸',
    musicData: createMusicData(76, [
      [{ pitch: 'C4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'E4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'C5', duration: 1, hand: 'right', beatPosition: 1 }],
    ]),
  },
  {
    id: 204, areaId: 2, name: '海豚二重奏', skillType: 'hand_switch',
    difficulty: 'medium', bpm: 72, isBoss: false, description: '和海豚一起双手合奏',
    musicData: createMusicData(72, [
      [{ pitch: 'E4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'C3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'E3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'A4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'F3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'C3', duration: 1, hand: 'left', beatPosition: 1 }],
    ]),
  },
  {
    id: 205, areaId: 2, name: '椰子回旋', skillType: 'steady_beat',
    difficulty: 'medium', bpm: 80, isBoss: false, description: '更快节拍考验稳定性',
    musicData: createMusicData(80, [
      [{ pitch: 'C4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'C4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'A4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'A4', duration: 1, hand: 'right', beatPosition: 1 }],
    ]),
  },
  {
    id: 299, areaId: 2, name: '深海巨兽', skillType: 'continuous',
    difficulty: 'medium', bpm: 84, isBoss: true, description: '挑战深海Boss，征服海岛！',
    musicData: createMusicData(84, [
      [{ pitch: 'C4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'E4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'C3', duration: 1, hand: 'left', beatPosition: 3 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'A4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'F3', duration: 1, hand: 'left', beatPosition: 3 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'E4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'C5', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'C3', duration: 1, hand: 'left', beatPosition: 3 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }],
    ]),
  },
];

const castleLevels: Level[] = [
  {
    id: 301, areaId: 3, name: '城门号角', skillType: 'sight_read',
    difficulty: 'medium', bpm: 80, isBoss: false, description: '吹响号角识别音高',
    musicData: createMusicData(80, [
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'A4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'B4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'C5', duration: 1, hand: 'right', beatPosition: 1 }],
    ]),
  },
  {
    id: 302, areaId: 3, name: '水晶台阶', skillType: 'interval_jump',
    difficulty: 'medium', bpm: 80, isBoss: false, description: '在台阶间跳跃音程',
    musicData: createMusicData(80, [
      [{ pitch: 'C4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'F4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'A4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'F4', duration: 1, hand: 'right', beatPosition: 1 }],
    ]),
  },
  {
    id: 303, areaId: 3, name: '骑士训练', skillType: 'hand_switch',
    difficulty: 'hard', bpm: 80, isBoss: false, description: '骑士的双手交替训练',
    musicData: createMusicData(80, [
      [{ pitch: 'C5', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'C3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'D5', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'G3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'E5', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'C3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'F5', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'G3', duration: 1, hand: 'left', beatPosition: 1 }],
    ]),
  },
  {
    id: 304, areaId: 3, name: '魔法回廊', skillType: 'sight_read',
    difficulty: 'hard', bpm: 88, isBoss: false, description: '在魔法走廊中快速识谱',
    musicData: createMusicData(88, [
      [{ pitch: 'E4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'B4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'D5', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'C5', duration: 1, hand: 'right', beatPosition: 1 }],
    ]),
  },
  {
    id: 305, areaId: 3, name: '王座之阶', skillType: 'interval_jump',
    difficulty: 'hard', bpm: 84, isBoss: false, description: '王座前的大跳训练',
    musicData: createMusicData(84, [
      [{ pitch: 'C4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'C5', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'E5', duration: 1, hand: 'right', beatPosition: 1 }],
    ]),
  },
  {
    id: 399, areaId: 3, name: '冰霜女皇', skillType: 'continuous',
    difficulty: 'hard', bpm: 92, isBoss: true, description: '与冰霜女皇的终极对决！',
    musicData: createMusicData(92, [
      [{ pitch: 'C4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'C3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'E4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'G3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'A4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'E3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'F4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'E4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'C3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'D4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'C5', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'G3', duration: 1, hand: 'left', beatPosition: 1 }],
    ]),
  },
];

const volcanoLevels: Level[] = [
  {
    id: 401, areaId: 4, name: '岩浆节拍', skillType: 'steady_beat',
    difficulty: 'hard', bpm: 96, isBoss: false, description: '在岩浆边保持冷静的节拍',
    musicData: createMusicData(96, [
      [{ pitch: 'C4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'D4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'E4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'F4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'A4', duration: 1, hand: 'right', beatPosition: 1 }],
    ]),
  },
  {
    id: 402, areaId: 4, name: '火焰跳跃', skillType: 'interval_jump',
    difficulty: 'hard', bpm: 100, isBoss: false, description: '跳过火焰沟壑',
    musicData: createMusicData(100, [
      [{ pitch: 'C4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'A4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'F4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'D5', duration: 1, hand: 'right', beatPosition: 1 }],
    ]),
  },
  {
    id: 403, areaId: 4, name: '熔炉双奏', skillType: 'hand_switch',
    difficulty: 'hard', bpm: 96, isBoss: false, description: '在熔炉中锤炼双手配合',
    musicData: createMusicData(96, [
      [{ pitch: 'E4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'C3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'E3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'A4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'F3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'B4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'G3', duration: 1, hand: 'left', beatPosition: 1 }],
    ]),
  },
  {
    id: 404, areaId: 4, name: '火山灰谱', skillType: 'sight_read',
    difficulty: 'hard', bpm: 100, isBoss: false, description: '在烟雾中快速识谱',
    musicData: createMusicData(100, [
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'B4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'D5', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'F5', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'E5', duration: 1, hand: 'right', beatPosition: 1 }],
    ]),
  },
  {
    id: 499, areaId: 4, name: '烈焰魔龙', skillType: 'continuous',
    difficulty: 'hard', bpm: 108, isBoss: true, description: '击败烈焰魔龙！',
    musicData: createMusicData(108, [
      [{ pitch: 'C4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'C3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'E4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'G3', duration: 1, hand: 'left', beatPosition: 3 }],
      [{ pitch: 'C5', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'B4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'E3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'A4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'C3', duration: 1, hand: 'left', beatPosition: 3 }],
      [{ pitch: 'F4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'E4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'G3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'D4', duration: 1, hand: 'right', beatPosition: 1 }],
    ]),
  },
];

const cosmosLevels: Level[] = [
  {
    id: 501, areaId: 5, name: '星尘旋律', skillType: 'sight_read',
    difficulty: 'hard', bpm: 104, isBoss: false, description: '在星尘中辨识音符',
    musicData: createMusicData(104, [
      [{ pitch: 'E4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'A4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'C5', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'E5', duration: 1, hand: 'right', beatPosition: 1 }],
    ]),
  },
  {
    id: 502, areaId: 5, name: '银河跳跃', skillType: 'interval_jump',
    difficulty: 'hard', bpm: 108, isBoss: false, description: '在星系间大跳',
    musicData: createMusicData(108, [
      [{ pitch: 'C4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'C5', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'E5', duration: 1, hand: 'right', beatPosition: 1 }],
    ]),
  },
  {
    id: 503, areaId: 5, name: '星云双手', skillType: 'hand_switch',
    difficulty: 'hard', bpm: 104, isBoss: false, description: '星云中的双手交织',
    musicData: createMusicData(104, [
      [{ pitch: 'C5', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'C3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'E5', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'G3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'G5', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'C3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'A5', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'E3', duration: 1, hand: 'left', beatPosition: 1 }],
    ]),
  },
  {
    id: 504, areaId: 5, name: '光年节拍', skillType: 'steady_beat',
    difficulty: 'hard', bpm: 112, isBoss: false, description: '跨越光年的稳定节拍',
    musicData: createMusicData(112, [
      [{ pitch: 'C4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'D4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'E4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'F4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'A4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'B4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'C5', duration: 1, hand: 'right', beatPosition: 1 }],
    ]),
  },
  {
    id: 599, areaId: 5, name: '星穹之主', skillType: 'continuous',
    difficulty: 'hard', bpm: 120, isBoss: true, description: '最终Boss！征服星空！',
    musicData: createMusicData(120, [
      [{ pitch: 'C4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'C3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'E4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'G3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'C5', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'D5', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'E3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'E5', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'C5', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'C3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'E4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'G3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'C5', duration: 1, hand: 'right', beatPosition: 1 }],
      [{ pitch: 'G4', duration: 1, hand: 'right', beatPosition: 1 }, { pitch: 'E3', duration: 1, hand: 'left', beatPosition: 1 }],
      [{ pitch: 'C5', duration: 1, hand: 'right', beatPosition: 1 }],
    ]),
  },
];

export const LEVELS: Level[] = [
  ...forestLevels,
  ...islandLevels,
  ...castleLevels,
  ...volcanoLevels,
  ...cosmosLevels,
];

export const ITEMS: Item[] = [
  { id: 1, name: '森林冒险服', type: 'costume', price: 80, description: '适合森林探险的绿色套装', icon: '🧥', unlockCondition: '通过森林区域', rarity: 'common' },
  { id: 2, name: '海岛草帽', type: 'costume', price: 120, description: '海岛风格的遮阳帽', icon: '👒', unlockCondition: '通过海岛区域', rarity: 'rare' },
  { id: 3, name: '骑士铠甲', type: 'costume', price: 200, description: '闪亮的水晶城堡铠甲', icon: '🛡️', unlockCondition: '通过城堡区域', rarity: 'epic' },
  { id: 4, name: '星辰斗篷', type: 'costume', price: 300, description: '闪耀着星光的斗篷', icon: '✨', unlockCondition: '通关全部区域', rarity: 'legendary' },
  { id: 5, name: '节拍先锋徽章', type: 'badge', price: 50, description: '稳拍能力达标认证', icon: '🥁', unlockCondition: '稳拍评分达到80%', rarity: 'common' },
  { id: 6, name: '识谱达人徽章', type: 'badge', price: 80, description: '识谱能力达标认证', icon: '🎼', unlockCondition: '识谱评分达到80%', rarity: 'rare' },
  { id: 7, name: '跳跃大师徽章', type: 'badge', price: 100, description: '跳进能力达标认证', icon: '🦘', unlockCondition: '跳进评分达到80%', rarity: 'rare' },
  { id: 8, name: '全能王者徽章', type: 'badge', price: 250, description: '所有技能达标认证', icon: '👑', unlockCondition: '全部技能80%以上', rarity: 'legendary' },
  { id: 9, name: '木琴皮肤', type: 'instrument', price: 60, description: '温暖的木质钢琴外观', icon: '🎹', unlockCondition: '完成第一个关卡', rarity: 'common' },
  { id: 10, name: '水晶琴键', type: 'instrument', price: 150, description: '透明的蓝色水晶键', icon: '💎', unlockCondition: '通过城堡区域', rarity: 'epic' },
  { id: 11, name: '星空钢琴', type: 'instrument', price: 280, description: '带有星空特效的钢琴', icon: '🌟', unlockCondition: '通关全部区域', rarity: 'legendary' },
  { id: 12, name: '火焰键盘', type: 'instrument', price: 180, description: '燃烧着火焰的键盘', icon: '🔥', unlockCondition: '通过火山区域', rarity: 'epic' },
];

export function getLevelsByArea(areaId: number): Level[] {
  return LEVELS.filter(l => l.areaId === areaId);
}

export function getBossLevel(areaId: number): Level | undefined {
  return LEVELS.find(l => l.areaId === areaId && l.isBoss);
}

export function getAreaById(id: number): Area | undefined {
  return AREAS.find(a => a.id === id);
}

export function getLevelById(id: number): Level | undefined {
  return LEVELS.find(l => l.id === id);
}
