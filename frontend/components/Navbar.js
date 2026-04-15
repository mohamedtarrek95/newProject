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
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-primary-600 flex-shrink-0">
            EGP-USDT Exchange
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />

            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link href="/admin" className="text-gray-600 hover:text-gray-900 font-medium">
                    Admin
                  </Link>
                )}
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">
                  Dashboard
                </Link>
                <span className="text-gray-500 text-sm">
                  {user.email}
                </span>
                <Button variant="secondary" size="sm" onClick={logout}>
                  Logout
                </Button>
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
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-4 space-y-3">
            {user ? (
              <>
                <div className="text-sm text-gray-500 px-2">{user.email}</div>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
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