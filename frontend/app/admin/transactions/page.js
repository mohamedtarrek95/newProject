'use client';

import { useState, useEffect } from 'react';
import { transactionAPI } from '@/lib/api';
import { Card, Spinner, Select } from '@/components/ui';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Transaction History</h1>

      <Card className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Filter by Action:</span>
            <Select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-48"
            >
              <option value="">All Actions</option>
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
          <span className="text-gray-600">Total: {pagination.total} transactions</span>
        </div>
      </Card>

      {transactions.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-600">No transactions found.</p>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Timestamp</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Action</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Details</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className={`py-3 px-4 font-semibold ${getActionColor(tx.action)}`}>
                        {tx.action}
                      </td>
                      <td className="py-3 px-4">
                        {tx.userId ? (
                          <span className="text-sm">
                            {tx.userId.email}
                          </span>
                        ) : (
                          <span className="text-gray-400">System</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto max-w-xs">
                          {JSON.stringify(tx.details, null, 2)}
                        </pre>
                      </td>
                      <td className="py-3 px-4 text-sm font-mono">
                        {tx.ipAddress || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn-secondary"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
