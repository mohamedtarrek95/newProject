'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { orderAPI } from '@/lib/api';
import { Button, Card, Badge, Spinner } from '@/components/ui';
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
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card className="text-center">
          <p className="text-gray-600 mb-4 text-sm sm:text-base">{t('orderDetail.orderNotFound')}</p>
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
        ← {t('orderDetail.backToOrders')}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Order Details Card */}
        <Card>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold">{t('orderDetail.orderDetails')}</h1>
            {getStatusBadge(order.status)}
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between py-3 border-b gap-2">
              <span className="text-gray-600 text-sm sm:text-base">{t('orderDetail.orderId')}</span>
              <span className="font-mono text-sm break-all">{order._id}</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between py-3 border-b gap-2">
              <span className="text-gray-600 text-sm sm:text-base">{t('orderDetail.user')}</span>
              <span className="text-sm sm:text-base">
                {order.userId?.email} <br />
                <span className="text-sm text-gray-500">
                  {order.userId?.firstName} {order.userId?.lastName}
                </span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between py-3 border-b gap-2">
              <span className="text-gray-600 text-sm sm:text-base">{t('orderDetail.exchangeType')}</span>
              <span className="font-semibold text-sm sm:text-base">
                {order.type === 'EGP_TO_USDT' ? t('orders.type.egp_to_usdt') : t('orders.type.usdt_to_egp')}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between py-3 border-b gap-2">
              <span className="text-gray-600 text-sm sm:text-base">{t('orderDetail.amount')}</span>
              <span className="font-semibold text-sm sm:text-base">
                {order.amount} {order.type === 'EGP_TO_USDT' ? 'EGP' : 'USDT'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between py-3 border-b gap-2">
              <span className="text-gray-600 text-sm sm:text-base">{t('orderDetail.rate')}</span>
              <span className="font-semibold text-sm sm:text-base">EGP {order.exchangeRate.toFixed(2)} / USDT</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between py-3 border-b gap-2">
              <span className="text-gray-600 text-sm sm:text-base">{t('orderDetail.convertedAmount')}</span>
              <span className="font-semibold text-primary-600 text-sm sm:text-base">
                {calculatedAmount} {order.type === 'EGP_TO_USDT' ? 'USDT' : 'EGP'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between py-3 border-b gap-2">
              <span className="text-gray-600 text-sm sm:text-base">{t('orderDetail.created')}</span>
              <span className="text-sm sm:text-base">{formatDate(order.createdAt)}</span>
            </div>

            {order.processedBy && (
              <div className="flex flex-col sm:flex-row justify-between py-3 border-b gap-2">
                <span className="text-gray-600 text-sm sm:text-base">{t('orderDetail.processedBy')}</span>
                <span className="text-sm sm:text-base">{order.processedBy.email}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Admin Actions Card */}
        <Card>
          <h2 className="text-lg sm:text-xl font-semibold mb-6">{t('orderDetail.adminActions')}</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm sm:text-base">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm sm:text-base">
              {success}
            </div>
          )}

          {order.status === 'pending' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('orderDetail.adminNotesRequired')}
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={t('orderDetail.adminNotes') + "..."}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm sm:text-base"
                  rows="4"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  variant="success"
                  onClick={handleApprove}
                  disabled={processing}
                  className="flex-1 text-sm sm:text-base"
                >
                  {processing ? t('orderDetail.processing') : t('orderDetail.approveOrder')}
                </Button>
                <Button
                  variant="danger"
                  onClick={handleReject}
                  disabled={processing}
                  className="flex-1 text-sm sm:text-base"
                >
                  {processing ? t('orderDetail.processing') : t('orderDetail.rejectOrder')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">{t('orderDetail.orderStatus')}:</p>
                <p className="font-semibold text-lg">
                  {t('orderDetail.orderStatusResolved').replace('{status}', t(`orderDetail.status${getStatusKey().charAt(0).toUpperCase() + getStatusKey().slice(1)}`))}
                </p>
              </div>

              {order.adminNotes && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">{t('orderDetail.adminNotes')}:</p>
                  <p className="text-sm sm:text-base">{order.adminNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Payment Proof Section */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-4 text-sm sm:text-base">{t('orderDetail.paymentProof')}</h3>
            {order.paymentProofUrl ? (
              <img
                src={order.paymentProofUrl}
                alt="Payment Proof"
                className="w-full rounded-lg border max-h-96 object-contain"
              />
            ) : (
              <p className="text-gray-500 text-sm sm:text-base">{t('orderDetail.noProofUploaded')}</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}