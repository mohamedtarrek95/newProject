'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { currencyAPI } from '@/lib/api';
import { Button, Card, Spinner, Alert } from '@/components/ui';
import { useTranslations } from '@/components/TranslationsProvider';

const CURRENCY_NAMES = {
  EGP: 'Egyptian Pound',
  USD: 'US Dollar',
  EUR: 'Euro'
};

const CURRENCY_SYMBOLS = {
  EGP: 'EGP',
  USD: '$',
  EUR: '€'
};

export default function AdminRatePage() {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslations();
  const router = useRouter();

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      const data = await currencyAPI.getAll();
      setCurrencies(data);
    } catch (err) {
      console.error('Failed to load currencies');
    } finally {
      setLoading(false);
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{t('adminRate.title')}</h1>
          <p className="text-surface-400">Overview of all currency rates and prices</p>
        </div>
        <Button onClick={() => router.push('/admin/currencies')}>
          Manage Currencies
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currencies.map((currency) => (
          <Card key={currency.code} premium>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-white">{currency.code}</div>
                <div className="px-2 py-1 rounded bg-surface-700 text-surface-300 text-xs">
                  {CURRENCY_NAMES[currency.code]}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-surface-700/50 border border-surface-600">
                <div className="flex items-center justify-between">
                  <span className="text-surface-400 text-sm">{t('dashboard.buyPrice')}</span>
                  <span className="font-bold text-emerald-400 text-lg">
                    {CURRENCY_SYMBOLS[currency.code]} {currency.buyPrice.toFixed(4)}
                  </span>
                </div>
                <p className="text-xs text-surface-500 mt-1">per USDT</p>
              </div>

              <div className="p-4 rounded-lg bg-surface-700/50 border border-surface-600">
                <div className="flex items-center justify-between">
                  <span className="text-surface-400 text-sm">{t('dashboard.sellPrice')}</span>
                  <span className="font-bold text-red-400 text-lg">
                    {CURRENCY_SYMBOLS[currency.code]} {currency.sellPrice.toFixed(4)}
                  </span>
                </div>
                <p className="text-xs text-surface-500 mt-1">per USDT</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-surface-700">
              <p className="text-xs text-surface-500">
                {currency.paymentMethods.length} payment method{currency.paymentMethods.length !== 1 ? 's' : ''}:
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {currency.paymentMethods.map((method) => (
                  <span
                    key={method}
                    className="px-2 py-0.5 rounded-full bg-surface-700 text-surface-300 text-xs"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-lg bg-surface-700/50 border border-surface-600">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-premium-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-surface-300">
              <strong className="text-premium-400">{t('common.note')}:</strong>
            </p>
            <p className="text-sm text-surface-400 mt-1">
              To update rates, click "Manage Currencies" above or navigate to the Currencies page in the admin panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}