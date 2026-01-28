import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GlassWater, List, ShoppingBasket, Wine, Glasses } from 'lucide-react';
import { haptics } from '../lib/ios';
import { useAuthStore } from '../store/authStore';

const BottomTabBar: React.FC = () => {
  const location = useLocation();
  const { session } = useAuthStore();

  const handleTabPress = async () => {
    await haptics.light();
  };

  const tabs = [
    {
      path: '/',
      icon: GlassWater,
      label: 'Cocktails',
      requiresAuth: false,
    },
    {
      path: '/ingredients',
      icon: List,
      label: 'Ingredients',
      requiresAuth: false,
    },
    {
      path: '/my-bar',
      icon: ShoppingBasket,
      label: 'My Bar',
      requiresAuth: true,
    },
    {
      path: '/available',
      icon: Glasses,
      label: 'Make',
      requiresAuth: true,
    },
    {
      path: '/generate',
      icon: Wine,
      label: 'Generate',
      requiresAuth: false,
    },
  ];

  const visibleTabs = tabs.filter(tab => !tab.requiresAuth || session);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 shadow-2xl z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center h-16 px-2">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;

          return (
            <Link
              key={tab.path}
              to={tab.path}
              onClick={handleTabPress}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                isActive
                  ? 'text-amber-600 dark:text-amber-500'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon
                className={`h-6 w-6 transition-transform ${
                  isActive ? 'scale-110' : ''
                }`}
              />
              <span className={`text-xs mt-1 font-medium ${
                isActive ? 'text-amber-600 dark:text-amber-500' : ''
              }`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
