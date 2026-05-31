'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function usePoll<T>(
  fetcher: () => Promise<T | null>,
  intervalMs = 3000
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stoppedRef = useRef(false);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    stoppedRef.current = false;

    const poll = async () => {
      if (stoppedRef.current) return;
      try {
        const result = await fetcher();
        if (result) setData(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Polling error');
        stop();
      }
    };

    poll();
    intervalRef.current = setInterval(poll, intervalMs);

    const pause = () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    const resume = () => {
      if (!stoppedRef.current) intervalRef.current = setInterval(poll, intervalMs);
    };
    window.addEventListener('blur', pause);
    window.addEventListener('focus', resume);

    return () => {
      stop();
      window.removeEventListener('blur', pause);
      window.removeEventListener('focus', resume);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]);

  return { data, error, stop };
}

