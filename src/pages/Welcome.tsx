import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Play, Sparkles } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

const CHARACTERS = [
  { id: 1, emoji: '🧒', label: '冒险少年' },
  { id: 2, emoji: '👦', label: '勇敢少年' },
  { id: 3, emoji: '👧', label: '聪明少女' },
];

const FLOATING_NOTES = [
  { emoji: '🎵', x: '8%', y: '15%', delay: 0, duration: 4 },
  { emoji: '🎶', x: '85%', y: '20%', delay: 0.5, duration: 3.5 },
  { emoji: '🎼', x: '12%', y: '70%', delay: 1, duration: 4.5 },
  { emoji: '🎵', x: '90%', y: '75%', delay: 1.5, duration: 3.8 },
  { emoji: '🎶', x: '50%', y: '10%', delay: 0.8, duration: 4.2 },
  { emoji: '🎼', x: '30%', y: '80%', delay: 1.2, duration: 3.6 },
];

const FLOATING_CLOUDS = [
  { x: '5%', y: '8%', scale: 1, delay: 0 },
  { x: '70%', y: '5%', scale: 0.7, delay: 2 },
  { x: '40%', y: '12%', scale: 0.85, delay: 4 },
];

const FLOATING_STARS = [
  { x: '15%', y: '25%', delay: 0, size: 16 },
  { x: '80%', y: '35%', delay: 1.5, size: 12 },
  { x: '25%', y: '55%', delay: 3, size: 14 },
  { x: '75%', y: '60%', delay: 0.5, size: 10 },
  { x: '50%', y: '45%', delay: 2, size: 18 },
  { x: '92%', y: '50%', delay: 2.5, size: 12 },
];

const TITLE_CHARS = ['视', '奏', '大', '冒', '险'];

export default function Welcome() {
  const navigate = useNavigate();
  const { player, setPlayerName, initStore } = useGameStore();
  const [selectedAvatar, setSelectedAvatar] = useState(player.avatarId);
  const [name, setName] = useState('');
  const hasExistingSave = player.name !== '小冒险家';

  useEffect(() => {
    initStore();
  }, [initStore]);

  const handleStart = () => {
    if (name.trim()) {
      setPlayerName(name.trim());
    }
    navigate('/map');
  };

  const handleContinue = () => {
    navigate('/map');
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-cream via-cream-dark to-[#FFE8C8] px-6 py-10">
      {FLOATING_CLOUDS.map((cloud, i) => (
        <motion.div
          key={`cloud-${i}`}
          className="pointer-events-none absolute text-5xl opacity-20"
          style={{ left: cloud.x, top: cloud.y }}
          initial={{ opacity: 0, x: -30 }}
          animate={{
            opacity: 0.2,
            x: [0, 20, 0],
            y: [0, -5, 0],
          }}
          transition={{
            x: { duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 5 + i, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 1, delay: cloud.delay },
          }}
        >
          ☁️
        </motion.div>
      ))}

      {FLOATING_NOTES.map((note, i) => (
        <motion.div
          key={`note-${i}`}
          className="pointer-events-none absolute text-3xl"
          style={{ left: note.x, top: note.y }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            y: [0, -15, 0],
            rotate: [0, 10, -10, 0],
            scale: [0.8, 1.1, 0.8],
          }}
          transition={{
            duration: note.duration,
            delay: note.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {note.emoji}
        </motion.div>
      ))}

      {FLOATING_STARS.map((star, i) => (
        <motion.div
          key={`star-${i}`}
          className="pointer-events-none absolute text-gold"
          style={{ left: star.x, top: star.y, fontSize: star.size }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [0.6, 1.2, 0.6],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 5 + i * 0.5,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          ✦
        </motion.div>
      ))}

      <motion.button
        className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/50 backdrop-blur-sm transition-colors hover:bg-white/80"
        onClick={() => navigate('/parent')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Shield className="h-5 w-5 text-primary-dark" />
      </motion.button>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6">
        <motion.div
          className="flex flex-col items-center gap-2"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          <div className="flex items-center gap-1">
            {TITLE_CHARS.map((char, i) => (
              <motion.span
                key={i}
                className="font-display text-5xl font-extrabold drop-shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #FF8C42, #FF6B6B, #FFD54F)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.5 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { type: 'spring', stiffness: 200, damping: 12 },
                  },
                }}
              >
                {char}
              </motion.span>
            ))}
          </div>

          <motion.div
            className="flex items-center gap-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Sparkles className="h-4 w-4 text-gold" />
            <span className="font-body text-sm font-semibold text-primary-dark">
              儿童视奏启蒙游戏
            </span>
            <Sparkles className="h-4 w-4 text-gold" />
          </motion.div>
        </motion.div>

        <motion.div
          className="flex gap-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {CHARACTERS.map((char) => (
            <motion.button
              key={char.id}
              className={`flex h-20 w-20 items-center justify-center rounded-full text-4xl transition-all ${
                selectedAvatar === char.id
                  ? 'bg-white shadow-lg ring-4 ring-primary ring-offset-2 scale-110'
                  : 'bg-white/70 shadow hover:bg-white hover:shadow-md'
              }`}
              onClick={() => setSelectedAvatar(char.id)}
              whileHover={{ scale: selectedAvatar === char.id ? 1.1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {char.emoji}
            </motion.button>
          ))}
        </motion.div>

        {!hasExistingSave && (
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入你的冒险家名字..."
              maxLength={12}
              className="w-full rounded-2xl border-2 border-primary/20 bg-white/80 px-5 py-3.5 text-center font-body text-lg font-semibold text-gray-700 shadow-md placeholder:text-gray-300 placeholder:font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </motion.div>
        )}

        <motion.div
          className="flex w-full flex-col items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          {hasExistingSave ? (
            <>
              <motion.button
                className="btn-game-primary flex w-full max-w-xs items-center justify-center gap-2 text-xl py-4"
                onClick={handleContinue}
                animate={{
                  scale: [1, 1.03, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <Play className="h-6 w-6" fill="currentColor" />
                继续冒险
              </motion.button>
              <p className="font-body text-sm text-primary-dark/60">
                欢迎回来，{player.name}！🎵
              </p>
            </>
          ) : (
            <motion.button
              className="btn-game-primary flex w-full max-w-xs items-center justify-center gap-2 text-xl py-4"
              onClick={handleStart}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <Sparkles className="h-6 w-6" />
              开始冒险！
            </motion.button>
          )}
        </motion.div>

        <motion.div
          className="mt-2 flex items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          {['🎵', '🎹', '🎶', '⭐', '🎼'].map((emoji, i) => (
            <motion.span
              key={i}
              className="text-lg"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {emoji}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
