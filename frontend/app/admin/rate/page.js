'use client';

import { useState, useEffect } from 'react';
import { rateAPI } from '@/lib/api';
import { Button, Card, Spinner, Input } from '@/components/ui';
import { useTranslations } from '@/components/TranslationsProvider';

export default function AdminRatePage() {
  const [rate, setRate] = useState('');
  const [currentRate, setCurrentRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { t } = useTranslations();

  useEffect(() => {
    loadRate();
  }, []);

  const loadRate = async () => {
    try {
      const data = await rateAPI.get();
      setCurrentRate(data.rate);
      setRate(data.rate ? data.rate.toString() : '');
    } catch (err) {
      setError('Failed to load exchange rate');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setUpdating(true);

    const rateValue = parseFloat(rate);

    if (isNaN(rateValue) || rateValue <= 0) {
      setError(t('adminRate.validRateError'));
      setUpdating(false);
      return;
    }

    try {
      await rateAPI.update({ rate: rateValue });
      setMessage(t('adminRate.rateUpdated'));
      setCurrentRate(rateValue);
    } catch (err) {
      setError(err.message || t('adminRate.rateUpdateFailed'));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t('adminRate.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Current Rate Card */}
        <Card>
          <h2 className="text-lg sm:text-xl font-semibold mb-6">{t('adminRate.currentRate')}</h2>

          <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-4">
            {currentRate ? `EGP ${currentRate.toFixed(2)}` : t('adminRate.notSet')}
          </div>

          <p className="text-gray-600 text-sm sm:text-base">
            {t('adminRate.currentRate')}: EGP per USDT
          </p>
        </Card>

        {/* Update Rate Card */}
        <Card>
          <h2 className="text-lg sm:text-xl font-semibold mb-6">{t('adminRate.updateRate')}</h2>

          {message && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm sm:text-base">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm sm:text-base">
              {error}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label={t('adminRate.rateLabel')}
              type="number"
              step="0.01"
              min="0"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder={t('adminRate.ratePlaceholder')}
              required
            />

            <Button
              type="submit"
              className="w-full text-sm sm:text-base"
              disabled={updating || !rate}
            >
              {updating ? t('adminRate.updating') : t('adminRate.updateRate')}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>{t('common.note') || 'Note'}:</strong> {t('adminRate.rateNote')}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}