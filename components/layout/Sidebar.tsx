'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/offers', label: 'Offres d\'emploi', icon: '📋' },
  { href: '/cvs', label: 'CVs', icon: '📄' },
  { href: '/sessions', label: 'Sessions', icon: '🔄' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-white/80 backdrop-blur border-r border-border">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl hero-gradient text-white flex items-center justify-center text-lg shadow-sm">🐦</span>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">Rise Hire</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(item => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'hero-gradient text-white shadow-sm'
                  : 'text-text-500 hover:bg-bg-50 hover:text-text-700'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border flex flex-col gap-1">
        <Link
          href="/account"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-500 hover:bg-bg-50 hover:text-text-700 transition-colors"
        >
          <span>👤</span>
          <div className="truncate">
            <p className="truncate font-medium text-text-900">{user?.full_name}</p>
            <p className="truncate text-xs text-text-400">{user?.email}</p>
          </div>
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-400 hover:bg-red-50 hover:text-danger transition-colors w-full text-left"
        >
          <span>🚪</span>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
