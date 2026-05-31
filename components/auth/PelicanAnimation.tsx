'use client';

import { useEffect } from 'react';

interface PelicanAnimationProps {
  variant: 'login' | 'register';
  onComplete: () => void;
}

// Fallback SVG pelican if Lottie JSON is not available
function PelicanSVG() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
      {/* Body */}
      <ellipse cx="100" cy="120" rx="45" ry="35" fill="#2B6CB0" />
      {/* Head */}
      <circle cx="140" cy="80" r="22" fill="#2B6CB0" />
      {/* Beak */}
      <path d="M158 82 L185 88 L183 95 L157 90 Z" fill="#EBF4FF" />
      {/* Pouch */}
      <path d="M158 88 L183 90 L182 100 L158 95 Z" fill="#D69E2E" />
      {/* Eye */}
      <circle cx="147" cy="76" r="4" fill="white" />
      <circle cx="148" cy="76" r="2" fill="#1A202C" />
      {/* Wing */}
      <path d="M65 110 Q30 95 35 130 Q55 145 90 135" fill="#215387" />
      {/* Tail */}
      <path d="M60 130 Q40 150 55 160 Q70 150 80 140" fill="#215387" />
      {/* Leg */}
      <line x1="95" y1="155" x2="95" y2="175" stroke="#D69E2E" strokeWidth="4" strokeLinecap="round" />
      <line x1="105" y1="155" x2="105" y2="175" stroke="#D69E2E" strokeWidth="4" strokeLinecap="round" />
      {/* Feet */}
      <path d="M85 175 L95 175 L100 182" stroke="#D69E2E" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M105 175 L115 175 L120 182" stroke="#D69E2E" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function PelicanAnimation({ variant, onComplete }: PelicanAnimationProps) {
  // Respect prefers-reduced-motion
  const prefersReduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  useEffect(() => {
    if (prefersReduced) { onComplete(); return; }
    const timeout = setTimeout(onComplete, 2500);
    return () => clearTimeout(timeout);
  }, [onComplete, prefersReduced]);

  if (prefersReduced) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-100/95 backdrop-blur-sm">
      <div
        className="w-48 h-48 md:w-56 md:h-56"
        style={{
          animation: variant === 'login'
            ? 'pelican-dive 2.5s ease-in-out forwards'
            : 'pelican-walk 2.5s ease-in-out forwards',
        }}
      >
        <PelicanSVG />
      </div>
      <p className="mt-6 text-lg font-semibold text-primary animate-pulse">
        {variant === 'login' ? 'Bienvenue ! 🐦' : 'Compte créé ! 🎉'}
      </p>
      <p className="text-sm text-text-500 mt-1">
        {variant === 'login' ? 'Connexion en cours...' : 'Préparation de votre espace...'}
      </p>
      <style>{`
        @keyframes pelican-dive {
          0%   { transform: translateY(-80px) scale(0.5); opacity: 0; }
          30%  { transform: translateY(0) scale(1); opacity: 1; }
          70%  { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(80px) scale(0.5); opacity: 0; }
        }
        @keyframes pelican-walk {
          0%   { transform: translateX(-120px) scale(0.6); opacity: 0; }
          30%  { transform: translateX(0) scale(1); opacity: 1; }
          60%  { transform: translateX(0) scale(1) rotate(-5deg); opacity: 1; }
          70%  { transform: translateX(0) scale(1) rotate(5deg); opacity: 1; }
          100% { transform: translateX(120px) scale(0.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
