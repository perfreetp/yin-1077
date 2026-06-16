import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Clock, BarChart3, Lock, Save, ChevronLeft } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { SKILL_LABELS } from '@/types';
import type { SkillType, PracticeSpeed } from '@/types';

const TIME_OPTIONS = [15, 30, 45, 60, 90, 120];

const RADAR_SIZE = 200;
const RADAR_CENTER = RADAR_SIZE / 2;
const RADAR_RADIUS = 75;

function getRadarPoint(index: number, total: number, value: number, max: number) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const r = (value / max) * RADAR_RADIUS;
  return {
    x: RADAR_CENTER + r * Math.cos(angle),
    y: RADAR_CENTER + r * Math.sin(angle),
  };
}

function SkillRadar({ scores }: { scores: Record<SkillType, number> }) {
  const skills = Object.keys(SKILL_LABELS) as SkillType[];
  const maxScore = 100;

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const dataPoints = skills.map((skill, i) =>
    getRadarPoint(i, skills.length, scores[skill], maxScore)
  );
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

  return (
    <svg width={RADAR_SIZE} height={RADAR_SIZE} viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}>
      {gridLevels.map((level) => {
        const gridPoints = skills.map((_, i) =>
          getRadarPoint(i, skills.length, level * maxScore, maxScore)
        );
        const gridPath = gridPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
        return (
          <path
            key={level}
            d={gridPath}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={1}
          />
        );
      })}

      {skills.map((_, i) => {
        const outer = getRadarPoint(i, skills.length, maxScore, maxScore);
        return (
          <line
            key={i}
            x1={RADAR_CENTER}
            y1={RADAR_CENTER}
            x2={outer.x}
            y2={outer.y}
            stroke="#E5E7EB"
            strokeWidth={1}
          />
        );
      })}

      <path
        d={dataPath}
        fill="rgba(255,140,66,0.2)"
        stroke="#FF8C42"
        strokeWidth={2}
      />

      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={4}
          fill="#FF8C42"
          stroke="white"
          strokeWidth={2}
        />
      ))}

      {skills.map((skill, i) => {
        const labelPos = getRadarPoint(i, skills.length, maxScore * 1.22, maxScore);
        return (
          <text
            key={skill}
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-gray-600"
            fontSize={12}
            fontFamily="Nunito, sans-serif"
            fontWeight={600}
          >
            {SKILL_LABELS[skill]}
          </text>
        );
      })}
    </svg>
  );
}

