import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shirt, Award, Piano, Lock, Check, Coins } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { ITEMS } from '@/data/gameData';
import { ItemType, RARITY_COLORS } from '@/types';

type TabKey = 'costume' | 'badge' | 'instrument';

const TABS: { key: TabKey; label: string; icon: typeof Shirt }[] = [
  { key: 'costume', label: '服装', icon: Shirt },
  { key: 'badge', label: '徽章', icon: Award },
  { key: 'instrument', label: '乐器', icon: Piano },
];

const RARITY_GLOW: Record<string, string> = {
  common: '0 0 6px rgba(158,158,158,0.5)',
  rare: '0 0 8px rgba(66,165,245,0.6)',
  epic: '0 0 10px rgba(171,71,188,0.7)',
  legendary: '0 0 14px rgba(255,213,79,0.8), 0 0 28px rgba(255,193,7,0.4)',
};

const RARITY_BORDER: Record<string, string> = {
  common: 'border-gray-300',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400',
};

const RARITY_BG: Record<string, string> = {
  common: 'from-gray-50 to-gray-100',
  rare: 'from-blue-50 to-blue-100',
  epic: 'from-purple-50 to-purple-100',
  legendary: 'from-yellow-50 to-amber-100',
};

function CharacterAvatar({ equippedCostume, equippedBadge, equippedInstrument }: {
  equippedCostume: string | null;
  equippedBadge: string | null;
  equippedInstrument: string | null;
}) {
  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-b from-primary/20 to-coral/20 shadow-game">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-b from-white to-cream shadow-card">
            <span className="text-6xl select-none">🧒</span>
          </div>

          {equippedCostume && (
            <motion.span
              key={equippedCostume}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-card text-xl"
            >
              {equippedCostume}
            </motion.span>
          )}

          {equippedBadge && (
            <motion.span
              key={equippedBadge}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute -top-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-card text-base"
            >
              {equippedBadge}
            </motion.span>
          )}

          {equippedInstrument && (
            <motion.span
              key={equippedInstrument}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute -bottom-1 -left-1 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-card text-xl"
            >
              {equippedInstrument}
            </motion.span>
          )}
        </div>
      </motion.div>

      <div className="mt-3 flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 shadow-card backdrop-blur-sm">
        <span className="text-sm">✨</span>
        <span className="font-display text-sm font-bold text-primary">小冒险家</span>
        <span className="text-sm">✨</span>
      </div>
    </div>
  );
}

function ItemCard({ item, isOwned, isEquipped, onAction }: {
  item: typeof ITEMS[number];
  isOwned: boolean;
  isEquipped: boolean;
  onAction: () => void;
}) {
  const rarityColor = RARITY_COLORS[item.rarity] ?? RARITY_COLORS.common;
  const rarityBorder = RARITY_BORDER[item.rarity] ?? RARITY_BORDER.common;
  const rarityBg = RARITY_BG[item.rarity] ?? RARITY_BG.common;

  return (
    <motion.button
      layout
      whileHover={isOwned ? { scale: 1.05, y: -2 } : {}}
      whileTap={isOwned ? { scale: 0.95 } : {}}
      onClick={onAction}
      className={`relative flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 transition-all bg-gradient-to-b ${rarityBg} ${rarityBorder} ${
        isEquipped ? 'animate-pulse-glow' : ''
      } ${!isOwned ? 'opacity-70' : ''}`}
      style={isEquipped ? { boxShadow: RARITY_GLOW[item.rarity] ?? RARITY_GLOW.common } : {}}
    >
      {isEquipped && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 shadow-md"
        >
          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
        </motion.div>
      )}

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/80 text-2xl shadow-sm">
        {isOwned ? item.icon : <Lock className="h-6 w-6 text-gray-400" />}
      </div>

      <span
        className="max-w-[72px] truncate font-display text-xs font-bold text-gray-700"
        title={item.name}
      >
        {item.name}
      </span>

      {isOwned ? (
        isEquipped ? (
          <span className="rounded-full bg-green-100 px-2 py-0.5 font-body text-[10px] font-semibold text-green-700">
            已装备
          </span>
        ) : (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-body text-[10px] font-semibold text-primary">
            点击装备
          </span>
        )
      ) : (
        <span className="flex items-center gap-0.5 rounded-full bg-gold/20 px-2 py-0.5 font-body text-[10px] font-semibold text-amber-700">
          <Coins className="h-3 w-3" />
          {item.price}
        </span>
      )}

      <span
        className="absolute bottom-0 left-0 h-0.5 w-full rounded-b-2xl"
        style={{ backgroundColor: rarityColor }}
      />
    </motion.button>
  );
}

export default function CharacterPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('costume');
  const { player, getOwnedItems, getEquippedItems, purchaseItem, equipItem, unequipItem } = useGameStore();

  const ownedItems = getOwnedItems();
  const equippedItems = getEquippedItems();
  const ownedItemIds = new Set(ownedItems.map(i => i.itemId));
  const equippedItemIds = new Set(equippedItems.map(i => i.itemId));

  const filteredItems = ITEMS.filter(item => item.type === activeTab);

  const equippedCostume = equippedItems.find(e => {
    const item = ITEMS.find(i => i.id === e.itemId);
    return item?.type === 'costume';
  });
  const equippedBadge = equippedItems.find(e => {
    const item = ITEMS.find(i => i.id === e.itemId);
    return item?.type === 'badge';
  });
  const equippedInstrument = equippedItems.find(e => {
    const item = ITEMS.find(i => i.id === e.itemId);
    return item?.type === 'instrument';
  });

  const costumeIcon = equippedCostume ? ITEMS.find(i => i.id === equippedCostume.itemId)?.icon ?? null : null;
  const badgeIcon = equippedBadge ? ITEMS.find(i => i.id === equippedBadge.itemId)?.icon ?? null : null;
  const instrumentIcon = equippedInstrument ? ITEMS.find(i => i.id === equippedInstrument.itemId)?.icon ?? null : null;

  const handleItemAction = (itemId: number) => {
    if (ownedItemIds.has(itemId)) {
      if (equippedItemIds.has(itemId)) {
        unequipItem(itemId);
      } else {
        equipItem(itemId);
      }
    } else {
      const item = ITEMS.find(i => i.id === itemId);
      if (item && player.coins >= item.price) {
        purchaseItem(itemId);
      }
    }
  };

  return (
    <div className="min-h-screen bg-cream pb-6">
      <div className="sticky top-0 z-30 bg-gradient-to-r from-primary to-coral px-4 py-3 shadow-lg">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <h1 className="font-display text-xl font-bold text-white drop-shadow-sm">
            🎭 角色装扮
          </h1>
          <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
            <Coins className="h-5 w-5 text-gold" />
            <span className="font-body text-sm font-bold text-gold">{player.coins}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-6">
        <CharacterAvatar
          equippedCostume={costumeIcon}
          equippedBadge={badgeIcon}
          equippedInstrument={instrumentIcon}
        />

        <div className="mt-6 flex rounded-2xl bg-white/80 p-1.5 shadow-card backdrop-blur-sm">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 font-display text-sm font-bold transition-all ${
                  isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl bg-primary/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="relative h-4 w-4" />
                <span className="relative">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-3 gap-3 sm:grid-cols-4"
            >
              {filteredItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isOwned={ownedItemIds.has(item.id)}
                  isEquipped={equippedItemIds.has(item.id)}
                  onAction={() => handleItemAction(item.id)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
