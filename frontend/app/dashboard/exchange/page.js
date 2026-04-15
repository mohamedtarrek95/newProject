'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { orderAPI, rateAPI } from '@/lib/api';
import { Button, Input, Select, Card, Spinner } from '@/components/ui';
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
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!rate) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card className="text-center">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">{t('exchange.rateNotAvailable')}</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            {t('exchange.rateNotAvailableDesc')}
          </p>
          <Button onClick={() => router.push('/dashboard')}>{t('exchange.backToDashboard')}</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t('exchange.title')}</h1>

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
              <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm sm:text-base">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm sm:text-base">
                {success}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={submitting || !amount}
            >
              {submitting ? t('exchange.creatingOrder') : t('exchange.createOrder')}
            </Button>
          </form>
        </Card>

        {/* Summary Card */}
        <Card>
          <h2 className="text-lg sm:text-xl font-semibold mb-6">{t('exchange.orderSummary')}</h2>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b gap-2">
              <span className="text-gray-600 text-sm sm:text-base">{t('exchange.currentRate')}</span>
              <span className="font-semibold text-sm sm:text-base">EGP {rate.toFixed(2)} / USDT</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b gap-2">
              <span className="text-gray-600 text-sm sm:text-base">{t('exchange.youSend')}</span>
              <span className="font-semibold text-sm sm:text-base">
                {amount || '0'} {type === 'EGP_TO_USDT' ? 'EGP' : 'USDT'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b gap-2">
              <span className="text-gray-600 text-sm sm:text-base">{t('exchange.youReceive')}</span>
              <span className="font-semibold text-primary-600 text-xl">
                {calculatedAmount} {type === 'EGP_TO_USDT' ? 'USDT' : 'EGP'}
              </span>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>{t('common.note') || 'Note'}:</strong> {t('exchange.orderNote')}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}