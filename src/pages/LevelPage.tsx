import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, Scissors, Star, Volume2, AlertTriangle, Target, Clock, Music, Award, TrendingUp, TrendingDown, ArrowRight, Zap } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { getLevelById } from '@/data/gameData';
import { AREAS } from '@/data/gameData';
import type { Note, PracticeSpeed, FocusType, LastSessionResult } from '@/types';
import { FOCUS_LABELS, FOCUS_ICONS, FOCUS_TIPS } from '@/types';

type GamePhase = 'ready' | 'countdown' | 'playing' | 'ended';

const KEY_TO_NOTE: Record<string, string> = {
  z: 'C3', x: 'D3', c: 'E3', v: 'F3',
  b: 'G3', n: 'A3',
  a: 'C4', s: 'D4', d: 'E4', f: 'F4',
  g: 'G4', h: 'A4', j: 'B4', k: 'C5',
  q: 'D5', w: 'E5', e: 'F5', r: 'G5', t: 'A5',
};

const NOTE_TO_KEY: Record<string, string> = {
  C3: 'Z', D3: 'X', E3: 'C', F3: 'V',
  G3: 'B', A3: 'N',
  C4: 'A', D4: 'S', E4: 'D', F4: 'F',
  G4: 'G', A4: 'H', B4: 'J', C5: 'K',
  D5: 'Q', E5: 'W', F5: 'E', G5: 'R', A5: 'T',
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
  const player = useGameStore(s => s.player);
  const startLevelSession = useGameStore(s => s.startLevelSession);
  const endLevelSession = useGameStore(s => s.endLevelSession);
  const isDailyTimeExceeded = useGameStore(s => s.isDailyTimeExceeded);
  const checkCanEnterLevel = useGameStore(s => s.checkCanEnterLevel);
  const recordPracticeSession = useGameStore(s => s.recordPracticeSession);
  const getLastSessionResult = useGameStore(s => s.getLastSessionResult);
  const setLastSessionResult = useGameStore(s => s.setLastSessionResult);
  const suggestFocus = useGameStore(s => s.suggestFocus);

  const levelId = Number(id);
  const level = getLevelById(levelId);
  const area = level ? AREAS.find(a => a.id === level.areaId) : null;

  const [phase, setPhase] = useState<GamePhase>('ready');
  const [countdownNum, setCountdownNum] = useState(3);
  const [bpm, setBpm] = useState(level?.bpm ?? 60);
  const [practiceSpeed, setPracticeSpeed] = useState<PracticeSpeed>('normal');
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
  const [rhythmDeviations, setRhythmDeviations] = useState<number[]>([]);
  const [rhythmSignedDeviations, setRhythmSignedDeviations] = useState<number[]>([]);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [lastSessionResult, setLastSessionResultState] = useState<LastSessionResult | null>(null);
  const [practiceFocus, setPracticeFocus] = useState<FocusType | null>(null);
  const [noteStartTimes, setNoteStartTimes] = useState<number[]>([]);

  const allNotesRef = useRef<Note[]>([]);
  const beatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentNoteIndexRef = useRef(0);
  const hasPressedRef = useRef(false);
  const phaseRef = useRef<GamePhase>('ready');
  const noteStartTimesRef = useRef<number[]>([]);

  useEffect(() => {
    if (!level) return;

    const checkResult = checkCanEnterLevel(levelId);
    if (!checkResult.allowed) {
      if (checkResult.reason === 'time') {
        setBlockedMessage('今日游戏时间已达上限，休息一下明天再来吧！');
      } else if (checkResult.reason === 'difficulty') {
        setBlockedMessage('这个关卡难度较高，家长暂时还没解锁哦，先练习前面的关卡吧！');
      } else {
        setBlockedMessage('这个关卡还没有解锁，请先完成前面的关卡！');
      }
      const timer = setTimeout(() => navigate('/map'), 1500);
      return () => clearTimeout(timer);
    }

    const lastResult = getLastSessionResult(levelId);
    if (lastResult) {
      setLastSessionResultState(lastResult);
      setPracticeFocus(lastResult.suggestedFocus);
    }

    const startTs = startLevelSession();
    if (startTs) setSessionStartTime(startTs);

    return () => {
      endLevelSession();
    };
  }, [levelId, level, checkCanEnterLevel, startLevelSession, endLevelSession, navigate, getLastSessionResult]);

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
    const avgRhythmDeviation = rhythmDeviations.length > 0
      ? rhythmDeviations.reduce((a, b) => a + b, 0) / rhythmDeviations.length
      : 0;
    const earlyCount = rhythmSignedDeviations.filter(d => d < -0.2).length;
    const lateCount = rhythmSignedDeviations.filter(d => d > 0.2).length;

    const result = completeLevel(levelId, acc);

    setEarnedStars(result.stars);
    setEarnedCoins(result.coins);

    const elapsedMinutes = endLevelSession();
    const durationMinutes = elapsedMinutes > 0 ? elapsedMinutes : Math.max(0.1, (Date.now() - sessionStartTime) / 60000);

    const suggestedFocus = suggestFocus(wrongCount, missedCount, avgRhythmDeviation);

    setLastSessionResult(levelId, {
      accuracy: acc,
      wrongNoteCount: wrongCount,
      missedNoteCount: missedCount,
      rhythmDeviationAvg: avgRhythmDeviation,
      rhythmEarlyCount: earlyCount,
      rhythmLateCount: lateCount,
      suggestedFocus,
    });

    if (level && area) {
      recordPracticeSession({
        levelId: level.id,
        levelName: level.name,
        areaId: area.id,
        areaName: area.name,
        skillType: level.skillType,
        speed: practiceSpeed,
        durationMinutes: Math.round(durationMinutes * 10) / 10,
        accuracy: acc,
        passed: result.passed,
        stars: result.stars,
        wrongNoteCount: wrongCount,
        missedNoteCount: missedCount,
        rhythmDeviationAvg: avgRhythmDeviation,
        rhythmEarlyCount: earlyCount,
        rhythmLateCount: lateCount,
        skillScore: acc * 100,
        practiceFocus: practiceFocus ?? undefined,
      });
    }
  }, [correctCount, levelId, completeLevel, stopBeatTimer, rhythmDeviations, rhythmSignedDeviations, level, area, sessionStartTime, practiceSpeed, wrongCount, missedCount, recordPracticeSession, endLevelSession, suggestFocus, setLastSessionResult, practiceFocus]);

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

    noteStartTimesRef.current[nextIdx] = Date.now();

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
    setRhythmDeviations([]);
    setRhythmSignedDeviations([]);
    hasPressedRef.current = false;
    noteStartTimesRef.current = [Date.now()];

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

  const resetLevelState = useCallback(() => {
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
    setRhythmDeviations([]);
    setRhythmSignedDeviations([]);
    hasPressedRef.current = false;
  }, []);

  const handleRetry = useCallback((speed: PracticeSpeed = 'normal', focusOverride?: FocusType) => {
    const prevFocus = practiceFocus;
    if (focusOverride) {
      setPracticeFocus(focusOverride);
    }
    setPracticeSpeed(speed);
    resetLevelState();
    setEarnedStars(0);
    setEarnedCoins(0);

    const newStartTs = startLevelSession();
    if (newStartTs) setSessionStartTime(newStartTs);

    handleCountdown();

    const targetBpm = speed === 'slow' ? Math.round((level?.bpm ?? 60) * 0.7) : (level?.bpm ?? 60);
    setTimeout(() => {
      stopBeatTimer();
      startPlaying(targetBpm);
    }, 2400);
  }, [level, handleCountdown, startPlaying, stopBeatTimer, resetLevelState, startLevelSession, practiceFocus]);

  const handleSlowRetry = useCallback(() => {
    handleRetry('slow');
  }, [handleRetry]);

  const handlePhraseRetry = useCallback(() => {
    handleRetry('phrase');
  }, [handleRetry]);

  const handleNormalRetry = useCallback(() => {
    handleRetry('normal');
  }, [handleRetry]);

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
    const noteStartTime = noteStartTimesRef.current[currentIdx] ?? Date.now();
    const beatMs = 60000 / (bpm || 60);
    const elapsedMs = Date.now() - noteStartTime;
    const signedBeatDiff = (elapsedMs / beatMs) - 1;
    const absBeatDiff = Math.abs(signedBeatDiff);

    if (absBeatDiff > 0.2) {
      setRhythmDeviations(prev => [...prev, absBeatDiff]);
      setRhythmSignedDeviations(prev => [...prev, signedBeatDiff]);
    }

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
  }, [totalNotes, obstacleIcon, bpm]);

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

        <div className="w-full max-w-4xl flex flex-col items-center gap-1 mb-2">
          <div className="flex items-center gap-1 flex-wrap justify-center">
            <span className="text-[10px] text-sky-500 font-bold mr-1">左手</span>
            {['Z=C3', 'X=D3', 'C=E3', 'V=F3', 'B=G3', 'N=A3'].map((mapping) => {
              const [key, note] = mapping.split('=');
              const currentNote = allNotesRef.current[currentNoteIndex];
              const isExpected = phase === 'playing' && currentNote?.pitch === note;
              return (
                <div
                  key={key}
                  className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg text-xs font-bold transition-all
                    ${isExpected
                      ? 'bg-sky-400 text-white scale-110 shadow-lg shadow-sky-300'
                      : 'bg-white/60 text-gray-600'
                    }`}
                >
                  <span className="text-[10px] opacity-70">{note}</span>
                  <span>{key}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-1 flex-wrap justify-center">
            <span className="text-[10px] text-primary font-bold mr-1">右手</span>
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
          <div className="flex items-center gap-1 flex-wrap justify-center">
            <span className="text-[10px] text-purple-500 font-bold mr-1">高音</span>
            {['Q=D5', 'W=E5', 'E=F5', 'R=G5', 'T=A5'].map((mapping) => {
              const [key, note] = mapping.split('=');
              const currentNote = allNotesRef.current[currentNoteIndex];
              const isExpected = phase === 'playing' && currentNote?.pitch === note;
              return (
                <div
                  key={key}
                  className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg text-xs font-bold transition-all
                    ${isExpected
                      ? 'bg-purple-400 text-white scale-110 shadow-lg shadow-purple-300'
                      : 'bg-white/60 text-gray-600'
                    }`}
                >
                  <span className="text-[10px] opacity-70">{note}</span>
                  <span>{key}</span>
                </div>
              );
            })}
          </div>
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
              className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm mx-4 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
            >
              <div className="text-4xl mb-3">{area?.icon ?? '🎵'}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{level.name}</h2>
              <p className="text-sm text-gray-500 mb-1">{level.description}</p>
              <p className="text-xs text-gray-400 mb-3">
                难度: {level.difficulty === 'easy' ? '⭐' : level.difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐'}
                {' · '}BPM: {level.bpm}
              </p>
              <div className="text-xs text-gray-400 mb-4">
                {totalNotes} 个音符 · {level.musicData.measures.length} 小节
              </div>

              {lastSessionResult && practiceFocus && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 text-left rounded-2xl p-4"
                  style={{
                    background: practiceFocus === 'pitch'
                      ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)'
                      : practiceFocus === 'rhythm'
                        ? 'linear-gradient(135deg, #DBEAFE, #BFDBFE)'
                        : 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{FOCUS_ICONS[practiceFocus]}</span>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">本次重点练习</p>
                      <p className="font-bold text-base" style={{
                        color: practiceFocus === 'pitch' ? '#B45309'
                          : practiceFocus === 'rhythm' ? '#1D4ED8'
                            : '#047857',
                      }}>
                        {FOCUS_LABELS[practiceFocus]}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 mb-2">
                    💡 {FOCUS_TIPS[practiceFocus]}
                  </p>
                  <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
                    <div className="bg-white/60 rounded-lg p-1.5">
                      <p className="text-gray-500">上次正确率</p>
                      <p className="font-bold text-gray-800">{Math.round(lastSessionResult.accuracy * 100)}%</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-1.5">
                      <p className="text-gray-500">错音/漏按</p>
                      <p className="font-bold text-gray-800">{lastSessionResult.wrongNoteCount}/{lastSessionResult.missedNoteCount}</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-1.5">
                      <p className="text-gray-500">节拍偏差</p>
                      <p className="font-bold text-gray-800">{lastSessionResult.rhythmDeviationAvg.toFixed(2)}</p>
                    </div>
                  </div>
                </motion.div>
              )}

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
              className="bg-white rounded-3xl p-6 text-center shadow-2xl max-w-sm mx-4 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
            >
              <div className="text-4xl mb-2">
                {earnedStars >= 3 ? '🎉' : earnedStars >= 1 ? '👏' : '💪'}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {earnedStars >= 3 ? '太棒了！' : earnedStars >= 1 ? '继续加油！' : '再试一次！'}
              </h2>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3].map(s => (
                  <Star
                    key={s}
                    size={24}
                    className={s <= earnedStars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600 mb-1">
                正确率: {Math.round(accuracy * 100)}%
              </div>

              {lastSessionResult && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-2 mb-3 text-xs flex items-center justify-around gap-1"
                >
                  {accuracy > lastSessionResult.accuracy ? (
                    <span className="text-green-600 font-semibold flex items-center gap-0.5">
                      <TrendingUp size={12} />
                      正确率 +{((accuracy - lastSessionResult.accuracy) * 100).toFixed(0)}%
                    </span>
                  ) : accuracy < lastSessionResult.accuracy ? (
                    <span className="text-red-500 font-semibold flex items-center gap-0.5">
                      <TrendingDown size={12} />
                      正确率 {((accuracy - lastSessionResult.accuracy) * 100).toFixed(0)}%
                    </span>
                  ) : (
                    <span className="text-gray-500 font-semibold flex items-center gap-0.5">
                      ➡️ 正确率一致
                    </span>
                  )}
                  {wrongCount < lastSessionResult.wrongNoteCount ? (
                    <span className="text-green-600 font-semibold">
                      错音 -{lastSessionResult.wrongNoteCount - wrongCount}
                    </span>
                  ) : wrongCount > lastSessionResult.wrongNoteCount ? (
                    <span className="text-orange-500 font-semibold">
                      错音 +{wrongCount - lastSessionResult.wrongNoteCount}
                    </span>
                  ) : null}
                  {missedCount < lastSessionResult.missedNoteCount ? (
                    <span className="text-green-600 font-semibold">
                      漏按 -{lastSessionResult.missedNoteCount - missedCount}
                    </span>
                  ) : missedCount > lastSessionResult.missedNoteCount ? (
                    <span className="text-orange-500 font-semibold">
                      漏按 +{missedCount - lastSessionResult.missedNoteCount}
                    </span>
                  ) : null}
                </motion.div>
              )}

              <div className="bg-gray-50 rounded-2xl p-3 my-2 text-left">
                <h3 className="font-bold text-gray-700 mb-2 text-sm flex items-center gap-1">
                  <Target size={14} />
                  练习分析
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-green-50 rounded-xl p-2">
                    <div className="text-green-600 font-bold text-lg">{correctCount}</div>
                    <div className="text-green-600 text-[10px]">✅ 正确</div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-2">
                    <div className="text-red-500 font-bold text-lg">{wrongCount}</div>
                    <div className="text-red-500 text-[10px]">❌ 错音</div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-2">
                    <div className="text-orange-500 font-bold text-lg">{missedCount}</div>
                    <div className="text-orange-500 text-[10px]">⏭️ 漏按</div>
                  </div>
                </div>
                <div className="mt-2 bg-blue-50 rounded-xl p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-blue-600 font-bold text-sm">
                        节拍偏差: {rhythmDeviations.length > 0 ? (rhythmDeviations.reduce((a, b) => a + b, 0) / rhythmDeviations.length).toFixed(2) : '0.00'} 拍
                      </div>
                      <div className="text-blue-600 text-[10px]">⏱️ 平均误差</div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 text-[10px]">
                      {rhythmSignedDeviations.filter(d => d < -0.2).length > 0 && (
                        <span className="text-purple-600 font-semibold">
                          ⚡ 偏早 {rhythmSignedDeviations.filter(d => d < -0.2).length} 次
                        </span>
                      )}
                      {rhythmSignedDeviations.filter(d => d > 0.2).length > 0 && (
                        <span className="text-amber-600 font-semibold">
                          🐢 偏晚 {rhythmSignedDeviations.filter(d => d > 0.2).length} 次
                        </span>
                      )}
                      {rhythmSignedDeviations.filter(d => d < -0.2).length === 0 && rhythmSignedDeviations.filter(d => d > 0.2).length === 0 && (
                        <span className="text-green-600 font-semibold">
                          ✨ 节拍稳定
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {(() => {
                const focus = suggestFocus(wrongCount, missedCount, rhythmDeviations.length > 0 ? rhythmDeviations.reduce((a, b) => a + b, 0) / rhythmDeviations.length : 0);
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-3 mb-3 text-left"
                    style={{
                      background: focus === 'pitch'
                        ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)'
                        : focus === 'rhythm'
                          ? 'linear-gradient(135deg, #DBEAFE, #BFDBFE)'
                          : 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Zap size={14} className={
                        focus === 'pitch' ? 'text-amber-600'
                          : focus === 'rhythm' ? 'text-blue-600'
                            : 'text-green-600'
                      } />
                      <p className="text-xs font-bold text-gray-700">
                        下次重点练习: <span className="text-sm">{FOCUS_ICONS[focus]} {FOCUS_LABELS[focus]}</span>
                      </p>
                    </div>
                    <p className="text-[11px] text-gray-600">
                      💡 {FOCUS_TIPS[focus]}
                    </p>
                  </motion.div>
                );
              })()}

              <div className="text-sm text-amber-600 font-bold mb-3">
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
                  onClick={handleNormalRetry}
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
