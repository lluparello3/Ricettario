import React from 'react';

export const Container = ({ children, className = '', maxWidth = 'max-w-6xl' }) => {
  return (
    <main
      className={`w-full max-w-full overflow-x-hidden ${maxWidth} mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-12 ${className}`}
    >
      {children}
    </main>
  );
};
