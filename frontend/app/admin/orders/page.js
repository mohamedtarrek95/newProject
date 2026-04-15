'use client';

import { useState, useEffect } from 'react';
import { orderAPI } from '@/lib/api';
import { Card, Badge, Spinner, Button } from '@/components/ui';
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
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t('adminOrders.title')}</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-sm sm:text-base">{error}</div>
      )}

      {/* Filter Card */}
      <Card className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <span className="text-gray-600 text-sm sm:text-base whitespace-nowrap">{t('adminOrders.filterByStatus')}:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-40 px-3 py-2 border rounded-lg text-sm sm:text-base"
            >
              <option value="">{t('adminOrders.all')}</option>
              <option value="pending">{t('orders.status.pending')}</option>
              <option value="approved">{t('orders.status.approved')}</option>
              <option value="rejected">{t('orders.status.rejected')}</option>
            </select>
          </div>
          <span className="text-gray-600 text-sm sm:text-base whitespace-nowrap">
            {t('common.total')}: {pagination.total} {t('adminOrders.ordersCount').replace('{count}', '').trim()}
          </span>
        </div>
      </Card>

      {orders.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-600 text-sm sm:text-base">{t('common.noData')}</p>
        </Card>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-full">
            <table className="w-full bg-white rounded-xl shadow-sm border border-gray-100">
              <thead className="bg-gray-50 hidden sm:table-header-group">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminOrders.user')}</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminOrders.type')}</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminOrders.amount')}</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminOrders.rate')}</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminOrders.status')}</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminOrders.date')}</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    {/* Mobile view */}
                    <td className="sm:hidden px-4 py-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{order.userId?.email || 'Unknown'}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{order.type === 'EGP_TO_USDT' ? t('orders.type.egp_to_usdt') : t('orders.type.usdt_to_egp')}</span>
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{order.amount} {order.type === 'EGP_TO_USDT' ? 'EGP' : 'USDT'}</span>
                          <span className="text-sm text-gray-500">EGP {order.exchangeRate?.toFixed(2) || 'N/A'}</span>
                        </div>
                        {order.status === 'pending' && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApprove(order._id)}
                              disabled={actionLoading === order._id}
                              className="flex-1"
                            >
                              {actionLoading === order._id ? '...' : t('adminOrders.approve')}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleReject(order._id)}
                              disabled={actionLoading === order._id}
                              className="flex-1"
                            >
                              {t('adminOrders.reject')}
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Desktop view */}
                    <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-900">
                      {order.userId?.email || 'Unknown'}
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-900">
                      {order.type === 'EGP_TO_USDT' ? t('orders.type.egp_to_usdt') : t('orders.type.usdt_to_egp')}
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 text-sm font-medium text-gray-900">
                      {order.amount} {order.type === 'EGP_TO_USDT' ? 'EGP' : 'USDT'}
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-500">
                      EGP {order.exchangeRate?.toFixed(2) || 'N/A'} / USDT
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4">
                      {order.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApprove(order._id)}
                            disabled={actionLoading === order._id}
                          >
                            {actionLoading === order._id ? '...' : t('adminOrders.approve')}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReject(order._id)}
                            disabled={actionLoading === order._id}
                          >
                            {t('adminOrders.reject')}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}