'use client';

import { useState, useEffect } from 'react';
import { currencyAPI } from '@/lib/api';
import { Button, Card, Spinner, Input, Alert } from '@/components/ui';
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

export default function AdminCurrenciesPage() {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { t } = useTranslations();

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      const data = await currencyAPI.getAll();
      setCurrencies(data);
    } catch (err) {
      setError('Failed to load currencies');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (code) => {
    const currency = currencies.find(c => c.code === code);
    if (!currency) return;

    setUpdating(code);
    setError('');
    setMessage('');

    try {
      await currencyAPI.update(code, {
        buyPrice: parseFloat(currency.buyPrice),
        sellPrice: parseFloat(currency.sellPrice),
        paymentMethods: currency.paymentMethods
      });
      setMessage(t('adminCurrencies.updated'));
    } catch (err) {
      setError(err.message || t('adminCurrencies.updateFailed'));
    } finally {
      setUpdating(null);
    }
  };

  const updateField = (code, field, value) => {
    setCurrencies(prev => prev.map(c =>
      c.code === code ? { ...c, [field]: value } : c
    ));
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
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{t('adminCurrencies.title')}</h1>
        <p className="text-surface-400">{t('adminCurrencies.description')}</p>
      </div>

      {message && <Alert variant="success" className="mb-6">{message}</Alert>}
      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {currencies.map((currency) => (
          <Card key={currency.code} premium>
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl font-bold text-white">{currency.code}</div>
                <div className="px-2 py-1 rounded bg-surface-700 text-surface-300 text-sm">
                  {CURRENCY_NAMES[currency.code]}
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <Input
                label={`${t('adminCurrencies.buyPrice')} (${CURRENCY_SYMBOLS[currency.code]} ${t('adminCurrencies.per')} USDT)`}
                type="number"
                step="0.01"
                min="0"
                value={currency.buyPrice}
                onChange={(e) => updateField(currency.code, 'buyPrice', e.target.value)}
              />

              <Input
                label={`${t('adminCurrencies.sellPrice')} (${CURRENCY_SYMBOLS[currency.code]} ${t('adminCurrencies.per')} USDT)`}
                type="number"
                step="0.01"
                min="0"
                value={currency.sellPrice}
                onChange={(e) => updateField(currency.code, 'sellPrice', e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-surface-300 mb-2">
                {t('adminCurrencies.paymentMethods')}
              </label>
              <div className="flex flex-wrap gap-2">
                {currency.paymentMethods.map((method) => (
                  <span
                    key={method}
                    className="px-3 py-1.5 rounded-full bg-surface-700 text-surface-200 text-sm"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              onClick={() => handleUpdate(currency.code)}
              disabled={updating === currency.code}
            >
              {updating === currency.code ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-surface-900/30 border-t-surface-900 rounded-full animate-spin" />
                  {t('adminCurrencies.updating')}
                </span>
              ) : (
                t('adminCurrencies.save')
              )}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
