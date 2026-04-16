'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import { orderAPI, userAPI } from '@/lib/api';
import { Card, Spinner, StatCard } from '@/components/ui';
import { useTranslations } from '@/components/TranslationsProvider';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    rejectedOrders: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const { t } = useTranslations();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      const [orders, users] = await Promise.all([
        orderAPI.getAll({}),
        userAPI.getAll()
      ]);

      setStats({
        totalOrders: orders.pagination?.total || orders.orders?.length || 0,
        pendingOrders: orders.orders?.filter(o => o.status === 'pending').length || 0,
        approvedOrders: orders.orders?.filter(o => o.status === 'approved').length || 0,
        rejectedOrders: orders.orders?.filter(o => o.status === 'rejected').length || 0,
        totalUsers: users.length || 0
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  const statCards = [
    { title: t('adminDashboard.totalUsers'), value: stats.totalUsers, color: 'blue' },
    { title: t('adminDashboard.totalOrders'), value: stats.totalOrders, color: 'purple' },
    { title: t('adminDashboard.pendingOrders'), value: stats.pendingOrders, color: 'yellow' },
    { title: t('adminDashboard.approvedOrders'), value: stats.approvedOrders, color: 'emerald' },
    { title: t('adminDashboard.rejectedOrders'), value: stats.rejectedOrders, color: 'red' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{t('adminDashboard.title')}</h1>
        <p className="text-surface-400">Manage exchange operations and users</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 mb-8">
        {statCards.map((stat, idx) => (
          <Card key={idx} premium className="text-center group hover:scale-[1.02] transition-transform duration-200">
            <p className="text-surface-400 text-xs sm:text-sm mb-2 truncate">{stat.title}</p>
            <p className={`text-2xl sm:text-3xl font-bold ${
              stat.color === 'blue' ? 'text-blue-400' :
              stat.color === 'purple' ? 'text-purple-400' :
              stat.color === 'yellow' ? 'text-yellow-400' :
              stat.color === 'emerald' ? 'text-emerald-400' :
              'text-red-400'
            }`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Quick Actions and System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Quick Actions Card */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-5">Quick Actions</h2>
          <div className="space-y-3">
            <a href="/admin/orders" className="block">
              <button className="w-full btn-primary text-left text-sm sm:text-base justify-between group">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {t('adminOrders.title')}
                </span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </a>
            <a href="/admin/users" className="block">
              <button className="w-full btn-secondary text-left text-sm sm:text-base justify-between group">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {t('adminUsers.title')}
                </span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </a>
            <a href="/admin/rate" className="block">
              <button className="w-full btn-secondary text-left text-sm sm:text-base justify-between group">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {t('adminRate.title')}
                </span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </a>
            <a href="/admin/transactions" className="block">
              <button className="w-full btn-secondary text-left text-sm sm:text-base justify-between group">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('adminTransactions.title')}
                </span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </a>
          </div>
        </Card>

        {/* System Status Card */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-5">System Status</h2>
          <div className="space-y-4">
            {[
              { label: t('common.database'), status: 'Connected' },
              { label: t('common.apiStatus'), status: 'Operational' },
              { label: t('common.version'), status: '1.0.0' }
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-3 border-b border-surface-700 last:border-0">
                <span className="text-surface-400 text-sm">{item.label}</span>
                {item.status === 'Connected' || item.status === 'Operational' ? (
                  <span className="text-emerald-400 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    {item.status}
                  </span>
                ) : (
                  <span className="font-semibold text-sm text-white">{item.status}</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}