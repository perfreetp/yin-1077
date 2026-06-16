import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Lock, ChevronDown, ChevronUp, Coins, ShieldAlert, Clock } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { AREAS, getLevelsByArea } from '@/data/gameData';
import { SKILL_LABELS } from '@/types';

const AREA_COLORS: Record<string, string> = {
  forest: 'from-forest to-emerald-300',
  sky: 'from-sky to-blue-300',
  castle: 'from-purple-500 to-pink-400',
  lava: 'from-lava to-orange-400',
  cosmos: 'from-cosmos to-indigo-400',
};

const AREA_BORDER_COLORS: Record<string, string> = {
  forest: 'border-forest',
  sky: 'border-sky',
  castle: 'border-purple-400',
  lava: 'border-lava',
  cosmos: 'border-cosmos',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-400 text-green-900',
  medium: 'bg-yellow-400 text-yellow-900',
  hard: 'bg-coral text-red-900',
};

const DIFFICULTY_LEVELS: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

export default function MapPage() {
  const navigate = useNavigate();
  const { player, getAreaProgress, isLevelUnlocked, getLevelProgress, settings, isDailyTimeExceeded, todayPlayTime } = useGameStore();
  const [expandedArea, setExpandedArea] = useState<number | null>(null);
  const [restrictionMsg, setRestrictionMsg] = useState<string | null>(null);

  const timeExceeded = isDailyTimeExceeded();

  const toggleArea = (areaId: number) => {
    setExpandedArea(prev => (prev === areaId ? null : areaId));
  };

  return (
    <div className="min-h-screen bg-cream pb-8">
      <div className="sticky top-0 z-30 bg-gradient-to-r from-primary to-coral px-4 py-3 shadow-lg">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/30 text-2xl shadow-inner backdrop-blur-sm">
              🎵
            </div>
            <div>
              <p className="font-display text-lg font-bold text-white">{player.name}</p>
              <p className="font-body text-xs text-white/80">视奏大冒险</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
            <Coins className="h-5 w-5 text-gold" />
            <span className="font-body text-sm font-bold text-gold">{player.coins}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-5">
        <h1 className="mb-5 text-center font-display text-3xl font-extrabold text-primary drop-shadow-sm">
          🗺️ 冒险地图
        </h1>

        {timeExceeded && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-coral/10 border-2 border-coral/30 px-4 py-3">
            <Clock className="h-5 w-5 text-coral shrink-0" />
            <p className="font-body text-sm text-coral">今日游戏时间已达上限，休息一下明天再冒险吧！</p>
          </div>
        )}

        <AnimatePresence>
          {restrictionMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 flex items-center gap-2 rounded-2xl bg-amber-50 border-2 border-amber-200 px-4 py-3"
            >
              <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="font-body text-sm text-amber-700">{restrictionMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-4">
          {AREAS.map(area => {
            const progress = getAreaProgress(area.id);
            const isExpanded = expandedArea === area.id;
            const levels = getLevelsByArea(area.id);
            const totalStars = levels.reduce((sum, l) => sum + (getLevelProgress(l.id)?.stars ?? 0), 0);
            const maxStars = levels.length * 3;
            const bgGradient = AREA_COLORS[area.theme] ?? 'from-primary to-primary/60';
            const borderColor = AREA_BORDER_COLORS[area.theme] ?? 'border-primary';

            return (
              <motion.div
                key={area.id}
                layout
                className={`overflow-hidden rounded-2xl border-2 ${borderColor} bg-white shadow-xl`}
              >
                <motion.div
                  layout
                  className={`relative cursor-pointer bg-gradient-to-r ${bgGradient} p-5 transition-shadow hover:shadow-2xl`}
                  onClick={() => toggleArea(area.id)}
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/25 text-4xl shadow backdrop-blur-sm">
                      {area.icon}
                    </span>
                    <div className="flex-1">
                      <h2 className="font-display text-xl font-bold text-white drop-shadow">
                        {area.name}
                      </h2>
                      <p className="font-body text-sm text-white/85">{area.description}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      {isExpanded ? (
                        <ChevronUp className="h-6 w-6 text-white/80" />
                      ) : (
                        <ChevronDown className="h-6 w-6 text-white/80" />
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 backdrop-blur-sm">
                      <MapPin className="h-4 w-4 text-white/90" />
                      <span className="font-body text-xs font-semibold text-white">
                        {progress.completed}/{progress.total}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 backdrop-blur-sm">
                      <Star className="h-4 w-4 text-gold" fill="currentColor" />
                      <span className="font-body text-xs font-semibold text-white">
                        {totalStars}/{maxStars}
                      </span>
                    </div>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-2.5 p-4">
                        {levels.map(level => {
                          const baseUnlocked = isLevelUnlocked(level.id);
                          const levelProgress = getLevelProgress(level.id);
                          const starsEarned = levelProgress?.stars ?? 0;
                          const skillLabel = SKILL_LABELS[level.skillType] ?? level.skillType;
                          const diffClass = DIFFICULTY_COLORS[level.difficulty] ?? DIFFICULTY_COLORS.easy;
                          const diffLevel = DIFFICULTY_LEVELS[level.difficulty] ?? 1;
                          const difficultyBlocked = diffLevel > settings.maxDifficulty;
                          const timeBlocked = timeExceeded;
                          const playable = baseUnlocked && !difficultyBlocked && !timeBlocked;
                          const restricted = baseUnlocked && (difficultyBlocked || timeBlocked);

                          return (
                            <motion.button
                              key={level.id}
                              whileHover={playable ? { scale: 1.02 } : {}}
                              whileTap={playable ? { scale: 0.98 } : {}}
                              disabled={!playable && !restricted}
                              className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors ${
                                playable
                                  ? 'border-cream bg-white hover:border-primary/40 hover:bg-primary/5'
                                  : restricted
                                    ? 'border-amber-200 bg-amber-50 cursor-pointer'
                                    : 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60'
                              }`}
                              onClick={() => {
                                if (playable) {
                                  setRestrictionMsg(null);
                                  navigate(`/level/${level.id}`);
                                } else if (restricted) {
                                  if (timeBlocked) {
                                    setRestrictionMsg('今日游戏时间已达上限，请休息后再来冒险！');
                                  } else if (difficultyBlocked) {
                                    setRestrictionMsg('这个关卡难度较高，家长暂时还没解锁哦，先练习前面的关卡吧！');
                                  }
                                }
                              }}
                            >
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${
                                  playable ? 'bg-primary/10' : restricted ? 'bg-amber-100' : 'bg-gray-200'
                                }`}
                              >
                                {playable ? (level.isBoss ? '👹' : '🎵') : restricted ? <ShieldAlert className="h-5 w-5 text-amber-400" /> : <Lock className="h-5 w-5 text-gray-400" />}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p
                                  className={`font-display text-sm font-bold truncate ${
                                    playable ? 'text-gray-800' : restricted ? 'text-amber-600' : 'text-gray-400'
                                  }`}
                                >
                                  {level.name}
                                </p>
                                <div className="mt-0.5 flex items-center gap-2">
                                  <span className="rounded-full bg-primary/10 px-2 py-0.5 font-body text-[10px] font-semibold text-primary">
                                    {skillLabel}
                                  </span>
                                  <span className={`rounded-full px-2 py-0.5 font-body text-[10px] font-semibold ${diffClass}`}>
                                    {level.difficulty}
                                  </span>
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-0.5">
                                {[1, 2, 3].map(s => (
                                  <Star
                                    key={s}
                                    className={`h-4 w-4 ${
                                      s <= starsEarned ? 'text-gold' : 'text-gray-200'
                                    }`}
                                    fill="currentColor"
                                  />
                                ))}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
