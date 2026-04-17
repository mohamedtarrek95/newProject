'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { orderAPI } from '@/lib/api';
import { Button, Card, Badge, Spinner, Alert, Modal } from '@/components/ui';
import { useTranslations } from '@/components/TranslationsProvider';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { t } = useTranslations();

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  const loadOrder = async () => {
    try {
      const data = await orderAPI.getById(params.id);
      setOrder(data);
      setAdminNotes(data.adminNotes || '');
    } catch (err) {
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      await orderAPI.approve(order._id, { adminNotes });
      setSuccess(t('orderDetail.orderApproved'));
      loadOrder();
    } catch (err) {
      setError(err.message || 'Failed to approve order');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!adminNotes) {
      setError(t('orderDetail.rejectReasonError'));
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      await orderAPI.reject(order._id, { adminNotes });
      setSuccess(t('orderDetail.orderRejected'));
      loadOrder();
    } catch (err) {
      setError(err.message || 'Failed to reject order');
    } finally {
      setProcessing(false);
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
      year: 'numeric',
      month: 'long',
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

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card className="text-center py-12">
          <p className="text-surface-400 mb-4">{t('orderDetail.orderNotFound')}</p>
          <Button onClick={() => router.push('/admin/orders')}>{t('orderDetail.backToOrders')}</Button>
        </Card>
      </div>
    );
  }

  const getOrderTypeLabel = (type) => {
    const labels = {
      'BUY_USDT': t('orders.type.buy_usdt'),
      'SELL_USDT': t('orders.type.sell_usdt'),
      'EGP_TO_USDT': t('orders.type.egp_to_usdt'),
      'USDT_TO_EGP': t('orders.type.usdt_to_egp')
    };
    return labels[type] || type;
  };

  const isBuyOrder = (type) => type === 'BUY_USDT' || type === 'EGP_TO_USDT';

  const calculatedAmount = isBuyOrder(order.type)
    ? (order.amount / order.exchangeRate).toFixed(6)
    : (order.amount * order.exchangeRate).toFixed(2);

  const getStatusKey = () => {
    switch (order.status) {
      case 'approved': return 'approved';
      case 'rejected': return 'rejected';
      default: return 'pending';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <Button variant="secondary" onClick={() => router.push('/admin/orders')} className="mb-6 text-sm sm:text-base">
        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('orderDetail.backToOrders')}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Order Details Card */}
        <Card>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">{t('orderDetail.orderDetails')}</h1>
              <p className="text-surface-500 text-xs font-mono break-all">{order._id}</p>
            </div>
            {getStatusBadge(order.status)}
          </div>

          <div className="space-y-4">
            {/* User Info Section */}
            <div className="p-4 rounded-lg bg-surface-800/50 border border-surface-700">
              <h3 className="text-sm font-medium text-surface-400 mb-3 uppercase tracking-wider">User Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-surface-400 text-sm">Email</span>
                  <span className="text-white font-medium text-sm">{order.userId?.email || 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-surface-400 text-sm">Name</span>
                  <span className="text-white font-medium text-sm">{order.userId?.firstName} {order.userId?.lastName}</span>
                </div>
              </div>
            </div>

            {/* Order Type with Network Badge for USDT */}
            <div className="flex flex-col sm:flex-row justify-between py-3 border-b border-surface-700 gap-2">
              <span className="text-surface-400 text-sm">{t('orderDetail.exchangeType')}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{getOrderTypeLabel(order.type)}</span>
                {isBuyOrder(order.type) && (
                  <span className="px-2 py-1 rounded-full bg-primary-500/20 text-primary-400 text-xs font-medium border border-primary-500/30">
                    Network: Plasma
                  </span>
                )}
              </div>
            </div>

            {/* Currency */}
            <div className="flex flex-col sm:flex-row justify-between py-3 border-b border-surface-700 gap-2">
              <span className="text-surface-400 text-sm">Currency</span>
              <span className="font-medium text-white">{order.currency}</span>
            </div>

            {/* Amount */}
            <div className="flex flex-col sm:flex-row justify-between py-3 border-b border-surface-700 gap-2">
              <span className="text-surface-400 text-sm">{t('orderDetail.amount')}</span>
              <span className="font-bold text-lg text-white">{order.amount} {order.currency}</span>
            </div>

            {/* Exchange Rate */}
            <div className="flex flex-col sm:flex-row justify-between py-3 border-b border-surface-700 gap-2">
              <span className="text-surface-400 text-sm">{t('orderDetail.rate')}</span>
              <span className="font-medium text-white">{order.currency} {order.exchangeRate.toFixed(2)} / USDT</span>
            </div>

            {/* Converted Amount */}
            <div className="flex flex-col sm:flex-row justify-between py-3 border-b border-surface-700 gap-2 bg-gradient-to-r from-surface-800/30 to-transparent px-2 -mx-2 rounded">
              <span className="text-surface-400 text-sm">{t('orderDetail.convertedAmount')}</span>
              <span className="font-bold text-lg bg-gradient-to-r from-premium-400 to-primary-400 bg-clip-text text-transparent">
                {calculatedAmount} {isBuyOrder(order.type) ? 'USDT' : order.currency}
              </span>
            </div>

            {/* Payment Method */}
            <div className="flex flex-col sm:flex-row justify-between py-3 border-b border-surface-700 gap-2">
              <span className="text-surface-400 text-sm">Payment Method</span>
              <span className="font-medium text-white">{order.paymentMethod || 'N/A'}</span>
            </div>

            {/* USDT Wallet Address for Buy Orders */}
            {isBuyOrder(order.type) && order.userId?.walletAddress && (
              <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm font-medium text-primary-400">User Wallet Address (USDT Receive Address)</span>
                </div>
                <p className="text-white font-mono text-sm break-all bg-surface-900/50 p-2 rounded border border-surface-700">
                  {order.userId.walletAddress}
                </p>
              </div>
            )}

            {/* Created Date */}
            <div className="flex flex-col sm:flex-row justify-between py-3 gap-2">
              <span className="text-surface-400 text-sm">{t('orderDetail.created')}</span>
              <span className="font-medium text-white">{formatDate(order.createdAt)}</span>
            </div>

            {order.processedBy && (
              <div className="flex flex-col sm:flex-row justify-between py-3 border-t border-surface-700 gap-2">
                <span className="text-surface-400 text-sm">{t('orderDetail.processedBy')}</span>
                <span className="text-sm text-white">{order.processedBy.email}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Admin Actions Card */}
          <Card>
            <h2 className="text-lg font-semibold text-white mb-6">{t('orderDetail.adminActions')}</h2>

          {error && <Alert variant="error" className="mb-4">{error}</Alert>}
          {success && <Alert variant="success" className="mb-4">{success}</Alert>}

          {order.status === 'pending' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">
                  Admin Notes {order.status === 'pending' && <span className="text-red-400">*</span>}
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Enter notes about this order..."
                  className="w-full bg-surface-800 border border-surface-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-premium-500 focus:border-transparent outline-none text-sm sm:text-base resize-none"
                  rows="4"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  variant="success"
                  onClick={handleApprove}
                  disabled={processing}
                  className="flex-1"
                >
                  {processing ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    t('orderDetail.approveOrder')
                  )}
                </Button>
                <Button
                  variant="danger"
                  onClick={handleReject}
                  disabled={processing}
                  className="flex-1"
                >
                  {processing ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    t('orderDetail.rejectOrder')
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-surface-700/50 border border-surface-600">
                <p className="text-sm text-surface-400 mb-2">Order Status:</p>
                <p className="font-semibold text-lg text-white">
                  {t('orderDetail.orderStatusResolved').replace('{status}', t(`orderDetail.status${getStatusKey().charAt(0).toUpperCase() + getStatusKey().slice(1)}`))}
                </p>
              </div>

              {order.adminNotes && (
                <div className="p-4 rounded-lg bg-surface-700/50 border border-surface-600">
                  <p className="text-sm text-surface-400 mb-2">{t('orderDetail.adminNotes')}:</p>
                  <p className="text-sm text-white">{order.adminNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Payment Proof Section */}
          <Card>
            <h3 className="font-semibold mb-4 text-sm sm:text-base text-white">{t('orderDetail.paymentProof')}</h3>
            {order.paymentProofUrl ? (
              <div className="relative group cursor-pointer" onClick={() => setLightboxOpen(true)}>
                <img
                  src={order.paymentProofUrl}
                  alt="Payment Proof"
                  className="w-full rounded-lg border border-surface-600 max-h-80 object-contain bg-surface-900 hover:border-primary-500/50 transition-colors"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                  <span className="text-white text-sm ml-2">Click to enlarge</span>
                </div>
              </div>
            ) : (
              <p className="text-surface-500 text-sm">{t('orderDetail.noProofUploaded')}</p>
            )}
          </Card>

          {/* Contact Support Card */}
          <Card className="bg-gradient-to-r from-premium-500/10 to-primary-500/10 border-premium-500/20">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-premium-500/20 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-premium-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Need Help?</h3>
              <p className="text-surface-400 text-sm mb-4">Contact support for any questions about this order</p>
              <a
                href="https://t.me/Hosssam95"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-premium-500 hover:bg-premium-600 text-surface-900 font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
                Contact us on Telegram
              </a>
            </div>
          </Card>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-surface-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={order.paymentProofUrl}
              alt="Payment Proof"
              className="w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}