'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { orderAPI, rateAPI } from '@/lib/api';
import { Button, Input, Select, Card, Spinner, Alert } from '@/components/ui';
import { useTranslations } from '@/components/TranslationsProvider';

export default function ExchangePage() {
  const [type, setType] = useState('EGP_TO_USDT');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { t } = useTranslations();

  useEffect(() => {
    loadRate();
  }, []);

  const loadRate = async () => {
    try {
      const data = await rateAPI.get();
      setRate(data.rate);
    } catch (err) {
      setError(t('exchange.rateNotAvailable'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const order = await orderAPI.create({ type, amount: parseFloat(amount) });
      setSuccess(t('exchange.orderCreated'));
      setTimeout(() => {
        router.push(`/dashboard/orders/${order._id}`);
      }, 1500);
    } catch (err) {
      setError(err.message || t('exchange.orderFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const calculatedAmount = rate && amount
    ? type === 'EGP_TO_USDT'
      ? (parseFloat(amount) / rate).toFixed(6)
      : (parseFloat(amount) * rate).toFixed(2)
    : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!rate) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-surface-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">{t('exchange.rateNotAvailable')}</h2>
          <p className="text-surface-400 mb-6">{t('exchange.rateNotAvailableDesc')}</p>
          <Button onClick={() => router.push('/dashboard')}>{t('exchange.backToDashboard')}</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{t('exchange.title')}</h1>
        <p className="text-surface-400">Create a new exchange order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Form Card */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Select
              label={t('exchange.exchangeType')}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="EGP_TO_USDT">{t('exchange.egpToUsdtOption')}</option>
              <option value="USDT_TO_EGP">{t('exchange.usdtToEgpOption')}</option>
            </Select>

            <Input
              label={type === 'EGP_TO_USDT' ? t('exchange.amountInEgp') : t('exchange.amountInUsdt')}
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />

            {error && (
              <Alert variant="error">{error}</Alert>
            )}

            {success && (
              <Alert variant="success">{success}</Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={submitting || !amount}
            >
              {submitting ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-surface-900/30 border-t-surface-900 rounded-full animate-spin" />
                  {t('exchange.creatingOrder')}
                </span>
              ) : (
                t('exchange.createOrder')
              )}
            </Button>
          </form>
        </Card>

        {/* Summary Card */}
        <Card premium>
          <h2 className="text-lg font-semibold text-white mb-6">{t('exchange.orderSummary')}</h2>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-surface-700 gap-2">
              <span className="text-surface-400 text-sm">Current Rate</span>
              <span className="font-semibold text-white">EGP {rate.toFixed(2)} / USDT</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-surface-700 gap-2">
              <span className="text-surface-400 text-sm">{t('exchange.youSend')}</span>
              <span className="font-semibold text-white">
                {amount || '0'} {type === 'EGP_TO_USDT' ? 'EGP' : 'USDT'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b border-surface-700 gap-2">
              <span className="text-surface-400 text-sm">{t('exchange.youReceive')}</span>
              <span className="font-bold text-2xl text-gradient">
                {calculatedAmount} {type === 'EGP_TO_USDT' ? 'USDT' : 'EGP'}
              </span>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-surface-700/50 border border-surface-600">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-premium-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-surface-300">
                  <strong className="text-premium-400">{t('common.note')}:</strong> {t('exchange.orderNote')}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}