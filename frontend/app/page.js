'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { Button } from '@/components/ui';

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <span className="text-xl font-bold text-primary-600">
              EGP-USDT Exchange
            </span>
            <div className="flex items-center space-x-4">
              {!loading && (
                user ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="primary">Go to Dashboard</Button>
                    </Link>
                    {user.role === 'admin' && (
                      <Link href="/admin">
                        <Button variant="secondary">Admin Panel</Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="outline">Login</Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button variant="primary">Register</Button>
                    </Link>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            EGP-USDT Cryptocurrency Exchange
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A peer-to-admin exchange platform for converting between Egyptian Pounds (EGP)
            and USDT. Simple, secure, and manually approved for your safety.
          </p>

          <div className="flex justify-center gap-4">
            {!user && (
              <>
                <Link href="/auth/register">
                  <Button variant="primary" className="text-lg px-8 py-3">
                    Get Started
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" className="text-lg px-8 py-3">
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure</h3>
            <p className="text-gray-600">
              All transactions are manually reviewed by admins to ensure safety and security.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Rates</h3>
            <p className="text-gray-600">
              Get competitive exchange rates updated by our admin team regularly.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
            <p className="text-gray-600">
              Simple interface for creating orders and tracking their status.
            </p>
          </div>
        </div>

        <div className="mt-20 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                1
              </div>
              <h4 className="font-semibold mb-1">Register</h4>
              <p className="text-sm text-gray-600">Create an account</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                2
              </div>
              <h4 className="font-semibold mb-1">Create Order</h4>
              <p className="text-sm text-gray-600">Select EGP to USDT or vice versa</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                3
              </div>
              <h4 className="font-semibold mb-1">Upload Proof</h4>
              <p className="text-sm text-gray-600">Submit payment proof</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                4
              </div>
              <h4 className="font-semibold mb-1">Get Approved</h4>
              <p className="text-sm text-gray-600">Admin approves and you receive funds</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 EGP-USDT Exchange. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
