import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon: Icon,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl active:scale-[0.98]';

  const variants = {
    primary:
      'bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/20 active:bg-amber-800',
    secondary:
      'bg-stone-200 hover:bg-stone-300 text-stone-800 border border-stone-300/60',
    terracotta:
      'bg-orange-600 hover:bg-orange-700 text-white shadow-sm shadow-orange-600/20',
    salvia:
      'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm shadow-emerald-700/20',
    outline:
      'border-2 border-amber-600 text-amber-700 hover:bg-amber-50 bg-transparent',
    ghost:
      'text-stone-700 hover:bg-stone-100 bg-transparent',
    danger:
      'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-sm px-4 py-2.5 min-h-[44px] gap-2',
    lg: 'text-base px-6 py-3 min-h-[48px] gap-2.5 font-semibold'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} shrink-0`} />}
      <span>{children}</span>
    </button>
  );
};
