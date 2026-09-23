import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
  showClose = true
}) => {
  const isPushedRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      // Push history state to handle native back button
      window.history.pushState({ modalOpen: true }, '');
      isPushedRef.current = true;

      const handlePopState = (e) => {
        isPushedRef.current = false;
        onClose();
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('popstate', handlePopState);
        // Clean up history entry if closed manually rather than via back button
        if (isPushedRef.current && window.history.state?.modalOpen) {
          isPushedRef.current = false;
          window.history.back();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto no-print">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className={`
            relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all
            w-full ${maxWidth} p-6 border border-stone-100 my-8 sm:my-12 animate-scale-up
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
            {title ? (
              <h3 className="text-xl font-serif font-bold text-stone-800">
                {title}
              </h3>
            ) : <div />}
            {showClose && (
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                aria-label="Chiudi"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Body */}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};
