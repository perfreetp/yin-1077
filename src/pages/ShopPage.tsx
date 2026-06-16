import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, ShoppingBag, Check, Lock } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { ITEMS } from '@/data/gameData';
import { RARITY_COLORS } from '@/types';
import type { ItemType } from '@/types';

const CATEGORY_TABS: { type: ItemType; label: string; emoji: string }[] = [
  { type: 'costume', label: '服装', emoji: '👗' },
  { type: 'badge', label: '徽章', emoji: '🎖️' },
  { type: 'instrument', label: '乐器', emoji: '🎵' },
];

const RARITY_LABELS: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

export default function ShopPage() {
  const [activeTab, setActiveTab] = useState<ItemType>('costume');
  const [purchasingId, setPurchasingId] = useState<number | null>(null);
  const [flyingCoins, setFlyingCoins] = useState<{ id: number; x: number; y: number }[]>([]);

  const player = useGameStore(s => s.player);
  const purchaseItem = useGameStore(s => s.purchaseItem);
  const getOwnedItems = useGameStore(s => s.getOwnedItems);

  const ownedItems = getOwnedItems();
  const ownedIds = new Set(ownedItems.map(i => i.itemId));
  const filteredItems = ITEMS.filter(item => item.type === activeTab);

  const handlePurchase = useCallback((itemId: number, e: React.MouseEvent) => {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item || player.coins < item.price || ownedIds.has(itemId)) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const coinId = Date.now();
    setFlyingCoins(prev => [...prev, { id: coinId, x: rect.left + rect.width / 2, y: rect.top }]);

    setPurchasingId(itemId);
    purchaseItem(itemId);

    setTimeout(() => {
      setPurchasingId(null);
      setFlyingCoins(prev => prev.filter(c => c.id !== coinId));
    }, 600);
  }, [player.coins, ownedIds, purchaseItem]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gold-light via-cream to-cream-dark px-4 pb-6 pt-4">
      <AnimatePresence>
        {flyingCoins.map(coin => (
          <motion.div
            key={coin.id}
            className="fixed z-50 pointer-events-none"
            initial={{ x: coin.x, y: coin.y, scale: 1, opacity: 1 }}
            animate={{ x: coin.x, y: coin.y - 80, scale: 0.3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="text-2xl">🪙</div>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex flex-col items-center mb-4">
        <motion.div
          className="text-6xl mb-1"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          🪙
        </motion.div>
        <motion.div
          className="text-4xl"
          animate={{ rotate: [-3, 3, -3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          🧰
        </motion.div>
        <h1 className="text-2xl font-display font-bold text-gold-dark mt-2">宝箱商店</h1>
      </div>

      <div className="flex items-center justify-center gap-2 bg-white/70 backdrop-blur-sm rounded-game px-4 py-2 mb-4 shadow-game mx-auto max-w-xs">
        <Coins className="text-gold-dark" size={22} />
        <span className="font-display font-bold text-lg text-gold-dark">{player.coins}</span>
        <span className="text-sm text-gold-dark/70 font-body">金币</span>
      </div>

      <div className="flex gap-2 justify-center mb-5">
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.type}
            onClick={() => setActiveTab(tab.type)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-button font-display font-semibold text-sm transition-all ${
              activeTab === tab.type
                ? 'bg-gold text-white shadow-game scale-105'
                : 'bg-white/60 text-gold-dark hover:bg-white/80'
            }`}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => {
            const isOwned = ownedIds.has(item.id);
            const canAfford = player.coins >= item.price;
            const isPurchasing = purchasingId === item.id;
            const rarityColor = RARITY_COLORS[item.rarity];

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                className="relative bg-white/80 backdrop-blur-sm rounded-card shadow-card overflow-hidden"
                style={{ borderWidth: 2, borderColor: rarityColor }}
              >
                <div
                  className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg text-white text-[10px] font-display font-bold"
                  style={{ backgroundColor: rarityColor }}
                >
                  {RARITY_LABELS[item.rarity]}
                </div>

                <div className="flex flex-col items-center p-3 pt-4">
                  <motion.span
                    className="text-4xl mb-2"
                    animate={isPurchasing ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    {item.icon}
                  </motion.span>

                  <h3 className="font-display font-bold text-sm text-gray-800 text-center leading-tight mb-1">
                    {item.name}
                  </h3>

                  <p className="text-[11px] text-gray-500 text-center leading-snug mb-2 font-body">
                    {item.description}
                  </p>

                  {isOwned ? (
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-button text-xs font-display font-bold">
                      <Check size={14} strokeWidth={3} />
                      <span>已拥有</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 w-full">
                      <div className="flex items-center gap-1">
                        <Coins size={14} className="text-gold-dark" />
                        <span className={`font-display font-bold text-sm ${canAfford ? 'text-gold-dark' : 'text-gray-400'}`}>
                          {item.price}
                        </span>
                      </div>

                      {canAfford ? (
                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          whileHover={{ scale: 1.04 }}
                          onClick={(e) => handlePurchase(item.id, e)}
                          disabled={isPurchasing}
                          className="w-full bg-gold hover:bg-gold-dark text-white font-display font-bold text-xs px-3 py-1.5 rounded-button shadow-game transition-colors disabled:opacity-50"
                        >
                          <span className="flex items-center justify-center gap-1">
                            <ShoppingBag size={12} />
                            兑换
                          </span>
                        </motion.button>
                      ) : (
                        <div className="w-full bg-gray-200 text-gray-400 font-display font-bold text-xs px-3 py-1.5 rounded-button flex items-center justify-center gap-1 cursor-not-allowed">
                          <Lock size={12} />
                          兑换
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isPurchasing && (
                  <motion.div
                    className="absolute inset-0 bg-gold/20 rounded-card pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <ShoppingBag size={48} strokeWidth={1.5} />
          <p className="font-display font-semibold mt-2">暂无商品</p>
        </div>
      )}
    </div>
  );
}
