'use client';

import { useState, useEffect } from 'react';
import { orderAPI } from '@/lib/api';
import { Card, Badge, Spinner, Button, Alert } from '@/components/ui';
import { useTranslations } from '@/components/TranslationsProvider';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const { t } = useTranslations();

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 50 };
      if (statusFilter) params.status = statusFilter;

      const data = await orderAPI.getAll(params);
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to load orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId) => {
    setActionLoading(orderId);
    setError('');
    try {
      await orderAPI.approve(orderId);
      setOrders(orders.map(order =>
        order._id === orderId ? { ...order, status: 'approved' } : order
      ));
    } catch (err) {
      setError('Failed to approve order: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (orderId) => {
    setActionLoading(orderId);
    setError('');
    try {
      await orderAPI.reject(orderId);
      setOrders(orders.map(order =>
        order._id === orderId ? { ...order, status: 'rejected' } : order
      ));
    } catch (err) {
      setError('Failed to reject order: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'pending',
      approved: 'approved',
      rejected: 'rejected'
    };
    const statusKey = status?.toLowerCase() || 'pending';
    const label = t(`orders.status.${statusKey}`);
    return <Badge variant={variants[statusKey]}>{label}</Badge>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{t('adminOrders.title')}</h1>
        <p className="text-surface-400">Review and manage exchange orders</p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6">{error}</Alert>
      )}

      {/* Filter Card */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <span className="text-surface-400 text-sm whitespace-nowrap">{t('adminOrders.filterByStatus')}:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-40 input-field text-sm"
            >
              <option value="">{t('adminOrders.all')}</option>
              <option value="pending">{t('orders.status.pending')}</option>
              <option value="approved">{t('orders.status.approved')}</option>
              <option value="rejected">{t('orders.status.rejected')}</option>
            </select>
          </div>
          <span className="text-surface-400 text-sm whitespace-nowrap">
            Total: {pagination.total} orders
          </span>
        </div>
      </Card>

      {orders.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-surface-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">User</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">Amount</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">Rate</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-surface-700/30 transition-colors duration-150">
                    <td className="px-4 sm:px-6 py-4 text-sm text-white">
                      {order.userId?.email || 'Unknown'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-surface-300">
                      {order.type === 'EGP_TO_USDT' ? t('orders.type.egp_to_usdt') : t('orders.type.usdt_to_egp')}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-white">
                      {order.amount} {order.type === 'EGP_TO_USDT' ? 'EGP' : 'USDT'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-surface-400">
                      EGP {order.exchangeRate?.toFixed(2) || 'N/A'} / USDT
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-surface-400">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      {order.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApprove(order._id)}
                            disabled={actionLoading === order._id}
                          >
                            {actionLoading === order._id ? '...' : 'Approve'}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReject(order._id)}
                            disabled={actionLoading === order._id}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
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