import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Music, Drum, ArrowRightLeft, Play, RotateCcw } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { SKILL_LABELS } from '@/types';

type DuoPhase = 'setup' | 'playing' | 'result';

const NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;

const NOTE_PITCHES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];

const NOTE_POSITIONS: Record<string, number> = {
  C4: 0, D4: 0.5, E4: 1, F4: 1.5, G4: 2,
  A4: 2.5, B4: 3, C5: 3.5,
};

const TEMPO_OPTIONS = [60, 80, 100] as const;
const ROUND_OPTIONS = [5, 10, 15] as const;

function getStaffY(pitch: string, topY: number, lineGap: number): number {
  const pos = NOTE_POSITIONS[pitch];
  if (pos === undefined) return topY + 2 * lineGap;
  const baseY = topY + 2 * lineGap;
  return baseY - pos * (lineGap / 2);
}

function getRatingEmoji(score: number): string {
  if (score > 80) return '🌟🌟🌟';
  if (score > 60) return '🌟🌟';
  return '🌟';
}

export default function DuoPage() {
  const addPlayTime = useGameStore(s => s.addPlayTime);

  const [phase, setPhase] = useState<DuoPhase>('setup');
  const [tempo, setTempo] = useState<number>(80);
  const [totalRounds, setTotalRounds] = useState<number>(10);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentNote, setCurrentNote] = useState('');
  const [sightScore, setSightScore] = useState(0);
  const [sightTotal, setSightTotal] = useState(0);
  const [sightFlash, setSightFlash] = useState<'correct' | 'wrong' | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const [beatPhase, setBeatPhase] = useState(0);
  const [beatFeedback, setBeatFeedback] = useState<string | null>(null);
  const [beatTimings, setBeatTimings] = useState<number[]>([]);
  const [beatCorrect, setBeatCorrect] = useState(0);
  const [beatTotal, setBeatTotal] = useState(0);

  const [syncPulse, setSyncPulse] = useState(false);

  const [rolesSwapped, setRolesSwapped] = useState(false);

  const beatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastBeatTimeRef = useRef<number>(0);
  const beatCountRef = useRef(0);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generateNote = useCallback(() => {
    const idx = Math.floor(Math.random() * NOTE_PITCHES.length);
    setCurrentNote(NOTE_PITCHES[idx]);
  }, []);

  const startBeatPulse = useCallback(() => {
    if (beatIntervalRef.current) clearInterval(beatIntervalRef.current);
    const intervalMs = 60000 / tempo;
    beatCountRef.current = 0;

    beatIntervalRef.current = setInterval(() => {
      beatCountRef.current += 1;
      lastBeatTimeRef.current = performance.now();
      setBeatPhase(prev => (prev + 1) % 4);
    }, intervalMs);
  }, [tempo]);

  const stopBeatPulse = useCallback(() => {
    if (beatIntervalRef.current) {
      clearInterval(beatIntervalRef.current);
      beatIntervalRef.current = null;
    }
  }, []);

  const startGame = useCallback(() => {
    setSightScore(0);
    setSightTotal(0);
    setBeatTimings([]);
    setBeatCorrect(0);
    setBeatTotal(0);
    setCurrentRound(1);
    setSightFlash(null);
    setBeatFeedback(null);
    setSyncPulse(false);
    generateNote();
    startBeatPulse();
    setPhase('playing');
    addPlayTime(1);
  }, [generateNote, startBeatPulse, addPlayTime]);

  const handleNoteAnswer = useCallback((answer: string) => {
    const noteName = currentNote.replace(/\d/, '');
    const isCorrect = answer === noteName;

    setSightTotal(prev => prev + 1);
    if (isCorrect) {
      setSightScore(prev => prev + 1);
      setSightFlash('correct');
    } else {
      setSightFlash('wrong');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
    }

    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = setTimeout(() => setSightFlash(null), 500);

    const bothCorrect = isCorrect && beatFeedback === '刚好!';
    if (bothCorrect) {
      setSyncPulse(true);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => setSyncPulse(false), 600);
    }

    if (currentRound >= totalRounds) {
      setTimeout(() => {
        stopBeatPulse();
        setPhase('result');
      }, 800);
    } else {
      setTimeout(() => {
        setCurrentRound(prev => prev + 1);
        generateNote();
      }, 600);
    }
  }, [currentNote, beatFeedback, currentRound, totalRounds, generateNote, stopBeatPulse]);

  const handleBeatTap = useCallback(() => {
    if (phase !== 'playing') return;

    const now = performance.now();
    const intervalMs = 60000 / tempo;
    const timeSinceLastBeat = now - lastBeatTimeRef.current;
    const deviation = timeSinceLastBeat / intervalMs;

    setBeatTotal(prev => prev + 1);
    setBeatTimings(prev => [...prev, deviation]);

    let feedback: string;
    if (deviation < 0.25 || deviation > 0.85) {
      feedback = '太早了';
    } else if (deviation >= 0.35 && deviation <= 0.75) {
      feedback = '刚好!';
      setBeatCorrect(prev => prev + 1);
    } else {
      feedback = '太晚了';
    }

    setBeatFeedback(feedback);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => setBeatFeedback(null), 800);
  }, [phase, tempo]);

  useEffect(() => {
    return () => {
      stopBeatPulse();
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [stopBeatPulse]);

  const sightAccuracy = sightTotal > 0 ? sightScore / sightTotal : 0;
  const beatStability = beatTotal > 0 ? beatCorrect / beatTotal : 0;
  const combinedScore = (sightAccuracy * 0.5 + beatStability * 0.5) * 100;

  const renderStaff = () => {
    const lineGap = 10;
    const topY = 12;
    const noteY = getStaffY(currentNote, topY, lineGap);

    return (
      <svg viewBox="0 0 120 60" className="w-full max-w-[180px] mx-auto">
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={i}
            x1="10"
            y1={topY + i * lineGap}
            x2="110"
            y2={topY + i * lineGap}
            stroke="white"
            strokeWidth={1.2}
            opacity={0.8}
          />
        ))}
        {currentNote && (
          <motion.ellipse
            cx="60"
            cy={noteY}
            rx={6}
            ry={4.5}
            fill={sightFlash === 'correct' ? '#4ADE80' : sightFlash === 'wrong' ? '#F87171' : 'white'}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          />
        )}
      </svg>
    );
  };

  const renderSetup = () => (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-indigo-100 via-purple-50 to-emerald-50 px-6 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="flex items-center gap-3 mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Users size={36} className="text-indigo-600" />
        <h1 className="text-3xl font-bold text-indigo-800">双人接力模式</h1>
      </motion.div>

      <motion.div
        className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Music size={18} className="text-blue-500" />
          <span className="font-bold text-gray-700">选择速度 (BPM)</span>
        </div>
        <div className="flex gap-3 justify-center">
          {TEMPO_OPTIONS.map(t => (
            <motion.button
              key={t}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setTempo(t)}
              className={`px-5 py-2.5 rounded-xl font-bold text-lg transition-colors ${
                tempo === t
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Drum size={18} className="text-emerald-500" />
          <span className="font-bold text-gray-700">选择轮数</span>
        </div>
        <div className="flex gap-3 justify-center">
          {ROUND_OPTIONS.map(r => (
            <motion.button
              key={r}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setTotalRounds(r)}
              className={`px-5 py-2.5 rounded-xl font-bold text-lg transition-colors ${
                totalRounds === r
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="w-full max-w-sm bg-gradient-to-r from-blue-100 to-emerald-100 rounded-2xl p-4 mb-8 text-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-blue-600 font-bold">读谱手</span>
          <span className="text-gray-400">+</span>
          <span className="text-emerald-600 font-bold">打拍手</span>
        </div>
        <p className="text-sm text-gray-500">
          {SKILL_LABELS.sight_read} & {SKILL_LABELS.steady_beat}
        </p>
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        onClick={startGame}
        className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-bold text-xl px-10 py-4 rounded-2xl shadow-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Play size={24} />
        开始接力
      </motion.button>
    </motion.div>
  );

  const renderSightReader = () => (
    <div className={`flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-blue-500 to-blue-600 p-4 relative overflow-hidden ${isShaking ? 'animate-shake' : ''}`}>
      <div className="absolute top-2 right-3 bg-white/20 rounded-lg px-2.5 py-1 text-white text-sm font-bold">
        第 {currentRound}/{totalRounds} 轮
      </div>
      <div className="absolute top-2 left-3 bg-white/20 rounded-lg px-2.5 py-1 text-white text-sm font-bold">
        ✅ {sightScore}/{sightTotal}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Music size={20} className="text-blue-200" />
        <span className="text-blue-100 font-bold text-lg">读谱手</span>
      </div>

      <div className="bg-blue-800/40 rounded-2xl p-4 w-full max-w-[220px] mb-4">
        {renderStaff()}
      </div>

      <AnimatePresence>
        {sightFlash === 'correct' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                style={{ left: `${20 + Math.random() * 60}%`, top: `${20 + Math.random() * 60}%` }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: [0, 2, 0], opacity: [1, 1, 0], y: [0, -30 - Math.random() * 30] }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
              />
            ))}
          </motion.div>
        )}
        {sightFlash === 'wrong' && (
          <motion.div
            className="absolute inset-0 bg-red-500/30 pointer-events-none rounded-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-4 gap-2 w-full max-w-[240px]">
        {NOTE_NAMES.map(name => (
          <motion.button
            key={name}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.08 }}
            onClick={() => handleNoteAnswer(name)}
            className="bg-white/90 text-blue-700 font-bold text-lg py-2 rounded-xl shadow-md hover:bg-white active:bg-blue-100 transition-colors"
          >
            {name}
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderBeatKeeper = () => {
    const pulseScale = 1 + Math.sin(beatPhase * Math.PI / 2) * 0.2;

    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-emerald-500 to-emerald-600 p-4 relative">
        <div className="absolute top-2 right-3 bg-white/20 rounded-lg px-2.5 py-1 text-white text-sm font-bold">
          第 {currentRound}/{totalRounds} 轮
        </div>
        <div className="absolute top-2 left-3 bg-white/20 rounded-lg px-2.5 py-1 text-white text-sm font-bold">
          🎯 {beatCorrect}/{beatTotal}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Drum size={20} className="text-emerald-200" />
          <span className="text-emerald-100 font-bold text-lg">打拍手</span>
        </div>

        <motion.div
          className="w-20 h-20 rounded-full bg-emerald-300/50 border-4 border-white/60 flex items-center justify-center mb-4"
          animate={{ scale: pulseScale }}
          transition={{ duration: 0.15 }}
        >
          <div className="w-8 h-8 rounded-full bg-white/70" />
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.04 }}
          onClick={handleBeatTap}
          className="w-28 h-28 rounded-full bg-white text-emerald-700 font-bold text-2xl shadow-xl mb-3 active:bg-emerald-100 transition-colors"
        >
          拍!
        </motion.button>

        <AnimatePresence>
          {beatFeedback && (
            <motion.div
              className={`font-bold text-lg ${
                beatFeedback === '刚好!' ? 'text-yellow-200' : 'text-red-200'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {beatFeedback}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderDivider = () => (
    <div className="relative h-1 w-full bg-gray-900/20 z-10">
      <motion.div
        className="absolute inset-0"
        animate={{
          background: syncPulse
            ? 'linear-gradient(90deg, #60A5FA, #FDE68A, #34D399, #FDE68A, #60A5FA)'
            : 'linear-gradient(90deg, #93C5FD, #6EE7B7)',
          boxShadow: syncPulse ? '0 0 12px 4px rgba(250,204,21,0.5)' : '0 0 6px 2px rgba(255,255,255,0.3)',
        }}
        transition={{ duration: 0.3 }}
      />
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)' }}
      />
    </div>
  );

  const renderPlaying = () => {
    const topContent = rolesSwapped ? renderBeatKeeper : renderSightReader;
    const bottomContent = rolesSwapped ? renderSightReader : renderBeatKeeper;

    return (
      <motion.div
        className="flex flex-col h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="flex-1 min-h-0"
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {topContent()}
        </motion.div>
        {renderDivider()}
        <motion.div
          className="flex-1 min-h-0"
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {bottomContent()}
        </motion.div>
      </motion.div>
    );
  };

  const renderResult = () => (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-600 via-purple-500 to-emerald-600 px-6 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.h2
        className="text-3xl font-bold text-white mb-2"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        接力完成!
      </motion.h2>

      <motion.div
        className="text-5xl mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
      >
        {getRatingEmoji(combinedScore)}
      </motion.div>

      <motion.div
        className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 w-full max-w-sm mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-center mb-4">
          <div className="text-white/70 text-sm mb-1">默契度</div>
          <motion.div
            className="text-5xl font-bold text-white"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            {Math.round(combinedScore)}%
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-500/30 rounded-xl p-3 text-center">
            <div className="text-blue-200 text-xs mb-1">
              {rolesSwapped ? '打拍手' : '读谱手'}
            </div>
            <div className="text-white font-bold text-xl">
              {Math.round(sightAccuracy * 100)}%
            </div>
            <div className="text-blue-200 text-xs">{SKILL_LABELS.sight_read}</div>
          </div>
          <div className="bg-emerald-500/30 rounded-xl p-3 text-center">
            <div className="text-emerald-200 text-xs mb-1">
              {rolesSwapped ? '读谱手' : '打拍手'}
            </div>
            <div className="text-white font-bold text-xl">
              {Math.round(beatStability * 100)}%
            </div>
            <div className="text-emerald-200 text-xs">{SKILL_LABELS.steady_beat}</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="flex gap-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => {
            setRolesSwapped(prev => !prev);
            setPhase('setup');
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold px-5 py-3 rounded-xl shadow-lg"
        >
          <ArrowRightLeft size={20} />
          互换角色
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => {
            setRolesSwapped(false);
            setPhase('setup');
          }}
          className="flex items-center gap-2 bg-white/20 text-white font-bold px-5 py-3 rounded-xl shadow-lg hover:bg-white/30 transition-colors"
        >
          <RotateCcw size={20} />
          再来一次
        </motion.button>
      </motion.div>
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      {phase === 'setup' && <div key="setup">{renderSetup()}</div>}
      {phase === 'playing' && <div key="playing">{renderPlaying()}</div>}
      {phase === 'result' && <div key="result">{renderResult()}</div>}
    </AnimatePresence>
  );
}
