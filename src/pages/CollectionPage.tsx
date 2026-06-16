import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Target, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { SKILL_LABELS, SKILL_DESCRIPTIONS } from '@/types';
import type { SkillType } from '@/types';
import { AREAS } from '@/data/gameData';

type TabType = 'skills' | 'ability';

const SKILL_ICONS: Record<SkillType, string> = {
  steady_beat: '🥁',
  sight_read: '🎼',
  interval_jump: '🦘',
  hand_switch: '🤝',
  continuous: '🎯',
};

const SKILL_ORDER: SkillType[] = [
  'steady_beat',
  'sight_read',
  'interval_jump',
  'hand_switch',
  'continuous',
];

const TAB_CONFIG: { key: TabType; label: string; icon: typeof BookOpen }[] = [
  { key: 'skills', label: '技能图谱', icon: BookOpen },
  { key: 'ability', label: '能力地图', icon: Target },
];

function getProgressColor(pct: number): string {
  if (pct >= 80) return 'bg-green-500';
  if (pct >= 50) return 'bg-yellow-400';
  return 'bg-coral';
}

function getBarBgColor(pct: number): string {
  if (pct >= 80) return 'bg-green-100';
  if (pct >= 50) return 'bg-yellow-100';
  return 'bg-red-100';
}

function RadarChart({ scores, strongest, weakest }: { scores: Record<SkillType, number>; strongest: SkillType; weakest: SkillType }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 110;
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const points = SKILL_ORDER.map((skill, i) => {
    const angle = (Math.PI * 2 * i) / SKILL_ORDER.length - Math.PI / 2;
    const val = Math.min(scores[skill] / 100, 1);
    const r = maxR * Math.max(val, 0.05);
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      skill,
      angle,
    };
  });

  const areaPath = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {levels.map((level, li) => {
        const ringPoints = SKILL_ORDER.map((_, i) => {
          const angle = (Math.PI * 2 * i) / SKILL_ORDER.length - Math.PI / 2;
          const r = maxR * level;
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        }).join(' ');
        return (
          <polygon
            key={li}
            points={ringPoints}
            fill="none"
            stroke={li === levels.length - 1 ? '#4ade80' : '#d1d5db'}
            strokeWidth={li === levels.length - 1 ? 2 : 1}
            opacity={li === levels.length - 1 ? 0.6 : 0.3}
          />
        );
      })}

      {SKILL_ORDER.map((_, i) => {
        const angle = (Math.PI * 2 * i) / SKILL_ORDER.length - Math.PI / 2;
        const ex = cx + maxR * Math.cos(angle);
        const ey = cy + maxR * Math.sin(angle);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={ex}
            y2={ey}
            stroke="#d1d5db"
            strokeWidth={1}
            opacity={0.4}
          />
        );
      })}

      <motion.polygon
        points={areaPath}
        fill="rgba(74, 222, 128, 0.2)"
        stroke="#4ade80"
        strokeWidth={2.5}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />

      {points.map((p, i) => {
        const isStrongest = p.skill === strongest;
        const isWeakest = p.skill === weakest;
        const color = isStrongest ? '#22c55e' : isWeakest ? '#f87171' : '#4ade80';
        const r = isStrongest || isWeakest ? 7 : 5;
        return (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={r}
            fill={color}
            stroke="white"
            strokeWidth={2}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 300 }}
          />
        );
      })}

      {SKILL_ORDER.map((skill, i) => {
        const angle = (Math.PI * 2 * i) / SKILL_ORDER.length - Math.PI / 2;
        const labelR = maxR + 28;
        const lx = cx + labelR * Math.cos(angle);
        const ly = cy + labelR * Math.sin(angle);
        const isStrongest = skill === strongest;
        const isWeakest = skill === weakest;
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs font-bold"
            fill={isStrongest ? '#22c55e' : isWeakest ? '#f87171' : '#6b7280'}
            fontSize={isStrongest || isWeakest ? 13 : 11}
          >
            {SKILL_LABELS[skill]}
          </text>
        );
      })}
    </svg>
  );
}

