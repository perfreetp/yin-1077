import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, Scissors, Star, Volume2 } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { getLevelById } from '@/data/gameData';
import { AREAS } from '@/data/gameData';
import type { Note } from '@/types';

type GamePhase = 'ready' | 'countdown' | 'playing' | 'ended';

const KEY_TO_NOTE: Record<string, string> = {
  a: 'C4', s: 'D4', d: 'E4', f: 'F4',
  g: 'G4', h: 'A4', j: 'B4', k: 'C5',
};

const NOTE_TO_KEY: Record<string, string> = {
  C4: 'A', D4: 'S', E4: 'D', F4: 'F',
  G4: 'G', A4: 'H', B4: 'J', C5: 'K',
};

const NOTE_POSITIONS: Record<string, number> = {
  C3: 0, D3: 0.5, E3: 1, F3: 1.5, G3: 2,
  A3: 2.5, B3: 3, C4: 3.5, D4: 4, E4: 4.5,
  F4: 5, G4: 5.5, A4: 6, B4: 6.5, C5: 7,
  D5: 7.5, E5: 8, F5: 8.5, G5: 9, A5: 9.5,
};

const OBSTACLE_MAP: Record<string, string> = {
  forest: '🌿', island: '🌊', castle: '🪨',
  volcano: '🔥', cosmos: '⭐',
};

function getStaffY(notePitch: string, topY: number, lineGap: number): number {
  const pos = NOTE_POSITIONS[notePitch];
  if (pos === undefined) return topY + 4 * lineGap;
  const baseY = topY + 2 * lineGap;
  return baseY - pos * (lineGap / 2);
}

function isLedgerLine(pitch: string): boolean {
  const pos = NOTE_POSITIONS[pitch];
  return pos !== undefined && pos < 3;
}

