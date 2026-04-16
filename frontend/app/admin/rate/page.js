'use client';

import { useState, useEffect } from 'react';
import { rateAPI } from '@/lib/api';
import { Button, Card, Spinner, Input, Alert } from '@/components/ui';
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{t('adminRate.title')}</h1>
        <p className="text-surface-400">Set the current exchange rate</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Current Rate Card */}
        <Card premium>
          <div className="absolute top-0 right-0 w-32 h-32 bg-premium-500/10 rounded-full blur-[60px]" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-surface-700">
                <svg className="w-5 h-5 text-premium-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white">{t('adminRate.currentRate')}</h2>
            </div>

            <div className="text-4xl sm:text-5xl font-bold mb-2">
              <span className="text-white">EGP </span>
              <span className="text-gradient">{currentRate ? currentRate.toFixed(2) : '--'}</span>
            </div>

            <p className="text-surface-500 text-sm">per USDT</p>
          </div>
        </Card>

        {/* Update Rate Card */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-6">{t('adminRate.updateRate')}</h2>

          {message && <Alert variant="success" className="mb-4">{message}</Alert>}
          {error && <Alert variant="error" className="mb-4">{error}</Alert>}

          <form onSubmit={handleUpdate} className="space-y-5">
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
              className="w-full"
              disabled={updating || !rate}
            >
              {updating ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-surface-900/30 border-t-surface-900 rounded-full animate-spin" />
                  {t('adminRate.updating')}
                </span>
              ) : (
                t('adminRate.updateRate')
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-lg bg-surface-700/50 border border-surface-600">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-premium-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-surface-300">
                <strong className="text-premium-400">{t('common.note')}:</strong> {t('adminRate.rateNote')}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}