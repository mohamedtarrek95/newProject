'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { orderAPI } from '@/lib/api';
import { Button, Card, Badge, Spinner, Alert } from '@/components/ui';
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

  const calculatedAmount = order.type === 'EGP_TO_USDT'
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
            {[
              { label: t('orderDetail.user'), value: order.userId?.email, sub: `${order.userId?.firstName} ${order.userId?.lastName}` },
              { label: t('orderDetail.exchangeType'), value: order.type === 'EGP_TO_USDT' ? t('orders.type.egp_to_usdt') : t('orders.type.usdt_to_egp') },
              { label: t('orderDetail.amount'), value: `${order.amount} ${order.type === 'EGP_TO_USDT' ? 'EGP' : 'USDT'}` },
              { label: t('orderDetail.rate'), value: `EGP ${order.exchangeRate.toFixed(2)} / USDT` },
              { label: t('orderDetail.convertedAmount'), value: `${calculatedAmount} ${order.type === 'EGP_TO_USDT' ? 'USDT' : 'EGP'}`, highlight: true },
              { label: t('orderDetail.created'), value: formatDate(order.createdAt) }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row justify-between py-3 border-b border-surface-700 gap-2">
                <span className="text-surface-400 text-sm">{item.label}</span>
                <span className={`font-medium text-sm ${item.highlight ? 'text-gradient' : 'text-white'}`}>
                  {item.value}
                  {item.sub && <span className="text-surface-500 block text-xs mt-1">{item.sub}</span>}
                </span>
              </div>
            ))}

            {order.processedBy && (
              <div className="flex flex-col sm:flex-row justify-between py-3 border-b border-surface-700 gap-2">
                <span className="text-surface-400 text-sm">{t('orderDetail.processedBy')}</span>
                <span className="text-sm text-white">{order.processedBy.email}</span>
              </div>
            )}
          </div>
        </Card>

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
          <div className="mt-6 pt-6 border-t border-surface-700">
            <h3 className="font-semibold mb-4 text-sm sm:text-base text-white">{t('orderDetail.paymentProof')}</h3>
            {order.paymentProofUrl ? (
              <img
                src={order.paymentProofUrl}
                alt="Payment Proof"
                className="w-full rounded-lg border border-surface-600 max-h-80 object-contain bg-surface-900"
              />
            ) : (
              <p className="text-surface-500 text-sm">{t('orderDetail.noProofUploaded')}</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}