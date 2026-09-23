import React from 'react';

export const Badge = ({
  children,
  variant = 'amber',
  size = 'md',
  className = '',
  onClick
}) => {
  const variants = {
    amber: 'bg-amber-100 text-amber-900 border border-amber-200/80',
    terracotta: 'bg-orange-100 text-orange-900 border border-orange-200/80',
    salvia: 'bg-emerald-100 text-emerald-900 border border-emerald-200/80',
    stone: 'bg-stone-100 text-stone-700 border border-stone-200',
    crema: 'bg-[#fef9f2] text-amber-800 border border-amber-200/60',
    facile: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    media: 'bg-amber-50 text-amber-700 border border-amber-200',
    difficile: 'bg-rose-50 text-rose-700 border border-rose-200'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] font-medium rounded-md',
    md: 'px-2.5 py-1 text-xs font-semibold rounded-lg',
    lg: 'px-3 py-1.5 text-sm font-semibold rounded-xl'
  };

  return (
    <span
      onClick={onClick}
      className={`
        inline-flex items-center gap-1 leading-none transition-all select-none
        ${variants[variant] || variants.amber}
        ${sizes[size] || sizes.md}
        ${onClick ? 'cursor-pointer hover:opacity-80 active:scale-95' : ''}
        ${className}
      `}
    >
      {children}
    </span>
  );
};
