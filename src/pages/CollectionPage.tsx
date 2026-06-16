import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Target, TrendingUp, TrendingDown, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { SKILL_LABELS, SKILL_DESCRIPTIONS, ALL_RHYTHM_PATTERNS, ALL_KEY_SIGNATURES } from '@/types';
import type { SkillType, SkillTrendPoint, FailedLevelRecord } from '@/types';
import { AREAS } from '@/data/gameData';

type TabType = 'skills' | 'ability' | 'trends';

const SKILL_ICONS: Record<SkillType, string> = {
  steady_beat: '🥁',
  sight_read: '🎼',
  interval_jump: '🦘',
  hand_switch: '🤝',
  continuous: '🎯',
};

const SKILL_COLORS: Record<SkillType, string> = {
  steady_beat: '#4CAF50',
  sight_read: '#64B5F6',
  interval_jump: '#AB47BC',
  hand_switch: '#FF8C42',
  continuous: '#F44336',
};

const SKILL_ORDER: SkillType[] = [
  'steady_beat',
  'sight_read',
  'interval_jump',
  'hand_switch',
  'continuous',
];

const TAB_CONFIG: { key: TabType; label: string; icon: typeof BookOpen | null; emoji?: string }[] = [
  { key: 'skills', label: '技能图谱', icon: BookOpen },
  { key: 'ability', label: '能力地图', icon: Target },
  { key: 'trends', label: '练习趋势', icon: null, emoji: '📈' },
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

function calculateTrend(points: SkillTrendPoint[]): 'improving' | 'stable' | 'declining' {
  if (points.length < 6) return 'stable';
  const firstThree = points.slice(0, 3);
  const lastThree = points.slice(-3);
  const avgFirst = firstThree.reduce((sum, p) => sum + p.score, 0) / 3;
  const avgLast = lastThree.reduce((sum, p) => sum + p.score, 0) / 3;
  const diff = avgLast - avgFirst;
  if (diff > 2) return 'improving';
  if (diff < -2) return 'declining';
  return 'stable';
}

function LineChart({ trends, beatTrend }: { trends: Record<SkillType, SkillTrendPoint[]>; beatTrend: SkillTrendPoint[] }) {
  const width = 340;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const allScores = SKILL_ORDER.flatMap(skill => trends[skill]?.map(p => p.score) || []);
  const beatScores = beatTrend.map(p => p.score);
  const maxScore = Math.max(100, ...allScores, ...beatScores, 0);
  const minScore = Math.min(0, ...allScores, ...beatScores, 0);
  const scoreRange = maxScore - minScore || 100;

  const dayLabels = ['一', '二', '三', '四', '五', '六', '日'];

  const getX = (index: number, total: number) => {
    return padding.left + (index / Math.max(total - 1, 1)) * chartWidth;
  };

  const getY = (score: number) => {
    return padding.top + chartHeight - ((score - minScore) / scoreRange) * chartHeight;
  };

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
        const y = padding.top + chartHeight * ratio;
        const value = Math.round(maxScore - scoreRange * ratio);
        return (
          <g key={i}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth={1}
              strokeDasharray={i === 0 || i === 4 ? '0' : '4,4'}
            />
            <text
              x={padding.left - 8}
              y={y + 4}
              textAnchor="end"
              className="text-xs fill-gray-400 font-body"
              fontSize={10}
            >
              {value}
            </text>
          </g>
        );
      })}

      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const x = getX(i, 7);
        return (
          <text
            key={i}
            x={x}
            y={height - padding.bottom + 18}
            textAnchor="middle"
            className="text-xs fill-gray-400 font-body"
            fontSize={11}
          >
            {dayLabels[i]}
          </text>
        );
      })}

      {SKILL_ORDER.map((skill, si) => {
        const points = trends[skill] || [];
        if (points.length === 0) return null;
        
        const pathPoints = points.map((p, i) => `${getX(i, 7)},${getY(p.score)}`).join(' ');
        
        return (
          <g key={skill}>
            <polyline
              points={pathPoints}
              fill="none"
              stroke={SKILL_COLORS[skill]}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {points.map((p, pi) => (
              <circle
                key={pi}
                cx={getX(pi, 7)}
                cy={getY(p.score)}
                r={3.5}
                fill={SKILL_COLORS[skill]}
                stroke="white"
                strokeWidth={1.5}
              />
            ))}
          </g>
        );
      })}

      {beatTrend.length > 0 && (
        <g>
          <polyline
            points={beatTrend.map((p, i) => `${getX(i, 7)},${getY(p.score)}`).join(' ')}
            fill="none"
            stroke="#FFB300"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6,3"
          />
          {beatTrend.map((p, pi) => (
            <circle
              key={pi}
              cx={getX(pi, 7)}
              cy={getY(p.score)}
              r={4}
              fill="#FFB300"
              stroke="white"
              strokeWidth={1.5}
            />
          ))}
        </g>
      )}
    </svg>
  );
}

