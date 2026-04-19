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

  const handle{t('adminOrders.reject')} = async (orderId) => {
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
        <p className="text-surface-400">{t('adminOrders.subtitle')}</p>
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
            {t('adminOrders.totalOrders', { count: pagination.total })}
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
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('adminOrders.user')}</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('adminOrders.type')}</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('adminOrders.amount')}</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('adminOrders.rate')}</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('adminOrders.status')}</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('adminOrders.date')}</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('common.actions')}</th>
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
                        {order.userId?.email || t('adminOrders.unknown')}
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
                        {order.currency} {order.exchangeRate?.toFixed(2) || t('adminOrders.unknown')} / USDT
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
                              {actionLoading === order._id ? t('common.approving') : t('adminOrders.approve')}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handle{t('adminOrders.reject')}(order._id)}
                              disabled={actionLoading === order._id}
                            >
                              {t('adminOrders.reject')}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {expandedRow === order._id && (
                      <tr>
                        <td colSpan="8" className="px-4 sm:px-6 py-4 bg-surface-800/50">
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-white">{t('adminOrders.orderDetailsTitle')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {order.paymentProof && (
                                <Card className="p-4">
                                  <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {t('adminOrders.paymentProof')}
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
                                    <p className="text-xs text-surface-400 mt-2 text-center">{t('adminOrders.clickToEnlarge')}</p>
                                  </div>
                                </Card>
                              )}
                              {order.type === 'BUY_USDT' && (
                                <Card className="p-4">
                                  <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    {t('adminOrders.walletAddress')}
                                  </h4>
                                  <div className="bg-surface-900 rounded p-3 border border-surface-700">
                                    <code className="text-sm text-cyan-400 break-all font-mono">
                                      {order.walletAddress || 'N/A'}
                                    </code>
                                  </div>
                                </Card>
                              )}
                              {order.type === 'SELL_USDT' && order.txid && (
                                <Card className="p-4">
                                  <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    {t('adminOrders.txid')}
                                  </h4>
                                  <div className="bg-surface-900 rounded p-3 border border-emerald-500/30">
                                    <code className="text-sm text-emerald-400 break-all font-mono">
                                      {order.txid}
                                    </code>
                                  </div>
                                </Card>
                              )}
                              {order.type === 'BUY_USDT' && order.paymentDetails && (
                                <Card className="p-4">
                                  <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    {t('adminOrders.paymentDetails')}
                                  </h4>
                                  <div className="bg-surface-900 rounded p-3 border border-surface-700">
                                    <p className="text-sm text-amber-400 whitespace-pre-wrap">
                                      {order.paymentDetails}
                                    </p>
                                  </div>
                                </Card>
                              )}
                              {order.telegramUsername && (
                                <Card className="p-4">
                                  <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.099.154.232.17.325.015.093.034.302-.064.623z"/>
                                    </svg>
                                    {t('adminOrders.telegramUsername')}
                                  </h4>
                                  <div className="bg-surface-900 rounded p-3 border border-surface-700">
                                    <code className="text-sm text-blue-400 font-mono">
                                      {order.telegramUsername}
                                    </code>
                                  </div>
                                </Card>
                              )}
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
