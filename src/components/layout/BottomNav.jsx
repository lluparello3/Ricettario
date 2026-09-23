import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, ShoppingBag, PlusCircle, Settings } from 'lucide-react';

export const BottomNav = ({ shoppingCount = 0 }) => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/catalog', label: 'Catalogo', icon: BookOpen },
    { path: '/recipes/new', label: 'Crea', icon: PlusCircle, isMain: true },
    { path: '/shopping', label: 'Spesa', icon: ShoppingBag, badge: shoppingCount },
    { path: '/settings', label: 'Impostazioni', icon: Settings }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200/80 px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] no-print shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          if (item.isMain) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center relative -top-3 group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-600/30 group-active:scale-95 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-semibold text-amber-700 mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[48px] sm:min-w-[56px] transition-all relative
                ${active ? 'text-amber-600 font-bold' : 'text-stone-500 hover:text-stone-800'}
              `}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] mt-1 tracking-tight">
                {item.label}
              </span>
              {active && (
                <span className="w-1 h-1 bg-amber-600 rounded-full mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