function SkillCard({ skill, score }: { skill: SkillType; score: number }) {
  const pct = Math.round(score);
  const mastered = pct >= 80;
  const warning = pct < 50 && pct > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative rounded-2xl border-2 bg-white p-4 shadow-card transition-colors ${
        mastered ? 'border-green-300' : warning ? 'border-coral/40' : 'border-cream-300'
      }`}
    >
      {mastered && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white shadow-card"
        >
          <CheckCircle className="h-4 w-4" />
        </motion.div>
      )}

      <div className="mb-2 flex items-center gap-2">
        <span className="text-2xl">{SKILL_ICONS[skill]}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-sm font-bold text-gray-800">
            {SKILL_LABELS[skill]}
          </h3>
          <p className="font-body text-xs text-gray-500 truncate">
            {SKILL_DESCRIPTIONS[skill]}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className={`h-3 flex-1 overflow-hidden rounded-full ${getBarBgColor(pct)}`}>
          <motion.div
            className={`h-full rounded-full ${getProgressColor(pct)}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <span
          className={`font-display text-sm font-bold ${
            mastered ? 'text-green-600' : warning ? 'text-coral' : 'text-gray-600'
          }`}
        >
          {pct}%
        </span>
      </div>

      {warning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 flex items-center gap-1"
        >
          <AlertCircle className="h-3.5 w-3.5 text-coral" />
          <span className="font-body text-xs text-coral">继续加油，你可以的！</span>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function CollectionPage() {
  const [activeTab, setActiveTab] = useState<TabType>('skills');
  const getSkillScores = useGameStore(s => s.getSkillScores);
  const weeklyReport = useGameStore(s => s.weeklyReport);
  const getAreaProgress = useGameStore(s => s.getAreaProgress);

  const scores = getSkillScores();
  const { strongestSkill, weakestSkill, totalPracticeTime, levelsCompleted } = weeklyReport;

  const areaStats = useMemo(
    () => AREAS.map(area => ({ ...area, progress: getAreaProgress(area.id) })),
    [getAreaProgress],
  );

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="mx-auto max-w-lg px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-6 pb-4 text-center"
        >
          <h1 className="font-display text-2xl font-bold text-primary">📖 成长图鉴</h1>
          <p className="mt-1 font-body text-sm text-gray-500">记录你的每一次进步</p>
        </motion.div>

        <div className="flex gap-2 rounded-xl bg-white p-1.5 shadow-card">
          {TAB_CONFIG.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 font-display text-sm font-bold transition-colors ${
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-500 hover:text-primary'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'skills' ? (
            <motion.div
              key="skills"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="mt-5 grid grid-cols-2 gap-3"
            >
              {SKILL_ORDER.map(skill => (
                <SkillCard key={skill} skill={skill} score={scores[skill]} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="ability"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="mt-5"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border-2 border-cream-300 bg-white p-4 shadow-card"
              >
                <h2 className="mb-3 text-center font-display text-base font-bold text-primary">
                  🌟 能力雷达
                </h2>
                <RadarChart
                  scores={scores}
                  strongest={strongestSkill}
                  weakest={weakestSkill}
                />

                <div className="mt-4 space-y-2">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2.5"
                  >
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-body text-xs text-green-600">最强技能</p>
                      <p className="font-display text-sm font-bold text-green-700">
                        {SKILL_LABELS[strongestSkill]}{' '}
                        <span className="text-xs font-normal">
                          {Math.round(scores[strongestSkill])}%
                        </span>
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5"
                  >
                    <AlertCircle className="h-5 w-5 text-coral" />
                    <div>
                      <p className="font-body text-xs text-red-500">需要加油</p>
                      <p className="font-display text-sm font-bold text-coral">
                        {SKILL_LABELS[weakestSkill]}{' '}
                        <span className="text-xs font-normal">
                          {Math.round(scores[weakestSkill])}%
                        </span>
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 rounded-2xl border-2 border-cream-300 bg-white p-4 shadow-card"
              >
                <h2 className="mb-3 font-display text-base font-bold text-primary">
                  📊 本周数据
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-green-50 p-3 text-center">
                    <p className="font-body text-xs text-green-600">练习时长</p>
                    <p className="font-display text-xl font-bold text-green-700">
                      {totalPracticeTime}
                      <span className="text-xs font-normal">分钟</span>
                    </p>
                  </div>
                  <div className="rounded-xl bg-primary/10 p-3 text-center">
                    <p className="font-body text-xs text-primary">通关关卡</p>
                    <p className="font-display text-xl font-bold text-primary">
                      {levelsCompleted}
                      <span className="text-xs font-normal">关</span>
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 rounded-2xl border-2 border-cream-300 bg-white p-4 shadow-card"
              >
                <h2 className="mb-3 font-display text-base font-bold text-primary">
                  🗺️ 区域进度
                </h2>
                <div className="space-y-2.5">
                  {areaStats.map(area => {
                    const pct = area.progress.total > 0
                      ? Math.round((area.progress.completed / area.progress.total) * 100)
                      : 0;
                    return (
                      <div key={area.id} className="flex items-center gap-3">
                        <span className="text-xl">{area.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-display text-sm font-bold text-gray-800 truncate">
                              {area.name}
                            </p>
                            <span className="font-body text-xs text-gray-500">
                              {area.progress.completed}/{area.progress.total}
                            </span>
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-cream-200">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: area.accentColor }}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <span className="text-xs text-yellow-500">⭐</span>
                          <span className="font-display text-xs font-bold text-gray-600">
                            {area.progress.stars}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
