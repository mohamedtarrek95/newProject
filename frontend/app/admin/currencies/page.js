'use client';

import { useState, useEffect } from 'react';
import { currencyAPI } from '@/lib/api';
import { Button, Card, Spinner, Input, Alert } from '@/components/ui';
import { useTranslations } from '@/components/TranslationsProvider';

const CURRENCY_SYMBOLS = {
  EGP: 'EGP',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ'
};

export default function AdminCurrenciesPage() {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCurrency, setNewCurrency] = useState({ code: '', name: '', buyPrice: '', sellPrice: '', paymentMethods: '' });
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

  const handleAddCurrency = async () => {
    if (!newCurrency.code || !newCurrency.name || !newCurrency.buyPrice || !newCurrency.sellPrice) {
      setError('Please fill in all required fields');
      return;
    }

    setUpdating('add');
    setError('');
    setMessage('');

    try {
      const methods = newCurrency.paymentMethods
        ? newCurrency.paymentMethods.split(',').map(m => m.trim()).filter(Boolean)
        : [];

      await currencyAPI.update(newCurrency.code.toUpperCase(), {
        buyPrice: parseFloat(newCurrency.buyPrice),
        sellPrice: parseFloat(newCurrency.sellPrice),
        paymentMethods: methods,
        name: newCurrency.name
      });

      setMessage('Currency added successfully');
      setNewCurrency({ code: '', name: '', buyPrice: '', sellPrice: '', paymentMethods: '' });
      setShowAddModal(false);
      loadCurrencies();
    } catch (err) {
      setError(err.message || 'Failed to add currency');
    } finally {
      setUpdating(null);
    }
  };

  const updateField = (code, field, value) => {
    setCurrencies(prev => prev.map(c =>
      c.code === code ? { ...c, [field]: value } : c
    ));
  };

  const addPaymentMethod = (code) => {
    const currency = currencies.find(c => c.code === code);
    if (!currency) return;
    const newMethod = prompt('Enter new payment method name:');
    if (newMethod && newMethod.trim()) {
      updateField(code, 'paymentMethods', [...currency.paymentMethods, newMethod.trim()]);
    }
  };

  const removePaymentMethod = (code, methodToRemove) => {
    const currency = currencies.find(c => c.code === code);
    if (!currency) return;
    updateField(code, 'paymentMethods', currency.paymentMethods.filter(m => m !== methodToRemove));
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{t('adminCurrencies.title')}</h1>
          <p className="text-surface-400">{t('adminCurrencies.description')}</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Currency
        </Button>
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
                  {currency.name}
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-4">
              <Input
                label={`Buy Price (${CURRENCY_SYMBOLS[currency.code] || currency.code} per USDT)`}
                type="number"
                step="0.01"
                min="0"
                value={currency.buyPrice}
                onChange={(e) => updateField(currency.code, 'buyPrice', e.target.value)}
              />

              <Input
                label={`Sell Price (${CURRENCY_SYMBOLS[currency.code] || currency.code} per USDT)`}
                type="number"
                step="0.01"
                min="0"
                value={currency.sellPrice}
                onChange={(e) => updateField(currency.code, 'sellPrice', e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Payment Methods
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {currency.paymentMethods.map((method) => (
                  <span
                    key={method}
                    className="px-3 py-1.5 rounded-full bg-surface-700 text-surface-200 text-sm flex items-center gap-1"
                  >
                    {method}
                    <button
                      onClick={() => removePaymentMethod(currency.code, method)}
                      className="ml-1 text-surface-400 hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <button
                onClick={() => addPaymentMethod(currency.code)}
                className="text-sm text-premium-400 hover:text-premium-300 transition-colors"
              >
                + Add Payment Method
              </button>
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

      {/* Add Currency Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6">Add New Currency</h2>

            <div className="space-y-4">
              <Input
                label="Currency Code (e.g., GBP, AED)"
                value={newCurrency.code}
                onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value.toUpperCase() })}
                placeholder="GBP"
              />

              <Input
                label="Currency Name"
                value={newCurrency.name}
                onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })}
                placeholder="British Pound"
              />

              <Input
                label="Buy Price (per USDT)"
                type="number"
                step="0.01"
                value={newCurrency.buyPrice}
                onChange={(e) => setNewCurrency({ ...newCurrency, buyPrice: e.target.value })}
                placeholder="0.00"
              />

              <Input
                label="Sell Price (per USDT)"
                type="number"
                step="0.01"
                value={newCurrency.sellPrice}
                onChange={(e) => setNewCurrency({ ...newCurrency, sellPrice: e.target.value })}
                placeholder="0.00"
              />

              <Input
                label="Payment Methods (comma separated)"
                value={newCurrency.paymentMethods}
                onChange={(e) => setNewCurrency({ ...newCurrency, paymentMethods: e.target.value })}
                placeholder="Bank Transfer, PayPal"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddModal(false);
                  setNewCurrency({ code: '', name: '', buyPrice: '', sellPrice: '', paymentMethods: '' });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCurrency}
                disabled={updating === 'add'}
                className="flex-1"
              >
                {updating === 'add' ? 'Adding...' : 'Add Currency'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
