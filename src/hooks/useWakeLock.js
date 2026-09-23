import { useState, useEffect, useRef, useCallback } from 'react';

export const useWakeLock = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const wakeLockRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'wakeLock' in navigator) {
      setIsSupported(true);
    }
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
      console.warn('Screen Wake Lock API not supported in this environment.');
      setIsActive(false);
      return false;
    }

    try {
      if (wakeLockRef.current !== null) {
        return true;
      }
      const lock = await navigator.wakeLock.request('screen');
      wakeLockRef.current = lock;
      setIsActive(true);

      lock.addEventListener('release', () => {
        wakeLockRef.current = null;
        setIsActive(false);
      });

      return true;
    } catch (err) {
      console.error(`Wake Lock error (${err.name}): ${err.message}`);
      setIsActive(false);
      return false;
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setIsActive(false);
      } catch (err) {
        console.error('Failed to release wake lock', err);
      }
    }
  }, []);

  // Handle visibility change: re-acquire wake lock if tab comes back into focus while active
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [requestWakeLock, releaseWakeLock]);

  return {
    isSupported,
    isActive,
    requestWakeLock,
    releaseWakeLock
  };
};
