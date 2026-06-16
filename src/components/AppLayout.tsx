import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Map, User, ShoppingBag, BookOpen, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/map', label: '地图', icon: Map },
  { path: '/character', label: '角色', icon: User },
  { path: '/shop', label: '商店', icon: ShoppingBag },
  { path: '/collection', label: '图鉴', icon: BookOpen },
  { path: '/duo', label: '接力', icon: Users },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isLevelPage = location.pathname.startsWith('/level');

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-cream">
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {!isLevelPage && (
        <nav className="flex items-center justify-around bg-white/95 backdrop-blur-md border-t border-cream-dark px-2 py-1 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path || 
              (item.path === '/map' && location.pathname === '/');
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={isActive ? 'nav-item-active' : 'nav-item-inactive'}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-display font-semibold">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="w-1 h-1 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
