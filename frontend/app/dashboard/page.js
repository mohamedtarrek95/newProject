'use client';

import { useState, useEffect } from 'react';
import { rateAPI, userAPI } from '@/lib/api';
import { Card, Spinner } from '@/components/ui';
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
    } catch (error) {
      setMessage(t('dashboard.walletUpdateFailed') + ': ' + error.message);
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
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t('dashboard.title')}</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Exchange Rate Card */}
        <Card>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">{t('dashboard.exchangeRate')}</h2>
          <div className="text-3xl sm:text-4xl font-bold text-primary-600">
            {rate ? `EGP ${rate.toFixed(2)} / USDT` : t('dashboard.rateNotSet')}
          </div>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">{t('dashboard.egpToUsdt')}</p>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">{t('dashboard.quickActions')}</h2>
          <div className="space-y-3">
            <a href="/dashboard/exchange" className="block">
              <button className="w-full btn-primary text-sm sm:text-base">
                {t('dashboard.createNewOrder')}
              </button>
            </a>
            <a href="/dashboard/orders" className="block">
              <button className="w-full btn-secondary text-sm sm:text-base">
                {t('dashboard.viewMyOrders')}
              </button>
            </a>
          </div>
        </Card>
      </div>

      {/* Wallet Card */}
      <Card>
        <h2 className="text-lg sm:text-xl font-semibold mb-4">{t('dashboard.usdtWallet')}</h2>
        <p className="text-gray-600 mb-4 text-sm sm:text-base">
          {t('dashboard.usdtWalletDesc')}
        </p>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm sm:text-base ${message.includes('success') || message.includes('نجاح') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
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
            {updating ? t('dashboard.updating') : t('dashboard.updateWallet')}
          </button>
        </form>
      </Card>
    </div>
  );
}