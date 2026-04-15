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
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t('adminUsers.title')}</h1>

      {users.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-600 text-sm sm:text-base">{t('common.noData')}</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-full">
              <table className="w-full">
                <thead className="bg-gray-50 hidden sm:table-header-group">
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">{t('adminUsers.email')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">{t('adminUsers.name')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">{t('adminUsers.role')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">{t('adminUsers.usdtWallet')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">{t('adminUsers.joined')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      {/* Mobile view */}
                      <td className="sm:hidden px-4 py-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">{user.email}</span>
                            <Badge variant={user.role === 'admin' ? 'approved' : 'default'}>
                              {user.role === 'admin' ? t('adminUsers.admin') : t('adminUsers.user')}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.usdtWalletAddress ? (
                              <span className="font-mono truncate block max-w-xs">{user.usdtWalletAddress}</span>
                            ) : (
                              <span className="text-gray-400">{t('adminUsers.notSet')}</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">{formatDate(user.createdAt)}</div>
                        </div>
                      </td>
                      {/* Desktop view */}
                      <td className="hidden sm:table-cell py-3 px-4 text-sm">{user.email}</td>
                      <td className="hidden sm:table-cell py-3 px-4 text-sm">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="hidden sm:table-cell py-3 px-4">
                        <Badge variant={user.role === 'admin' ? 'approved' : 'default'}>
                          {user.role === 'admin' ? t('adminUsers.admin') : t('adminUsers.user')}
                        </Badge>
                      </td>
                      <td className="hidden sm:table-cell py-3 px-4">
                        {user.usdtWalletAddress ? (
                          <span className="text-sm font-mono truncate max-w-xs block">
                            {user.usdtWalletAddress}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">{t('adminUsers.notSet')}</span>
                        )}
                      </td>
                      <td className="hidden sm:table-cell py-3 px-4 text-sm">{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}