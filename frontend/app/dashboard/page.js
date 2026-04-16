'use client';

import { useState, useEffect } from 'react';
import { rateAPI, userAPI } from '@/lib/api';
import { Card, Spinner, Alert, StatCard } from '@/components/ui';
import { useTranslations } from '@/components/TranslationsProvider';

export default function UserDashboard() {
  const [rate, setRate] = useState(null);
  const [wallet, setWallet] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const { t } = useTranslations();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const rateData = await rateAPI.get();
      setRate(rateData.rate);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWallet = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');

    try {
      await userAPI.updateWallet({ usdtWalletAddress: wallet });
      setMessage(t('dashboard.walletUpdated'));
      setWallet('');
    } catch (error) {
      setMessage(t('dashboard.walletUpdateFailed') + ': ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{t('dashboard.title')}</h1>
        <p className="text-surface-400">Manage your exchange orders and wallet</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Exchange Rate Card */}
        <Card premium className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-premium-500/10 rounded-full blur-[60px]" />
          <div className="relative">
            <p className="text-surface-400 text-sm font-medium mb-2">{t('dashboard.exchangeRate')}</p>
            <div className="text-4xl sm:text-5xl font-bold mb-2">
              <span className="text-white">EGP </span>
              <span className="text-gradient">{rate ? rate.toFixed(2) : '--'}</span>
            </div>
            <p className="text-surface-500 text-sm">per USDT</p>
          </div>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">{t('dashboard.quickActions')}</h2>
          <div className="space-y-3">
            <a href="/dashboard/exchange" className="block">
              <button className="w-full btn-primary text-sm sm:text-base">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {t('dashboard.createNewOrder')}
              </button>
            </a>
            <a href="/dashboard/orders" className="block">
              <button className="w-full btn-secondary text-sm sm:text-base">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {t('dashboard.viewMyOrders')}
              </button>
            </a>
          </div>
        </Card>
      </div>

      {/* Wallet Card */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-surface-700">
            <svg className="w-5 h-5 text-premium-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{t('dashboard.usdtWallet')}</h2>
            <p className="text-surface-400 text-sm">{t('dashboard.usdtWalletDesc')}</p>
          </div>
        </div>

        {message && (
          <Alert variant={message.includes('success') || message.includes('نجاح') ? 'success' : 'error'} className="mb-6">
            {message}
          </Alert>
        )}

        <form onSubmit={handleUpdateWallet} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <input
            type="text"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder={t('dashboard.walletPlaceholder')}
            className="flex-1 input-field text-sm sm:text-base"
          />
          <button type="submit" disabled={updating || !wallet} className="btn-primary whitespace-nowrap text-sm sm:text-base">
            {updating ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 border-2 border-surface-900/30 border-t-surface-900 rounded-full animate-spin" />
                {t('dashboard.updating')}
              </span>
            ) : (
              t('dashboard.updateWallet')
            )}
          </button>
        </form>
      </Card>
    </div>
  );
}