function PinScreen({ onVerified }: { onVerified: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const verifyPin = useGameStore(s => s.verifyPin);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);

    if (next.length === 4) {
      if (verifyPin(next)) {
        setTimeout(() => onVerified(), 200);
      } else {
        setError(true);
        setTimeout(() => setPin(''), 600);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-b from-cream to-cream-dark flex flex-col items-center justify-center px-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-primary" />
        <h1 className="font-display text-2xl font-bold text-gray-800">家长验证</h1>
      </div>

      <p className="font-body text-sm text-gray-500 mb-6">请输入4位PIN码以进入设置</p>

      <div className="flex gap-3 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: i < pin.length ? 1 : 0.85,
              borderColor: error ? '#EF4444' : i < pin.length ? '#FF8C42' : '#D1D5DB',
            }}
            className="w-14 h-14 rounded-xl border-2 flex items-center justify-center bg-white shadow-card"
          >
            {i < pin.length && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-4 h-4 rounded-full bg-primary"
              />
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="font-body text-sm text-red-500 mb-4"
          >
            PIN码错误，请重试
          </motion.p>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-3 w-48">
        {['1','2','3','4','5','6','7','8','9','','0','del'].map((key) => {
          if (key === '') return <div key="empty" />;
          if (key === 'del') {
            return (
              <button
                key="del"
                onClick={handleDelete}
                className="h-12 rounded-xl bg-white/60 text-gray-500 font-body text-sm font-semibold flex items-center justify-center active:bg-gray-200 transition-colors"
              >
                删除
              </button>
            );
          }
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleDigit(key)}
              className="h-12 rounded-xl bg-white shadow-card font-display text-lg font-bold text-gray-800 flex items-center justify-center active:bg-cream transition-colors"
            >
              {key}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

function ChangePinModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'current' | 'new' | 'confirm'>('current');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const updateSettings = useGameStore(s => s.updateSettings);
  const verifyPin = useGameStore(s => s.verifyPin);

  const handleSubmit = () => {
    if (step === 'current') {
      if (verifyPin(currentPin)) {
        setStep('new');
        setError('');
      } else {
        setError('当前PIN码错误');
      }
    } else if (step === 'new') {
      if (newPin.length !== 4) {
        setError('PIN码必须为4位');
      } else {
        setStep('confirm');
        setError('');
      }
    } else {
      if (newPin !== confirmPin) {
        setError('两次输入不一致');
      } else {
        updateSettings({ pinCode: newPin });
        onClose();
      }
    }
  };

  const activeValue = step === 'current' ? currentPin : step === 'new' ? newPin : confirmPin;
  const setActiveValue = step === 'current' ? setCurrentPin : step === 'new' ? setNewPin : setConfirmPin;

  const handleDigit = (d: string) => {
    if (activeValue.length >= 4) return;
    const next = activeValue + d;
    setActiveValue(next);
    setError('');
  };

  const handleDelete = () => {
    setActiveValue(prev => prev.slice(0, -1));
    setError('');
  };

  const stepLabel = step === 'current' ? '输入当前PIN' : step === 'new' ? '输入新PIN' : '确认新PIN';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-cream rounded-card shadow-game-lg p-6 w-full max-w-xs"
      >
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-bold text-gray-800">{stepLabel}</h3>
        </div>

        <div className="flex gap-2 justify-center mb-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-lg border-2 flex items-center justify-center bg-white"
              style={{ borderColor: i < activeValue.length ? '#FF8C42' : '#D1D5DB' }}
            >
              {i < activeValue.length && <div className="w-3 h-3 rounded-full bg-primary" />}
            </div>
          ))}
        </div>

        {error && (
          <p className="font-body text-xs text-red-500 text-center mb-3">{error}</p>
        )}

        <div className="grid grid-cols-3 gap-2 mb-4">
          {['1','2','3','4','5','6','7','8','9','','0','del'].map((key) => {
            if (key === '') return <div key="empty" />;
            if (key === 'del') {
              return (
                <button
                  key="del"
                  onClick={handleDelete}
                  className="h-10 rounded-lg bg-white/60 text-gray-500 font-body text-xs font-semibold flex items-center justify-center"
                >
                  删除
                </button>
              );
            }
            return (
              <button
                key={key}
                onClick={() => handleDigit(key)}
                className="h-10 rounded-lg bg-white font-display text-base font-bold text-gray-800 flex items-center justify-center"
              >
                {key}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-button bg-gray-200 font-body text-sm font-semibold text-gray-600"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 rounded-button bg-primary font-body text-sm font-semibold text-white"
          >
            确认
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SettingsPanel() {
  const navigate = useNavigate();
  const settings = useGameStore(s => s.settings);
  const updateSettings = useGameStore(s => s.updateSettings);
  const weeklyReport = useGameStore(s => s.weeklyReport);
  const getSkillScores = useGameStore(s => s.getSkillScores);
  const initStore = useGameStore(s => s.initStore);
  const todayPlayTime = useGameStore(s => s.todayPlayTime);
  const getTodaySessions = useGameStore(s => s.getTodaySessions);

  useEffect(() => {
    initStore();
  }, [initStore]);

  const [saved, setSaved] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);

  const [timeLimit, setTimeLimit] = useState(settings.dailyTimeLimit);
  const [maxDifficulty, setMaxDifficulty] = useState(settings.maxDifficulty);

  const skillScores = useMemo(() => getSkillScores(), [getSkillScores]);

  const todaySessions = useMemo(() => {
    const sessions = getTodaySessions();
    return [...sessions].sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }, [getTodaySessions]);

  const totalSessions = todaySessions.length;
  const totalPracticeTime = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  const speedLabels: Record<PracticeSpeed, { text: string; color: string }> = {
    normal: { text: '普通', color: 'bg-gray-100 text-gray-600' },
    slow: { text: '慢速', color: 'bg-blue-100 text-blue-600' },
    phrase: { text: '分句', color: 'bg-green-100 text-green-600' },
  };

  const handleSave = () => {
    updateSettings({ dailyTimeLimit: timeLimit, maxDifficulty });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const difficultyLabels = ['', '入门', '初级', '中级', '进阶', '挑战'];

  const streakDays = useMemo(() => {
    if (!weeklyReport.levelsCompleted) return 0;
    return weeklyReport.levelsCompleted > 0 ? Math.min(7, Math.ceil(weeklyReport.totalPracticeTime / 10)) : 0;
  }, [weeklyReport]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="min-h-screen bg-gradient-to-b from-cream to-cream-dark px-4 pb-8 pt-4"
    >
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-9 h-9 rounded-button bg-white/80 shadow-card text-gray-600"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="font-display text-xl font-bold text-gray-800">家长中心</h1>
        </div>
      </div>

      <div className="space-y-4 max-w-lg mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white/90 backdrop-blur rounded-card shadow-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="font-display text-base font-bold text-gray-800">每日时间限制</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map((mins) => (
              <motion.button
                key={mins}
                whileTap={{ scale: 0.93 }}
                onClick={() => setTimeLimit(mins)}
                className={`px-4 py-2 rounded-button font-body text-sm font-semibold transition-all ${
                  timeLimit === mins
                    ? 'bg-primary text-white shadow-game'
                    : 'bg-cream text-gray-600'
                }`}
              >
                {mins}分钟
              </motion.button>
            ))}
          </div>
          <p className="mt-3 font-body text-xs text-gray-400">
            今日已玩 {todayPlayTime} 分钟 / 限制 {timeLimit} 分钟
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur rounded-card shadow-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="font-display text-base font-bold text-gray-800">难度控制</h2>
          </div>
          <p className="font-body text-xs text-gray-400 mb-3">限制孩子可访问的最高难度等级</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <motion.button
                key={level}
                whileTap={{ scale: 0.93 }}
                onClick={() => setMaxDifficulty(level)}
                className={`flex-1 py-3 rounded-button font-display text-sm font-bold transition-all ${
                  level <= maxDifficulty
                    ? 'bg-primary text-white shadow-game'
                    : 'bg-cream text-gray-400'
                }`}
              >
                {level}
              </motion.button>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="font-body text-[10px] text-gray-400">入门</span>
            <span className="font-body text-xs font-semibold text-primary">
              当前: {difficultyLabels[maxDifficulty]}
            </span>
            <span className="font-body text-[10px] text-gray-400">挑战</span>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/90 backdrop-blur rounded-card shadow-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="font-display text-base font-bold text-gray-800">本周能力报告</h2>
          </div>
          <div className="flex justify-center">
            <SkillRadar scores={skillScores} />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-2 rounded-xl bg-cream">
              <p className="font-display text-lg font-bold text-primary">
                {weeklyReport.totalPracticeTime}
              </p>
              <p className="font-body text-[10px] text-gray-500">练习时长(分)</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-cream">
              <p className="font-display text-lg font-bold text-primary">
                {weeklyReport.levelsCompleted}
              </p>
              <p className="font-body text-[10px] text-gray-500">完成关卡</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-cream">
              <p className="font-display text-lg font-bold text-primary">
                {streakDays}
              </p>
              <p className="font-body text-[10px] text-gray-500">连续天数</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur rounded-card shadow-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="font-display text-base font-bold text-gray-800">📝 今日练习明细</h2>
          </div>

          {todaySessions.length === 0 ? (
            <p className="font-body text-sm text-gray-400 text-center py-6">
              今天还没有练习记录，快去闯关吧！
            </p>
          ) : (
            <div className="space-y-3">
              {todaySessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-cream rounded-xl p-3"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-display text-sm font-bold text-gray-800">
                        {session.levelName} · {session.areaName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-body text-xs font-semibold">
                          {SKILL_LABELS[session.skillType]}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-body text-xs font-semibold ${speedLabels[session.speed].color}`}>
                          {speedLabels[session.speed].text}
                        </span>
                      </div>
                    </div>
                    <p className="font-body text-xs text-gray-500">
                      {session.durationMinutes.toFixed(1)} 分钟
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    {session.passed ? (
                      <span className="font-body text-xs font-semibold text-green-600">
                        ✅ 通关 {session.stars}★
                      </span>
                    ) : (
                      <span className="font-body text-xs font-semibold text-red-500">
                        ❌ 未通过
                      </span>
                    )}
                    <span className="font-body text-xs font-semibold text-gray-600">
                      准确率 {(session.accuracy * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="font-body text-xs text-gray-500">
                  共 {totalSessions} 次练习
                </span>
                <span className="font-body text-xs font-semibold text-primary">
                  总时长 {totalPracticeTime.toFixed(1)} 分钟
                </span>
              </div>
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/90 backdrop-blur rounded-card shadow-card p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="font-display text-base font-bold text-gray-800">修改PIN码</h2>
            </div>
            <button
              onClick={() => setShowChangePin(true)}
              className="px-4 py-2 rounded-button bg-cream font-body text-sm font-semibold text-primary"
            >
              修改
            </button>
          </div>
        </motion.section>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className="w-full py-3.5 rounded-button bg-primary text-white font-display text-base font-bold shadow-game flex items-center justify-center gap-2"
        >
          <Save size={18} />
          <span>保存设置</span>
          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm font-body"
              >
                ✓ 已保存
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <AnimatePresence>
        {showChangePin && <ChangePinModal onClose={() => setShowChangePin(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ParentPage() {
  const [verified, setVerified] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!verified ? (
        <PinScreen key="pin" onVerified={() => setVerified(true)} />
      ) : (
        <SettingsPanel key="settings" />
      )}
    </AnimatePresence>
  );
}
