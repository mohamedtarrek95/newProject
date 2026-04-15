'use client';

import { useState, useEffect } from 'react';
import { transactionAPI } from '@/lib/api';
import { Card, Spinner, Select } from '@/components/ui';
import { useTranslations } from '@/components/TranslationsProvider';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const { t } = useTranslations();

  useEffect(() => {
    loadTransactions();
  }, [actionFilter]);

  const loadTransactions = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (actionFilter) params.action = actionFilter;

      const data = await transactionAPI.getAll(params);
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionColor = (action) => {
    if (action.includes('CREATE') || action.includes('REGISTER') || action.includes('LOGIN')) {
      return 'text-blue-600';
    }
    if (action.includes('APPROVE')) {
      return 'text-green-600';
    }
    if (action.includes('REJECT') || action.includes('DELETE')) {
      return 'text-red-600';
    }
    if (action.includes('UPDATE')) {
      return 'text-yellow-600';
    }
    return 'text-gray-600';
  };

  const handlePageChange = (newPage) => {
    loadTransactions(newPage);
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
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t('adminTransactions.title')}</h1>

      {/* Filter Card */}
      <Card className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <span className="text-gray-600 text-sm sm:text-base whitespace-nowrap">{t('adminTransactions.filterByAction')}:</span>
            <Select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full sm:w-48 text-sm sm:text-base"
            >
              <option value="">{t('adminTransactions.allActions')}</option>
              <option value="USER_REGISTER">User Register</option>
              <option value="USER_LOGIN">User Login</option>
              <option value="CREATE_ORDER">Create Order</option>
              <option value="UPLOAD_PROOF">Upload Proof</option>
              <option value="APPROVE_ORDER">Approve Order</option>
              <option value="REJECT_ORDER">Reject Order</option>
              <option value="UPDATE_RATE">Update Rate</option>
              <option value="UPDATE_PROFILE">Update Profile</option>
              <option value="UPDATE_WALLET">Update Wallet</option>
            </Select>
          </div>
          <span className="text-gray-600 text-sm sm:text-base whitespace-nowrap">
            {t('common.total')}: {pagination.total}
          </span>
        </div>
      </Card>

      {transactions.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-600 text-sm sm:text-base">{t('common.noData')}</p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-full">
                <table className="w-full">
                  <thead className="bg-gray-50 hidden sm:table-header-group">
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">{t('adminTransactions.timestamp')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">{t('adminTransactions.action')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">{t('adminTransactions.user')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">{t('adminTransactions.details')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">{t('adminTransactions.ipAddress')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx._id} className="border-b hover:bg-gray-50">
                        {/* Mobile view */}
                        <td className="sm:hidden px-4 py-4">
                          <div className="space-y-2">
                            <div className="text-xs text-gray-500">{formatDate(tx.createdAt)}</div>
                            <div className={`font-semibold text-sm ${getActionColor(tx.action)}`}>
                              {tx.action}
                            </div>
                            <div className="text-xs text-gray-600">
                              {tx.userId ? tx.userId.email : t('adminTransactions.system')}
                            </div>
                            <div className="text-xs font-mono text-gray-400">{tx.ipAddress || '-'}</div>
                          </div>
                        </td>
                        {/* Desktop view */}
                        <td className="hidden sm:table-cell py-3 px-4 text-sm">
                          {formatDate(tx.createdAt)}
                        </td>
                        <td className={`hidden sm:table-cell py-3 px-4 font-semibold text-sm ${getActionColor(tx.action)}`}>
                          {tx.action}
                        </td>
                        <td className="hidden sm:table-cell py-3 px-4 text-sm">
                          {tx.userId ? (
                            <span className="text-sm">{tx.userId.email}</span>
                          ) : (
                            <span className="text-gray-400 text-sm">{t('adminTransactions.system')}</span>
                          )}
                        </td>
                        <td className="hidden sm:table-cell py-3 px-4">
                          <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto max-w-xs">
                            {JSON.stringify(tx.details, null, 2)}
                          </pre>
                        </td>
                        <td className="hidden sm:table-cell py-3 px-4 text-sm font-mono">
                          {tx.ipAddress || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn-secondary text-sm sm:text-base px-3 sm:px-4 py-2"
              >
                {t('adminTransactions.previous')}
              </button>
              <span className="px-3 sm:px-4 py-2 text-sm sm:text-base">
                {t('adminTransactions.pageOf').replace('{page}', pagination.page).replace('{pages}', pagination.pages)}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="btn-secondary text-sm sm:text-base px-3 sm:px-4 py-2"
              >
                {t('adminTransactions.next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}