export default function LevelPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const completeLevel = useGameStore(s => s.completeLevel);
  const getLevelProgress = useGameStore(s => s.getLevelProgress);
  const updateWeeklyReport = useGameStore(s => s.updateWeeklyReport);
  const player = useGameStore(s => s.player);

  const levelId = Number(id);
  const level = getLevelById(levelId);

  const [phase, setPhase] = useState<GamePhase>('ready');
  const [countdownNum, setCountdownNum] = useState(3);
  const [bpm, setBpm] = useState(level?.bpm ?? 60);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  const [characterPos, setCharacterPos] = useState(0);
  const [isWiggling, setIsWiggling] = useState(false);
  const [obstacleEmoji, setObstacleEmoji] = useState<string | null>(null);
  const [flashNotes, setFlashNotes] = useState<Record<number, 'correct' | 'wrong' | null>>({});
  const [beatInMeasure, setBeatInMeasure] = useState(1);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);

  const allNotesRef = useRef<Note[]>([]);
  const beatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentNoteIndexRef = useRef(0);
  const hasPressedRef = useRef(false);
  const phaseRef = useRef<GamePhase>('ready');

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (!level) return;
    const notes: Note[] = [];
    for (const measure of level.musicData.measures) {
      for (const note of measure.notes) {
        notes.push(note);
      }
    }
    allNotesRef.current = notes;
  }, [level]);

  const area = level ? AREAS.find(a => a.id === level.areaId) : null;
  const theme = area?.theme ?? 'forest';
  const obstacleIcon = OBSTACLE_MAP[theme] ?? '🌿';

  const totalNotes = allNotesRef.current.length;

  const accuracy = totalNotes > 0
    ? (correctCount) / totalNotes
    : 0;

  const stopBeatTimer = useCallback(() => {
    if (beatTimerRef.current) {
      clearInterval(beatTimerRef.current);
      beatTimerRef.current = null;
    }
  }, []);

  const endGame = useCallback(() => {
    stopBeatTimer();
    if (phaseRef.current === 'ended') return;
    setPhase('ended');

    const total = allNotesRef.current.length;
    const acc = total > 0 ? correctCount / total : 0;

    let stars = 0;
    if (acc >= 0.9) stars = 3;
    else if (acc >= 0.7) stars = 2;
    else if (acc >= 0.5) stars = 1;

    setEarnedStars(stars);

    const prev = getLevelProgress(levelId);
    const isNew = !prev?.completedAt;
    const coinReward = stars * 10 + (level?.isBoss ? 50 : 0) + (isNew ? 5 : 0);
    setEarnedCoins(coinReward);

    const resultStars = completeLevel(levelId, acc);

    if (level?.skillType) {
      updateWeeklyReport(level.skillType, acc * 100);
    }

    setEarnedStars(resultStars);
  }, [correctCount, levelId, level, completeLevel, getLevelProgress, updateWeeklyReport, stopBeatTimer]);

  const advanceNote = useCallback(() => {
    const currentIdx = currentNoteIndexRef.current;
    const notes = allNotesRef.current;

    if (!hasPressedRef.current && currentIdx < notes.length) {
      setMissedCount(c => c + 1);
      setShakeScreen(true);
      setTimeout(() => setShakeScreen(false), 200);
    }

    const nextIdx = currentIdx + 1;

    if (nextIdx >= notes.length) {
      endGame();
      return;
    }

    currentNoteIndexRef.current = nextIdx;
    setCurrentNoteIndex(nextIdx);
    hasPressedRef.current = false;

    const note = notes[nextIdx];
    if (note) {
      setBeatInMeasure(note.beatPosition);
    }
  }, [endGame]);

  const startPlaying = useCallback((effectiveBpm?: number) => {
    const actualBpm = effectiveBpm ?? (level?.bpm ?? 60);
    setBpm(actualBpm);
    setCurrentNoteIndex(0);
    currentNoteIndexRef.current = 0;
    setCorrectCount(0);
    setWrongCount(0);
    setMissedCount(0);
    setCharacterPos(0);
    setIsWiggling(false);
    setObstacleEmoji(null);
    setFlashNotes({});
    setBeatInMeasure(1);
    setShakeScreen(false);
    hasPressedRef.current = false;

    setPhase('playing');
    phaseRef.current = 'playing';

    const beatMs = 60000 / actualBpm;

    stopBeatTimer();
    beatTimerRef.current = setInterval(() => {
      advanceNote();
    }, beatMs);
  }, [level, advanceNote, stopBeatTimer]);

  const handleCountdown = useCallback(() => {
    setPhase('countdown');
    setCountdownNum(3);

    const t1 = setTimeout(() => setCountdownNum(2), 800);
    const t2 = setTimeout(() => setCountdownNum(1), 1600);
    const t3 = setTimeout(() => {
      startPlaying();
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [startPlaying]);

  const handleSlowRetry = useCallback(() => {
    const slowBpm = Math.round((level?.bpm ?? 60) * 0.7);
    handleCountdown();
    setTimeout(() => {
      stopBeatTimer();
      startPlaying(slowBpm);
    }, 2400);
  }, [level, handleCountdown, startPlaying, stopBeatTimer]);

  const handlePhraseRetry = useCallback(() => {
    handleCountdown();
  }, [handleCountdown]);

  useEffect(() => {
    return () => {
      stopBeatTimer();
    };
  }, [stopBeatTimer]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (phaseRef.current !== 'playing') return;

    const key = e.key.toLowerCase();
    const pressedNote = KEY_TO_NOTE[key];
    if (!pressedNote) return;

    e.preventDefault();

    const currentIdx = currentNoteIndexRef.current;
    const notes = allNotesRef.current;
    if (currentIdx >= notes.length) return;

    if (hasPressedRef.current) return;
    hasPressedRef.current = true;

    const expected = notes[currentIdx];
    if (pressedNote === expected.pitch) {
      setCorrectCount(c => c + 1);
      setCharacterPos(p => Math.min(p + 1, totalNotes));
      setFlashNotes(prev => ({ ...prev, [currentIdx]: 'correct' }));
      setTimeout(() => {
        setFlashNotes(prev => {
          const next = { ...prev };
          delete next[currentIdx];
          return next;
        });
      }, 400);
    } else {
      setWrongCount(c => c + 1);
      setIsWiggling(true);
      setTimeout(() => setIsWiggling(false), 400);
      setObstacleEmoji(obstacleIcon);
      setTimeout(() => setObstacleEmoji(null), 600);
      setFlashNotes(prev => ({ ...prev, [currentIdx]: 'wrong' }));
      setTimeout(() => {
        setFlashNotes(prev => {
          const next = { ...prev };
          delete next[currentIdx];
          return next;
        });
      }, 400);
    }
  }, [totalNotes, obstacleIcon]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!level) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-2xl mb-4">关卡未找到</p>
          <button
            onClick={() => navigate('/map')}
            className="px-6 py-3 bg-orange-400 text-white rounded-full text-lg font-bold"
          >
            返回地图
          </button>
        </div>
      </div>
    );
  }

  const noteWidth = Math.min(60, 800 / totalNotes);
  const staffTopY = 40;
  const lineGap = 14;

  const beatProgress = beatInMeasure / 4;
  const beatColor = beatInMeasure === 1 ? '#4CAF50' : beatInMeasure <= 2 ? '#FF9800' : '#F44336';

  const STAFF_WIDTH = Math.max(totalNotes * noteWidth + 40, 400);

  return (
    <motion.div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ backgroundColor: area?.bgColor ?? '#FFF8E1' }}
      animate={shakeScreen ? { x: [-3, 3, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-white/60 backdrop-blur-sm z-10">
        <button
          onClick={() => { stopBeatTimer(); navigate('/map'); }}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">返回</span>
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-gray-800">{level.name}</p>
          <p className="text-xs text-gray-500">BPM: {bpm}</p>
        </div>
        <div className="flex items-center gap-2">
          <Volume2 size={18} className="text-gray-500" />
          <span className="text-xs text-gray-500">{player.name}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-4 pt-4 pb-2 overflow-hidden">
        <div className="w-full max-w-4xl overflow-x-auto rounded-2xl bg-white/80 backdrop-blur shadow-lg p-4 mb-3">
          <div className="relative" style={{ width: STAFF_WIDTH, height: 160, margin: '0 auto' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0"
                style={{
                  top: staffTopY + i * lineGap,
                  height: 1,
                  backgroundColor: '#9CA3AF',
                }}
              />
            ))}

            <div
              className="absolute left-1 top-0 bottom-0"
              style={{ width: 3, backgroundColor: '#6B7280', top: staffTopY, height: 4 * lineGap }}
            />
            <div
              className="absolute right-1 top-0 bottom-0"
              style={{ width: 3, backgroundColor: '#6B7280', top: staffTopY, height: 4 * lineGap }}
            />

            {allNotesRef.current.map((note, idx) => {
              const isCurrent = idx === currentNoteIndex && phase === 'playing';
              const flash = flashNotes[idx];
              const x = 30 + idx * noteWidth;
              const y = getStaffY(note.pitch, staffTopY, lineGap);
              const isRight = note.hand === 'right';
              const baseColor = isRight ? '#F97316' : '#38BDF8';
              let fillColor = baseColor;
              if (flash === 'correct') fillColor = '#4CAF50';
              if (flash === 'wrong') fillColor = '#EF4444';
              if (idx < currentNoteIndex) fillColor = '#D1D5DB';

              const showLedger = isLedgerLine(note.pitch);

              return (
                <g key={idx}>
                  {showLedger && (
                    <div
                      className="absolute"
                      style={{
                        left: x - 8,
                        top: staffTopY + 4 * lineGap + 1,
                        width: noteWidth * 0.8,
                        height: 1,
                        backgroundColor: '#9CA3AF',
                      }}
                    />
                  )}
                  <motion.div
                    className="absolute flex items-center justify-center"
                    style={{
                      left: x - 8,
                      top: y - 8,
                      width: 16,
                      height: 16,
                    }}
                    animate={isCurrent ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                    transition={isCurrent ? { repeat: Infinity, duration: 0.6 } : {}}
                  >
                    <div
                      className="rounded-full"
                      style={{
                        width: isCurrent ? 16 : 12,
                        height: isCurrent ? 16 : 12,
                        backgroundColor: fillColor,
                        border: isCurrent ? '2px solid #fff' : 'none',
                        boxShadow: isCurrent ? `0 0 8px ${baseColor}` : 'none',
                      }}
                    />
                  </motion.div>
                  {isCurrent && (
                    <div
                      className="absolute text-[8px] font-bold text-gray-600"
                      style={{
                        left: x - 4,
                        top: y + 12,
                      }}
                    >
                      {NOTE_TO_KEY[note.pitch] ?? '?'}
                    </div>
                  )}
                </g>
              );
            })}
          </div>
        </div>

        <div className="w-full max-w-4xl flex items-center justify-center mb-3">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#E5E7EB" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke={beatColor}
                strokeWidth="6"
                strokeDasharray={`${beatProgress * 213.6} 213.6`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: beatColor }}>
                {beatInMeasure}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-4xl bg-white/80 backdrop-blur rounded-2xl shadow-lg p-3 mb-3">
          <div className="relative h-16">
            <div className="absolute inset-x-0 top-1/2 h-1 bg-gray-200 rounded-full -translate-y-1/2" />
            <div
              className="absolute top-0 bottom-0 left-0 rounded-full"
              style={{
                width: `${(characterPos / Math.max(totalNotes, 1)) * 100}%`,
                backgroundColor: `${area?.accentColor ?? '#F97316'}33`,
              }}
            />
            <AnimatePresence>
              {obstacleEmoji && (
                <motion.div
                  className="absolute text-2xl"
                  style={{
                    left: `${(characterPos / Math.max(totalNotes, 1)) * 100 + 5}%`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {obstacleEmoji}
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div
              className="absolute text-2xl"
              style={{
                left: `${(characterPos / Math.max(totalNotes, 1)) * 100}%`,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
              animate={isWiggling
                ? { x: [0, -6, 6, -6, 6, 0], rotate: [0, -10, 10, -10, 10, 0] }
                : characterPos > 0
                  ? { y: [0, -8, 0] }
                  : {}
              }
              transition={isWiggling ? { duration: 0.4 } : { duration: 0.3, repeat: characterPos > 0 ? 0 : 0 }}
            >
              🎵
            </motion.div>
          </div>
        </div>

        <div className="w-full max-w-4xl flex items-center justify-center gap-1 mb-2 flex-wrap">
          {['A=C4', 'S=D4', 'D=E4', 'F=F4', 'G=G4', 'H=A4', 'J=B4', 'K=C5'].map((mapping) => {
            const [key, note] = mapping.split('=');
            const currentNote = allNotesRef.current[currentNoteIndex];
            const isExpected = phase === 'playing' && currentNote?.pitch === note;
            return (
              <div
                key={key}
                className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg text-xs font-bold transition-all
                  ${isExpected
                    ? 'bg-orange-400 text-white scale-110 shadow-lg shadow-orange-300'
                    : 'bg-white/60 text-gray-600'
                  }`}
              >
                <span className="text-[10px] opacity-70">{note}</span>
                <span>{key}</span>
              </div>
            );
          })}
        </div>

        {phase === 'playing' && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>✅ {correctCount}</span>
            <span>❌ {wrongCount}</span>
            <span>⏭️ {missedCount}</span>
            <span>
              {currentNoteIndex + 1}/{totalNotes}
            </span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {phase === 'ready' && (
          <motion.div
            className="absolute inset-0 bg-black/40 flex items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm mx-4"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
            >
              <div className="text-4xl mb-3">{area?.icon ?? '🎵'}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{level.name}</h2>
              <p className="text-sm text-gray-500 mb-1">{level.description}</p>
              <p className="text-xs text-gray-400 mb-4">
                难度: {level.difficulty === 'easy' ? '⭐' : level.difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐'}
                {' · '}BPM: {level.bpm}
              </p>
              <div className="text-xs text-gray-400 mb-4">
                {totalNotes} 个音符 · {level.musicData.measures.length} 小节
              </div>
              <button
                onClick={handleCountdown}
                className="px-8 py-3 bg-orange-400 hover:bg-orange-500 text-white rounded-full text-lg font-bold flex items-center gap-2 mx-auto transition-colors shadow-lg shadow-orange-200"
              >
                <Play size={20} />
                开始演奏
              </button>
            </motion.div>
          </motion.div>
        )}

        {phase === 'countdown' && (
          <motion.div
            className="absolute inset-0 bg-black/40 flex items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              key={countdownNum}
              className="text-8xl font-bold text-white drop-shadow-lg"
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {countdownNum}
            </motion.div>
          </motion.div>
        )}

        {phase === 'ended' && (
          <motion.div
            className="absolute inset-0 bg-black/40 flex items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm mx-4"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
            >
              <div className="text-4xl mb-3">
                {earnedStars >= 3 ? '🎉' : earnedStars >= 1 ? '👏' : '💪'}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {earnedStars >= 3 ? '太棒了！' : earnedStars >= 1 ? '继续加油！' : '再试一次！'}
              </h2>
              <div className="flex items-center justify-center gap-1 mb-3">
                {[1, 2, 3].map(s => (
                  <Star
                    key={s}
                    size={28}
                    className={s <= earnedStars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600 mb-1">
                正确率: {Math.round(accuracy * 100)}%
              </div>
              <div className="text-sm text-gray-600 mb-1">
                ✅ {correctCount} · ❌ {wrongCount} · ⏭️ {missedCount}
              </div>
              <div className="text-sm text-amber-600 font-bold mb-4">
                🪙 +{earnedCoins}
              </div>
              <div className="flex flex-col gap-2">
                {earnedStars >= 2 && (
                  <button
                    onClick={() => navigate('/map')}
                    className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold transition-colors"
                  >
                    下一关
                  </button>
                )}
                <button
                  onClick={handlePhraseRetry}
                  className="px-6 py-2.5 bg-orange-400 hover:bg-orange-500 text-white rounded-full font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw size={16} />
                  重新挑战
                </button>
                {earnedStars < 3 && (
                  <>
                    <button
                      onClick={handleSlowRetry}
                      className="px-6 py-2.5 bg-sky-400 hover:bg-sky-500 text-white rounded-full font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      🐢 慢速重试
                    </button>
                    <button
                      onClick={handlePhraseRetry}
                      className="px-6 py-2.5 bg-purple-400 hover:bg-purple-500 text-white rounded-full font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Scissors size={16} />
                      分句重试
                    </button>
                  </>
                )}
                <button
                  onClick={() => navigate('/map')}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-bold transition-colors"
                >
                  返回地图
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
