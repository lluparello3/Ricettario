import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  fullWidth = true,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-white border border-stone-300 rounded-xl text-stone-800 placeholder-stone-400
            px-4 py-2.5 text-sm transition-all duration-200 min-h-[44px]
            focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
            disabled:bg-stone-100 disabled:opacity-60
            ${Icon ? 'pl-11' : ''}
            ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
