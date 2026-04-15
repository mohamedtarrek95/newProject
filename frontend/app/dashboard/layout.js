'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Spinner } from '@/components/ui';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
