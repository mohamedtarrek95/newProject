'use client';

import { useState, useEffect } from 'react';
import { userAPI } from '@/lib/api';
import { Card, Spinner, Badge } from '@/components/ui';
import { useTranslations } from '@/components/TranslationsProvider';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslations();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userAPI.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{t('adminUsers.title')}</h1>
        <p className="text-surface-400">Manage registered users</p>
      </div>

      {users.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-surface-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-surface-400 text-sm">{t('common.noData')}</p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-700/50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-surface-400 text-sm uppercase tracking-wider">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-surface-400 text-sm uppercase tracking-wider">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-surface-400 text-sm uppercase tracking-wider">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-surface-400 text-sm uppercase tracking-wider">USDT Wallet</th>
                  <th className="text-left py-3 px-4 font-semibold text-surface-400 text-sm uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-surface-700/30 transition-colors duration-150">
                    <td className="py-4 px-4 text-sm text-white">{user.email}</td>
                    <td className="py-4 px-4 text-sm text-surface-300">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={user.role === 'admin' ? 'approved' : 'default'}>
                        {user.role === 'admin' ? t('adminUsers.admin') : t('adminUsers.user')}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      {user.usdtWalletAddress ? (
                        <span className="text-sm font-mono text-surface-300 truncate max-w-[150px] block">
                          {user.usdtWalletAddress}
                        </span>
                      ) : (
                        <span className="text-surface-500 text-sm">{t('adminUsers.notSet')}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-surface-400">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}