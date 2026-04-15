'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import { orderAPI, userAPI } from '@/lib/api';
import { Card, Spinner } from '@/components/ui';
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
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const statCards = [
    { title: t('adminDashboard.totalUsers'), value: stats.totalUsers, color: 'text-blue-600' },
    { title: t('adminDashboard.totalOrders'), value: stats.totalOrders, color: 'text-purple-600' },
    { title: t('adminDashboard.pendingOrders'), value: stats.pendingOrders, color: 'text-yellow-600' },
    { title: t('adminDashboard.approvedOrders'), value: stats.approvedOrders, color: 'text-green-600' },
    { title: t('adminDashboard.rejectedOrders'), value: stats.rejectedOrders, color: 'text-red-600' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t('adminDashboard.title')}</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title} className="text-center p-4 sm:p-6">
            <p className="text-gray-600 mb-1 text-xs sm:text-sm truncate">{stat.title}</p>
            <p className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Quick Actions and System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Quick Actions Card */}
        <Card>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">{t('common.quickActions')}</h2>
          <div className="space-y-3">
            <a href="/admin/orders" className="block">
              <button className="w-full btn-primary text-left text-sm sm:text-base">
                {t('adminOrders.title')} →
              </button>
            </a>
            <a href="/admin/users" className="block">
              <button className="w-full btn-secondary text-left text-sm sm:text-base">
                {t('adminUsers.title')} →
              </button>
            </a>
            <a href="/admin/rate" className="block">
              <button className="w-full btn-secondary text-left text-sm sm:text-base">
                {t('adminRate.title')} →
              </button>
            </a>
            <a href="/admin/transactions" className="block">
              <button className="w-full btn-secondary text-left text-sm sm:text-base">
                {t('adminTransactions.title')} →
              </button>
            </a>
          </div>
        </Card>

        {/* System Status Card */}
        <Card>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">{t('common.systemStatus')}</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600 text-sm sm:text-base">{t('common.database')}</span>
              <span className="text-green-600 text-sm sm:text-base flex items-center gap-1">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                {t('common.connected')}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600 text-sm sm:text-base">{t('common.apiStatus')}</span>
              <span className="text-green-600 text-sm sm:text-base flex items-center gap-1">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                {t('common.operational')}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 text-sm sm:text-base">{t('common.version')}</span>
              <span className="font-semibold text-sm sm:text-base">1.0.0</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}