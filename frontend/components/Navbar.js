'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { Button } from '@/components/ui';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-surface-800/80 backdrop-blur-xl border-b border-surface-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-premium-400 to-premium-600 flex items-center justify-center shadow-premium-glow group-hover:shadow-premium-glow-lg transition-shadow duration-200">
              <svg className="w-5 h-5 text-surface-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-surface-300 bg-clip-text text-transparent">
              EGP-USDT
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />

            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link href="/admin" className="text-surface-300 hover:text-premium-400 font-medium transition-colors duration-200">
                    Admin
                  </Link>
                )}
                <Link href="/dashboard" className="text-surface-300 hover:text-white font-medium transition-colors duration-200">
                  Dashboard
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l border-surface-700">
                  <span className="text-surface-400 text-sm max-w-[150px] truncate">
                    {user.email}
                  </span>
                  <Button variant="secondary" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher className="scale-90" />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-700 focus:outline-none focus:ring-2 focus:ring-premium-500 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-surface-700 bg-surface-800/95 backdrop-blur-xl animate-in">
          <div className="px-4 py-4 space-y-3">
            {user ? (
              <>
                <div className="text-sm text-surface-400 px-2 py-1">{user.email}</div>
                <div className="h-px bg-surface-700 my-3" />
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="block px-3 py-2.5 rounded-lg text-surface-300 hover:bg-surface-700 hover:text-white font-medium transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="block px-3 py-2.5 rounded-lg text-surface-300 hover:bg-surface-700 hover:text-white font-medium transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Button variant="secondary" className="w-full" onClick={() => { logout(); setIsMenuOpen(false); }}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link href="/auth/register" className="block" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="primary" className="w-full">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}