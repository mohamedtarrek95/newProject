'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import { orderAPI, userAPI, transactionAPI } from '@/lib/api';
import { Card, Spinner } from '@/components/ui';

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
    { title: 'Total Users', value: stats.totalUsers, color: 'text-blue-600' },
    { title: 'Total Orders', value: stats.totalOrders, color: 'text-purple-600' },
    { title: 'Pending Orders', value: stats.pendingOrders, color: 'text-yellow-600' },
    { title: 'Approved Orders', value: stats.approvedOrders, color: 'text-green-600' },
    { title: 'Rejected Orders', value: stats.rejectedOrders, color: 'text-red-600' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <p className="text-gray-600 mb-1">{stat.title}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a href="/admin/orders">
              <button className="w-full btn-primary text-left">
                Manage Orders →
              </button>
            </a>
            <a href="/admin/users">
              <button className="w-full btn-secondary text-left">
                Manage Users →
              </button>
            </a>
            <a href="/admin/rate">
              <button className="w-full btn-secondary text-left">
                Set Exchange Rate →
              </button>
            </a>
            <a href="/admin/transactions">
              <button className="w-full btn-secondary text-left">
                View Transactions →
              </button>
            </a>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Database</span>
              <span className="text-green-600">● Connected</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">API Status</span>
              <span className="text-green-600">● Operational</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Version</span>
              <span className="font-semibold">1.0.0</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
