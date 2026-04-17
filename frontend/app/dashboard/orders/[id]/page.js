'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { orderAPI } from '@/lib/api';
import { Button, Card, Badge, Spinner, Alert } from '@/components/ui';
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
          <Button onClick={() => router.push('/dashboard/orders')}>{t('orderDetail.backToOrders')}</Button>
        </Card>
      </div>
    );
  }

  const getOrderTypeLabel = (type, currency) => {
    const labels = {
      'BUY_USDT': t('orders.type.buy_usdt'),
      'SELL_USDT': t('orders.type.sell_usdt'),
      'EGP_TO_USDT': t('orders.type.egp_to_usdt'),
      'USDT_TO_EGP': t('orders.type.usdt_to_egp')
    };
    return labels[type] || type;
  };

  const isBuyOrder = (type) => type === 'BUY_USDT' || type === 'EGP_TO_USDT';

  const formatOrderAmount = (type, currency) => {
    const isBuy = isBuyOrder(type);
    return `${order.amount} ${isBuy ? currency : 'USDT'}`;
  };

  const calculatedAmount = isBuyOrder(order.type)
    ? (order.amount / order.exchangeRate).toFixed(6)
    : (order.amount * order.exchangeRate).toFixed(2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <Button variant="secondary" onClick={() => router.push('/dashboard/orders')} className="mb-6 text-sm sm:text-base">
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
              { label: t('orderDetail.exchangeType'), value: getOrderTypeLabel(order.type, order.currency) },
              { label: t('orderDetail.amount'), value: formatOrderAmount(order.type, order.currency) },
              { label: t('orderDetail.rate'), value: `${order.currency} ${order.exchangeRate.toFixed(2)} / USDT` },
              { label: t('orderDetail.youWill') + ' ' + (isBuyOrder(order.type) ? t('orderDetail.receive') : t('orderDetail.pay')), value: `${calculatedAmount} ${isBuyOrder(order.type) ? 'USDT' : order.currency}`, highlight: true },
              ...(order.walletAddress ? [{ label: 'USDT Wallet', value: order.walletAddress }] : []),
              { label: t('orderDetail.created'), value: formatDate(order.createdAt) }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row justify-between py-3 border-b border-surface-700 gap-2">
                <span className="text-surface-400 text-sm">{item.label}</span>
                <span className={`font-medium text-sm ${item.highlight ? 'text-gradient text-lg' : 'text-white'}`}>
                  {item.value}
                </span>
              </div>
            ))}

            {order.adminNotes && (
              <div className="mt-4 p-4 rounded-lg bg-surface-700/50 border border-surface-600">
                <p className="text-sm text-surface-400 mb-1">{t('orderDetail.adminNotes')}:</p>
                <p className="text-sm text-white">{order.adminNotes}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Payment Proof Card */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-6">{t('orderDetail.paymentProof')}</h2>

          {order.paymentProofUrl ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <p className="text-emerald-400 text-sm font-medium">{t('orderDetail.proofUploadedCheck')}</p>
              </div>
              <img
                src={order.paymentProofUrl}
                alt="Payment Proof"
                className="w-full rounded-lg border border-surface-600 max-h-80 object-contain bg-surface-900"
              />
            </div>
          ) : order.status === 'pending' ? (
            <div>
              <p className="text-surface-400 mb-6 text-sm">
                {t('orderDetail.proofDesc')}
              </p>

              {error && <Alert variant="error" className="mb-4">{error}</Alert>}
              {success && <Alert variant="success" className="mb-4">{success}</Alert>}

              <div className="space-y-4">
                <label className="block w-full cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-surface-600 rounded-lg p-6 text-center hover:border-surface-500 transition-colors duration-200">
                    <svg className="w-8 h-8 text-surface-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-surface-400">Click to upload payment proof</p>
                    <p className="text-xs text-surface-500 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </label>

                {selectedFile && (
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-surface-700/50 border border-surface-600">
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-surface-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-white truncate">{selectedFile.name}</p>
                      <p className="text-xs text-surface-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="p-2 text-surface-400 hover:text-red-400 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="w-4 h-4 border-2 border-surface-900/30 border-t-surface-900 rounded-full animate-spin" />
                      {t('orderDetail.uploading')}
                    </span>
                  ) : (
                    t('orderDetail.uploadProofBtn')
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-surface-500 text-sm">
                {order.status === 'rejected'
                  ? t('orderDetail.orderStatusResolved').replace('{status}', t('orderDetail.statusRejected'))
                  : t('orderDetail.noProofUploaded')}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}