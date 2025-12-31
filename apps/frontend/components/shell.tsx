'use client';

import Link from 'next/link';
import { useAuth } from './auth';

const NavLink = ({ href, label }: { href: string; label: string }) => (
  <Link
    href={href}
    className="rounded-full border border-ink-700/10 bg-white/70 px-4 py-2 text-sm font-semibold text-ink-700 transition hover:border-ink-700/30"
  >
    {label}
  </Link>
);

export function Shell({ children }: { children: React.ReactNode }) {
  const { accessToken, clearAuth } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#f4f6fb_55%,_#e7ecf7_100%)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div>
          <p className="font-display text-xl font-bold text-ink-900">Nimbus Flags</p>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-700/70">Feature Flag Platform</p>
        </div>
        <nav className="flex items-center gap-3">
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/flags" label="Flags" />
          <NavLink href="/segments" label="Segments" />
          <NavLink href="/audit" label="Audit" />
          {accessToken ? (
            <button
              className="rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white"
              onClick={clearAuth}
            >
              Sign out
            </button>
          ) : (
            <NavLink href="/login" label="Sign in" />
          )}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 pb-16">{children}</main>
    </div>
  );
}
