import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Utensils, BookOpen, ShoppingBag, Settings, Plus, Home } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar = ({ shoppingCount = 0 }) => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/catalog', label: 'Ricettario', icon: BookOpen },
    { path: '/shopping', label: 'Lista Spesa', icon: ShoppingBag, badge: shoppingCount },
    { path: '/settings', label: 'Impostazioni', icon: Settings }
  ];

  return (
    <header className="sticky top-0 z-40 w-full max-w-full overflow-x-hidden bg-[#faf7f2]/90 backdrop-blur-md border-b border-amber-900/10 no-print transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-600/20 group-hover:scale-105 transition-transform">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif text-base sm:text-xl font-bold text-stone-900 tracking-tight leading-none block">
              Ricettario <span className="text-amber-600 font-normal italic">di Famiglia</span>
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-stone-500 font-semibold block">
              PWA Cucina
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-stone-200/50 p-1 rounded-2xl border border-stone-200/80">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 relative
                  ${
                    active
                      ? 'bg-white text-amber-900 shadow-sm font-bold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-amber-600' : 'text-stone-500'}`} />
                <span>{link.label}</span>
                {link.badge > 0 && (
                  <span className="bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Button: Add Recipe */}
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/recipes/new">
            <Button variant="primary" size="sm" icon={Plus}>
              <span className="hidden sm:inline">Nuova Ricetta</span>
              <span className="sm:hidden">Ricetta</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