function FailedLevelCard({ level, onRetry }: { level: FailedLevelRecord; onRetry: () => void }) {
  const accuracy = Math.round(level.avgAccuracy * 100);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="rounded-xl border-2 border-red-200 bg-red-50 p-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-display text-sm font-bold text-gray-800 truncate">
            {level.levelName}
          </h4>
          <p className="font-body text-xs text-gray-500 truncate">
            {level.areaName}
          </p>
        </div>
        <span className="flex-shrink-0 rounded-full bg-red-100 px-2 py-0.5 font-body text-xs font-bold text-red-600">
          失败 {level.failCount} 次
        </span>
      </div>
      
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="font-body text-xs text-gray-500">平均准确率</span>
          <span className="font-display text-sm font-bold text-gray-700">{accuracy}%</span>
        </div>
        <button
          onClick={onRetry}
          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 font-display text-xs font-bold text-white shadow-sm hover:bg-primary/90 transition-colors"
        >
          <span>👉</span>
          再练一次
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  );
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('skills');
  const getSkillScores = useGameStore(s => s.getSkillScores);
  const weeklyReport = useGameStore(s => s.weeklyReport);
  const getAreaProgress = useGameStore(s => s.getAreaProgress);
  const getSkillTrends = useGameStore(s => s.getSkillTrends);
  const getFailedLevels = useGameStore(s => s.getFailedLevels);
  const getBeatStabilityTrend = useGameStore(s => s.getBeatStabilityTrend);
  const getTodaySessions = useGameStore(s => s.getTodaySessions);

  const scores = getSkillScores();
  const { strongestSkill, weakestSkill, totalPracticeTime, levelsCompleted } = weeklyReport;
  const trends = getSkillTrends();
  const failedLevels = getFailedLevels();
  const beatTrend = getBeatStabilityTrend();
  const todaySessions = getTodaySessions();

  const areaStats = useMemo(
    () => AREAS.map(area => ({ ...area, progress: getAreaProgress(area.id) })),
    [getAreaProgress],
  );

  const skillTrends = useMemo(() => {
    return SKILL_ORDER.map(skill => ({
      skill,
      trend: calculateTrend(trends[skill] || []),
    }));
  }, [trends]);

  const beatTrendInfo = useMemo(() => {
    const trend = calculateTrend(beatTrend);
    const totalEarly = todaySessions.reduce((sum, s) => sum + (s.rhythmEarlyCount || 0), 0);
    const totalLate = todaySessions.reduce((sum, s) => sum + (s.rhythmLateCount || 0), 0);
    let tendency: 'early' | 'late' | 'even' = 'even';
    if (totalEarly > totalLate && totalEarly - totalLate >= 3) tendency = 'early';
    else if (totalLate > totalEarly && totalLate - totalEarly >= 3) tendency = 'late';
    return { trend, totalEarly, totalLate, tendency, hasSessions: todaySessions.length > 0 };
  }, [beatTrend, todaySessions]);

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
                {tab.emoji ? (
                  <span className="text-base">{tab.emoji}</span>
                ) : (
                  Icon && <Icon className="h-4 w-4" />
                )}
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
              className="mt-5"
            >
              <div className="grid grid-cols-2 gap-3">
                {SKILL_ORDER.map(skill => (
                  <SkillCard key={skill} skill={skill} score={scores[skill]} />
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-5 rounded-2xl border-2 border-cream-300 bg-white p-4 shadow-card"
              >
                <h2 className="mb-3 font-display text-base font-bold text-primary">
                  🎵 已掌握节奏型
                </h2>
                <div className="flex flex-wrap gap-2">
                  {ALL_RHYTHM_PATTERNS.map(rhythm => {
                    const mastered = weeklyReport.masteredRhythms.includes(rhythm);
                    return (
                      <div
                        key={rhythm}
                        className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                          mastered
                            ? 'bg-green-100 text-green-700 border border-green-300'
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}
                      >
                        {mastered && <CheckCircle className="h-3.5 w-3.5" />}
                        {rhythm}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 font-body text-xs text-gray-400">
                  已掌握 {weeklyReport.masteredRhythms.length}/{ALL_RHYTHM_PATTERNS.length}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4 rounded-2xl border-2 border-cream-300 bg-white p-4 shadow-card"
              >
                <h2 className="mb-3 font-display text-base font-bold text-primary">
                  🎹 已掌握调号
                </h2>
                <div className="flex flex-wrap gap-2">
                  {ALL_KEY_SIGNATURES.map(key => {
                    const mastered = weeklyReport.masteredKeys.includes(key);
                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                          mastered
                            ? 'bg-sky-100 text-sky-700 border border-sky-300'
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}
                      >
                        {mastered && <CheckCircle className="h-3.5 w-3.5" />}
                        {key}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 font-body text-xs text-gray-400">
                  已掌握 {weeklyReport.masteredKeys.length}/{ALL_KEY_SIGNATURES.length}
                </p>
              </motion.div>
            </motion.div>
          ) : activeTab === 'ability' ? (
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
          ) : (
            <motion.div
              key="trends"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="mt-5"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border-2 border-cream-300 bg-white p-4 shadow-card"
              >
                <h2 className="mb-3 text-center font-display text-base font-bold text-primary">
                  📈 7天技能趋势
                </h2>
                <LineChart trends={trends} beatTrend={beatTrend} />
                
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {skillTrends.map(({ skill, trend }, i) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="flex items-center gap-2 rounded-lg bg-cream-50 px-3 py-2"
                    >
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: SKILL_COLORS[skill] }}
                      />
                      <span className="font-body text-xs font-medium text-gray-700 flex-1">
                        {SKILL_ICONS[skill]} {SKILL_LABELS[skill]}
                      </span>
                      {trend === 'improving' && (
                        <span className="flex items-center gap-0.5 text-green-500">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span className="text-xs font-bold">上升</span>
                        </span>
                      )}
                      {trend === 'stable' && (
                        <span className="flex items-center gap-0.5 text-gray-500">
                          <span className="text-sm">➡️</span>
                          <span className="text-xs font-bold">平稳</span>
                        </span>
                      )}
                      {trend === 'declining' && (
                        <span className="flex items-center gap-0.5 text-red-500">
                          <TrendingDown className="h-3.5 w-3.5" />
                          <span className="text-xs font-bold">下降</span>
                        </span>
                      )}
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 border border-amber-200"
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: '#FFB300' }}
                    />
                    <span className="font-body text-xs font-medium text-gray-700 flex-1">
                      🎯 节拍稳定性
                    </span>
                    {beatTrendInfo.trend === 'improving' && (
                      <span className="flex items-center gap-0.5 text-green-500">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold">📈</span>
                      </span>
                    )}
                    {beatTrendInfo.trend === 'stable' && (
                      <span className="flex items-center gap-0.5 text-gray-500">
                        <span className="text-sm">➡️</span>
                        <span className="text-xs font-bold">➡️</span>
                      </span>
                    )}
                    {beatTrendInfo.trend === 'declining' && (
                      <span className="flex items-center gap-0.5 text-red-500">
                        <TrendingDown className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold">📉</span>
                      </span>
                    )}
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4 rounded-2xl border-2 bg-white p-4 shadow-card"
                style={{
                  borderColor: beatTrendInfo.tendency === 'early'
                    ? '#E9D5FF'
                    : beatTrendInfo.tendency === 'late'
                    ? '#FDE68A'
                    : '#BBF7D0',
                }}
              >
                <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold" style={{
                  color: beatTrendInfo.tendency === 'early'
                    ? '#7E22CE'
                    : beatTrendInfo.tendency === 'late'
                    ? '#B45309'
                    : '#15803D',
                }}>
                  <span>🎵</span>
                  节拍分析
                </h2>
                {beatTrendInfo.hasSessions ? (
                  <div className="space-y-3">
                    <div
                      className="rounded-xl px-4 py-3 text-center font-display text-lg font-bold"
                      style={{
                        backgroundColor: beatTrendInfo.tendency === 'early'
                          ? '#F5F3FF'
                          : beatTrendInfo.tendency === 'late'
                          ? '#FFFBEB'
                          : '#F0FDF4',
                        color: beatTrendInfo.tendency === 'early'
                          ? '#7E22CE'
                          : beatTrendInfo.tendency === 'late'
                          ? '#B45309'
                          : '#15803D',
                      }}
                    >
                      {beatTrendInfo.tendency === 'early' && '倾向偏早 ⚡'}
                      {beatTrendInfo.tendency === 'late' && '倾向偏晚 🐢'}
                      {beatTrendInfo.tendency === 'even' && '节拍均匀 ✨'}
                    </div>
                    <div className="flex items-center justify-center gap-4 font-body text-sm">
                      <span className="flex items-center gap-1.5" style={{ color: '#7E22CE' }}>
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#A855F7' }} />
                        偏早 <span className="font-bold">{beatTrendInfo.totalEarly}</span> 次
                      </span>
                      <span className="text-gray-300">/</span>
                      <span className="flex items-center gap-1.5" style={{ color: '#B45309' }}>
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
                        偏晚 <span className="font-bold">{beatTrendInfo.totalLate}</span> 次
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <span className="text-3xl">🎹</span>
                    <p className="mt-2 font-body text-sm text-gray-500">
                      今日还没有练习记录哦～
                    </p>
                    <p className="font-body text-xs text-gray-400 mt-1">
                      完成练习后会显示节拍分析
                    </p>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 rounded-2xl border-2 border-red-200 bg-white p-4 shadow-card"
              >
                <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-red-500">
                  <AlertCircle className="h-5 w-5" />
                  ⚠️ 需要重点练习
                </h2>
                {failedLevels.length === 0 ? (
                  <div className="py-8 text-center">
                    <span className="text-4xl">🎉</span>
                    <p className="mt-2 font-body text-sm text-gray-500">
                      太棒了！没有需要重点练习的关卡
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {failedLevels.map(level => (
                      <FailedLevelCard
                        key={level.levelId}
                        level={level}
                        onRetry={() => navigate(`/level/${level.levelId}`)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
