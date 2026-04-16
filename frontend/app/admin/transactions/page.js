'use client';

import { useState, useEffect } from 'react';
import { transactionAPI } from '@/lib/api';
import { Card, Spinner, Select, Button } from '@/components/ui';
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
      minute: '2-digit'
    });
  };

  const getActionColor = (action) => {
    if (action.includes('CREATE') || action.includes('REGISTER') || action.includes('LOGIN')) {
      return 'text-blue-400';
    }
    if (action.includes('APPROVE')) {
      return 'text-emerald-400';
    }
    if (action.includes('REJECT') || action.includes('DELETE')) {
      return 'text-red-400';
    }
    if (action.includes('UPDATE')) {
      return 'text-yellow-400';
    }
    return 'text-surface-400';
  };

  const handlePageChange = (newPage) => {
    loadTransactions(newPage);
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
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{t('adminTransactions.title')}</h1>
        <p className="text-surface-400">View system activity and audit logs</p>
      </div>

      {/* Filter Card */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <span className="text-surface-400 text-sm whitespace-nowrap">{t('adminTransactions.filterByAction')}:</span>
            <Select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full sm:w-48 text-sm"
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
          <span className="text-surface-400 text-sm whitespace-nowrap">
            Total: {pagination.total}
          </span>
        </div>
      </Card>

      {transactions.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-surface-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-surface-400 text-sm">{t('common.noData')}</p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-700/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-surface-400 text-sm uppercase tracking-wider">Timestamp</th>
                    <th className="text-left py-3 px-4 font-semibold text-surface-400 text-sm uppercase tracking-wider">Action</th>
                    <th className="text-left py-3 px-4 font-semibold text-surface-400 text-sm uppercase tracking-wider">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-surface-400 text-sm uppercase tracking-wider">Details</th>
                    <th className="text-left py-3 px-4 font-semibold text-surface-400 text-sm uppercase tracking-wider">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-surface-700/30 transition-colors duration-150">
                      <td className="py-4 px-4 text-sm text-surface-300">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className={`py-4 px-4 font-semibold text-sm ${getActionColor(tx.action)}`}>
                        {tx.action}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        {tx.userId ? (
                          <span className="text-surface-200">{tx.userId.email}</span>
                        ) : (
                          <span className="text-surface-500">System</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <pre className="text-xs bg-surface-700/50 p-2 rounded overflow-x-auto max-w-xs text-surface-400">
                          {JSON.stringify(tx.details, null, 2)}
                        </pre>
                      </td>
                      <td className="py-4 px-4 text-sm font-mono text-surface-400">
                        {tx.ipAddress || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn-secondary text-sm px-4 py-2"
              >
                {t('adminTransactions.previous')}
              </button>
              <span className="px-4 py-2 text-sm text-surface-400">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="btn-secondary text-sm px-4 py-2"
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