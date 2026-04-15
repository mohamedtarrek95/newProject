'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Spinner } from '@/components/ui';

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
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
