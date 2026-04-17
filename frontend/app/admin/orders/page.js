'use client';

import { useState, useEffect, Fragment } from 'react';
import { orderAPI } from '@/lib/api';
import { Card, Badge, Spinner, Button, Alert } from '@/components/ui';
import { useTranslations } from '@/components/TranslationsProvider';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
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

  const toggleRow = (orderId) => {
    setExpandedRow(expandedRow === orderId ? null : orderId);
  };

  const handleTelegramContact = () => {
    window.open('https://t.me/Hosssam95', '_blank');
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
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider w-10"></th>
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
                  <Fragment key={order._id}>
                    <tr className="hover:bg-surface-700/30 transition-colors duration-150">
                      <td className="px-4 sm:px-6 py-4">
                        <button
                          onClick={() => toggleRow(order._id)}
                          className="text-surface-400 hover:text-white transition-colors"
                        >
                          <svg
                            className={`w-5 h-5 transform transition-transform ${expandedRow === order._id ? 'rotate-90' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-white">
                        {order.userId?.email || 'Unknown'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-surface-300">
                        <div>
                          {order.type === 'BUY_USDT' ? t('orders.type.buy_usdt') : order.type === 'SELL_USDT' ? t('orders.type.sell_usdt') : order.type === 'EGP_TO_USDT' ? t('orders.type.egp_to_usdt') : t('orders.type.usdt_to_egp')}
                        </div>
                        <div className="text-xs text-surface-500">{order.currency}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium text-white">
                        {order.amount} {order.currency}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-surface-400">
                        {order.currency} {order.exchangeRate?.toFixed(2) || 'N/A'} / USDT
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
                    {expandedRow === order._id && (
                      <tr>
                        <td colSpan="8" className="px-4 sm:px-6 py-4 bg-surface-800/50">
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-white">Order Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {order.paymentProof && (
                                <Card className="p-4">
                                  <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Payment Proof
                                  </h4>
                                  <div
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setLightboxImage(order.paymentProof)}
                                  >
                                    <img
                                      src={order.paymentProof}
                                      alt="Payment proof"
                                      className="h-32 w-full rounded border border-surface-600 object-cover"
                                    />
                                    <p className="text-xs text-surface-400 mt-2 text-center">Click to enlarge</p>
                                  </div>
                                </Card>
                              )}
                              {order.type === 'BUY_USDT' && (
                                <Card className="p-4">
                                  <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Wallet Address (USDT Transfer Destination)
                                  </h4>
                                  <div className="bg-surface-900 rounded p-3 border border-surface-700">
                                    <code className="text-sm text-cyan-400 break-all font-mono">
                                      {order.walletAddress || 'N/A'}
                                    </code>
                                  </div>
                                </Card>
                              )}
                              {order.type === 'BUY_USDT' && (
                                <Card className="p-4">
                                  <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                    Network Information
                                  </h4>
                                  <div className="bg-surface-900 rounded p-3 border border-surface-700">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-cyan-400">Network:</span>
                                      <span className="text-sm font-medium text-white">Plasma</span>
                                    </div>
                                    <p className="text-xs text-surface-400 mt-2">
                                      Note: USDT purchases are processed on Plasma network
                                    </p>
                                  </div>
                                </Card>
                              )}
                              <Card className="p-4">
                                <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  Contact Support
                                </h4>
                                <Button
                                  variant="primary"
                                  size="md"
                                  className="w-full"
                                  onClick={handleTelegramContact}
                                >
                                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-.896.563-2.594.936-.838.184-1.555.277-2.372.104-.041-.008-.135-.033-.269.053-.269.167-.432.461-.488.601-.064.167.004.25.138.334.134.083.585.249 1.375.523 1.52.529 2.655 1.005 2.717 1.029.062.025.121.038.162.016.177-.087 2.125-2.096 2.207-2.296.015-.037.032-.135.015-.201-.017-.065-.079-.138-.173-.194-.155-.093-.41-.061-.563-.036z"/>
                                  </svg>
                                  Contact on Telegram
                                </Button>
                              </Card>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-surface-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={lightboxImage}
              alt="Payment proof full size"
              className="max-w-full max-h-[85vh] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
