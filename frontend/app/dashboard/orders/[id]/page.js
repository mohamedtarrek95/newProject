'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { orderAPI } from '@/lib/api';
import { Button, Card, Badge, Spinner } from '@/components/ui';
import { useTranslations } from '@/components/TranslationsProvider';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
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
    } catch (err) {
      setError(t('orderDetail.orderNotFound'));
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t('orderDetail.fileSizeError'));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError(t('orderDetail.fileTypeError'));
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      await orderAPI.uploadProof(order._id, selectedFile);
      setSuccess(t('orderDetail.proofUploaded'));
      setSelectedFile(null);
      loadOrder();
    } catch (err) {
      setError(err.message || t('orderDetail.proofUploadFailed'));
    } finally {
      setUploading(false);
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
          <Button onClick={() => router.push('/dashboard/orders')}>{t('orderDetail.backToOrders')}</Button>
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
      <Button variant="secondary" onClick={() => router.push('/dashboard/orders')} className="mb-6 text-sm sm:text-base">
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
              <span className="text-gray-600 text-sm sm:text-base">
                {t('orderDetail.youWill')} {order.type === 'EGP_TO_USDT' ? t('orderDetail.receive') : t('orderDetail.pay')}
              </span>
              <span className="font-semibold text-primary-600 text-lg sm:text-xl">
                {calculatedAmount} {order.type === 'EGP_TO_USDT' ? 'USDT' : 'EGP'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between py-3 border-b gap-2">
              <span className="text-gray-600 text-sm sm:text-base">{t('orderDetail.created')}</span>
              <span className="text-sm sm:text-base">{formatDate(order.createdAt)}</span>
            </div>

            {order.adminNotes && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{t('orderDetail.adminNotes')}:</p>
                <p className="mt-1 text-sm sm:text-base">{order.adminNotes}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Payment Proof Card */}
        <Card>
          <h2 className="text-lg sm:text-xl font-semibold mb-6">{t('orderDetail.paymentProof')}</h2>

          {order.paymentProofUrl ? (
            <div>
              <p className="text-green-600 mb-4 text-sm sm:text-base flex items-center gap-2">
                <span className="text-lg">✓</span> {t('orderDetail.proofUploadedCheck')}
              </p>
              <img
                src={order.paymentProofUrl}
                alt="Payment Proof"
                className="w-full rounded-lg border max-h-96 object-contain"
              />
            </div>
          ) : order.status === 'pending' ? (
            <div>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                {t('orderDetail.proofDesc')}
              </p>

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

              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100"
                />

                {selectedFile && (
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-lg border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{selectedFile.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="w-full text-sm sm:text-base"
                >
                  {uploading ? t('orderDetail.uploading') : t('orderDetail.uploadProofBtn')}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-sm sm:text-base">
              {order.status === 'rejected'
                ? t('orderDetail.orderStatusResolved').replace('{status}', t('orderDetail.statusRejected'))
                : t('orderDetail.noProofUploaded')}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}