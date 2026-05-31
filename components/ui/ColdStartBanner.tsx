'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * Shows a dismissible yellow banner when the HF Space API is cold-starting.
 * Listens for 'api:slow' (show) and 'api:ready' (hide) CustomEvents
 * dispatched from lib/api.ts when a request takes >5s.
 */
export function ColdStartBanner() {
  const [visible, setVisible] = useState(false);
  const pendingRef = useRef(0); // count of in-flight slow requests

  useEffect(() => {
    const onSlow = () => {
      pendingRef.current += 1;
      setVisible(true);
    };
    const onReady = () => {
      pendingRef.current = Math.max(0, pendingRef.current - 1);
      if (pendingRef.current === 0) setVisible(false);
    };

    window.addEventListener('api:slow', onSlow);
    window.addEventListener('api:ready', onReady);
    return () => {
      window.removeEventListener('api:slow', onSlow);
      window.removeEventListener('api:ready', onReady);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="fixed top-0 inset-x-0 z-50 bg-warning/90 text-white text-sm font-medium px-4 py-2.5 flex items-center justify-between shadow-md"
    >
      <div className="flex items-center gap-2">
        <span className="animate-spin text-base">⚙️</span>
        <span>Le serveur IA se réveille… Première requête plus lente (30–60s) — veuillez patienter</span>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="ml-4 text-white/80 hover:text-white text-lg leading-none"
        aria-label="Fermer"
      >
        ×
      </button>
    </div>
  );
}
