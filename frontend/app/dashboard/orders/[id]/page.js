'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { orderAPI } from '@/lib/api';
import { Button, Card, Badge, Spinner, Alert, Input } from '@/components/ui';
import { useTranslations } from '@/components/TranslationsProvider';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [txid, setTxid] = useState('');
  const [submittingTxid, setSubmittingTxid] = useState(false);
  const [txidError, setTxidError] = useState('');
  const [txidSuccess, setTxidSuccess] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageModal, setImageModal] = useState(false);
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

  const handleSubmitTxid = async () => {
    if (!txid.trim()) {
      setTxidError('TXID is required');
      return;
    }

    setSubmittingTxid(true);
    setTxidError('');
    setTxidSuccess('');

    try {
      await orderAPI.updateTxid(order._id, txid);
      setTxidSuccess('TXID submitted successfully');
      setTxid('');
      loadOrder();
    } catch (err) {
      setTxidError(err.message || 'Failed to submit TXID');
    } finally {
      setSubmittingTxid(false);
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
      {/* Telegram Support Button */}
      <div className="mb-6 flex justify-end">
        <Button
          variant="primary"
          onClick={() => window.open('https://t.me/Hosssam95', '_blank')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg shadow-blue-500/20"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.099.154.232.17.325.015.093.034.302-.064.623z"/>
          </svg>
          Contact us on Telegram
        </Button>
      </div>

      <Button variant="secondary" onClick={() => router.push('/dashboard/orders')} className="mb-6 text-sm sm:text-base">
        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('orderDetail.backToOrders')}
      </Button>

      {/* Telegram Contact Message */}
      <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <div className="flex-1">
            <p className="text-blue-300 font-medium mb-2">
              Your order has been created successfully. Please contact us on Telegram to complete your request.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.open('https://t.me/Hosssam95', '_blank')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg shadow-blue-500/20"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-.896.563-2.594.936-.838.184-1.555.277-2.372.104-.041-.008-.135-.033-.269.053-.269.167-.432.461-.488.601-.064.167.004.25.138.334.134.083.585.249 1.375.523 1.52.529 2.655 1.005 2.717 1.029.062.025.121.038.162.016.177-.087 2.125-2.096 2.207-2.296.015-.037.032-.135.015-.201-.017-.065-.079-.138-.173-.194-.155-.093-.41-.061-.563-.036z"/>
              </svg>
              Contact us on Telegram
            </Button>
          </div>
        </div>
      </div>

      {/* TXID Input Section for SELL_USDT orders */}
      {order.type === 'SELL_USDT' && order.status === 'pending' && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-emerald-400 font-semibold mb-2">Submit Transaction ID (TXID)</h3>
              <p className="text-emerald-300/80 text-sm mb-4">
                After sending USDT to our wallet, please submit the transaction ID (TXID) to help us verify your payment.
              </p>

              {txidError && <Alert variant="error" className="mb-4">{txidError}</Alert>}
              {txidSuccess && <Alert variant="success" className="mb-4">{txidSuccess}</Alert>}

              <div className="flex gap-3">
                <Input
                  type="text"
                  value={txid}
                  onChange={(e) => setTxid(e.target.value)}
                  placeholder="Enter transaction ID (TXID)"
                  className="flex-1"
                />
                <Button
                  onClick={handleSubmitTxid}
                  disabled={submittingTxid || !txid.trim()}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  {submittingTxid ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    'Submit TXID'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Display TXID if already submitted */}
      {order.type === 'SELL_USDT' && order.txid && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-emerald-400 font-semibold">Transaction ID (TXID) Submitted</h3>
          </div>
          <div className="flex items-center gap-2 bg-surface-900 rounded-lg p-3 border border-surface-700">
            <p className="text-white font-mono text-sm flex-1 break-all">{order.txid}</p>
            <button
              onClick={() => navigator.clipboard.writeText(order.txid)}
              className="text-emerald-400 hover:text-emerald-300 transition-colors p-1"
              title="Copy TXID"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Order Details Card */}
        <Card className="bg-gradient-to-br from-surface-800 to-surface-900 border border-surface-700">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 pb-4 border-b border-surface-700">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">{t('orderDetail.orderDetails')}</h1>
              <p className="text-surface-500 text-xs font-mono break-all bg-surface-900/50 px-2 py-1 rounded">{order._id}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(order.status)}
              <span className="text-xs text-surface-500">{formatDate(order.createdAt)}</span>
            </div>
          </div>

          {/* User Info Section */}
          <div className="mb-6 p-4 rounded-lg bg-surface-900/50 border border-surface-700">
            <h3 className="text-sm font-semibold text-surface-400 mb-3 uppercase tracking-wider">User Information</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {order.user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-white font-medium">{order.user?.name || 'User'}</p>
                <p className="text-surface-500 text-sm">{order.user?.email || order.user?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Order Type */}
            <div className="flex flex-col sm:flex-row justify-between py-3 border-b border-surface-700 gap-2">
              <span className="text-surface-400 text-sm">Order Type</span>
              <span className="font-medium text-white bg-blue-500/20 px-3 py-1 rounded-full text-sm">
                {getOrderTypeLabel(order.type, order.currency)}
              </span>
            </div>

            {/* Currency */}
            <div className="flex flex-col sm:flex-row justify-between py-3 border-b border-surface-700 gap-2">
              <span className="text-surface-400 text-sm">Currency</span>
              <span className="font-medium text-white">{order.currency}</span>
            </div>

            {/* Amount */}
            <div className="flex flex-col sm:flex-row justify-between py-3 border-b border-surface-700 gap-2">
              <span className="text-surface-400 text-sm">Amount</span>
              <span className="font-bold text-xl text-white">{formatOrderAmount(order.type, order.currency)}</span>
            </div>

            {/* Payment Method */}
            <div className="flex flex-col sm:flex-row justify-between py-3 border-b border-surface-700 gap-2">
              <span className="text-surface-400 text-sm">Payment Method</span>
              <span className="font-medium text-white">Bank Transfer</span>
            </div>

            {/* Rate */}
            <div className="flex flex-col sm:flex-row justify-between py-3 border-b border-surface-700 gap-2">
              <span className="text-surface-400 text-sm">Exchange Rate</span>
              <span className="font-medium text-white">{order.currency} {order.exchangeRate.toFixed(2)} / USDT</span>
            </div>

            {/* You Will Receive/Pay */}
            <div className="flex flex-col sm:flex-row justify-between py-3 border-b border-surface-700 gap-2 bg-gradient-to-r from-surface-900/50 to-transparent px-2 -mx-2">
              <span className="text-surface-400 text-sm">{isBuyOrder(order.type) ? 'You Will Receive' : 'You Will Pay'}</span>
              <span className="font-bold text-xl text-gradient">
                {calculatedAmount} {isBuyOrder(order.type) ? 'USDT' : order.currency}
              </span>
            </div>

            {/* Network - Always show for USDT orders */}
            {(order.type === 'BUY_USDT' || order.type === 'SELL_USDT') && (
              <div className="flex flex-col sm:flex-row justify-between py-3 border-b border-surface-700 gap-2 bg-emerald-500/10 px-2 -mx-2 rounded">
                <span className="text-emerald-400 text-sm font-semibold">Network</span>
                <span className="font-bold text-emerald-400 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Plasma
                </span>
              </div>
            )}

            {/* USDT Wallet Address for BUY orders */}
            {isBuyOrder(order.type) && order.walletAddress && (
              <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-blue-400 font-semibold text-sm">USDT Wallet Address (Receive Address)</span>
                </div>
                <div className="flex items-center gap-2 bg-surface-900 rounded-lg p-3 border border-surface-700">
                  <p className="text-white font-mono text-sm flex-1 break-all">{order.walletAddress}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(order.walletAddress)}
                    className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                    title="Copy address"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Order Status */}
            <div className="flex flex-col sm:flex-row justify-between py-3 gap-2">
              <span className="text-surface-400 text-sm">Order Status</span>
              {getStatusBadge(order.status)}
            </div>
          </div>

          {order.adminNotes && (
            <div className="mt-6 p-4 rounded-lg bg-surface-700/50 border border-surface-600">
              <p className="text-sm text-surface-400 mb-1">{t('orderDetail.adminNotes')}:</p>
              <p className="text-sm text-white">{order.adminNotes}</p>
            </div>
          )}
        </Card>

        {/* Payment Proof Card */}
        <Card className="bg-gradient-to-br from-surface-800 to-surface-900 border border-surface-700">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {t('orderDetail.paymentProof')}
          </h2>

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
              {/* Clickable Image for Preview/Zoom */}
              <button
                onClick={() => setImageModal(true)}
                className="w-full relative group overflow-hidden rounded-lg border border-surface-600 hover:border-blue-500 transition-all duration-200"
              >
                <img
                  src={order.paymentProofUrl}
                  alt="Payment Proof"
                  className="w-full max-h-96 object-contain bg-surface-900 group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </button>
              <p className="text-center text-surface-500 text-xs mt-2">Click image to enlarge</p>
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

      {/* Image Modal for Payment Proof Zoom */}
      {imageModal && order.paymentProofUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setImageModal(false)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col">
            <button
              onClick={() => setImageModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors flex items-center gap-2"
            >
              <span className="text-sm">Close</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={order.paymentProofUrl}
              alt="Payment Proof Full View"
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}