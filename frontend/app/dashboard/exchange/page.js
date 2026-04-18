'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { orderAPI, currencyAPI, settingsAPI } from '@/lib/api';
import { Button, Input, Select, Card, Spinner, Alert } from '@/components/ui';
import { useTranslations } from '@/components/TranslationsProvider';
import { useAuth } from '@/context/AuthProvider';

const CURRENCY_SYMBOLS = {
  EGP: 'EGP',
  USD: '$',
  EUR: '€'
};

export default function ExchangePage() {
  const [currency, setCurrency] = useState('EGP');
  const [currencies, setCurrencies] = useState([]);
  const [type, setType] = useState('SELL_USDT');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [txid, setTxid] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [usdtSettings, setUsdtSettings] = useState({ usdtWalletAddress: '', usdtNetwork: 'TRC20', usdtQrCodeUrl: null });
  const [lightboxImage, setLightboxImage] = useState(null);
  const router = useRouter();
  const { t } = useTranslations();
  const { user } = useAuth();

  const isBuyOrder = type === 'BUY_USDT';

  useEffect(() => {
    loadCurrencies();
    loadUsdtSettings();
  }, []);

  useEffect(() => {
    if (user?.walletAddress) {
      setWalletAddress(user.walletAddress);
    }
  }, [user]);

  const loadCurrencies = async () => {
    try {
      const data = await currencyAPI.getAll();
      setCurrencies(data);
      if (data.length > 0) {
        setCurrency(data[0].code);
      }
    } catch (err) {
      setError(t('exchange.rateNotAvailable'));
    } finally {
      setLoading(false);
    }
  };

  const loadUsdtSettings = async () => {
    try {
      const data = await settingsAPI.get();
      setUsdtSettings(data);
    } catch (err) {
      console.error('Failed to load USDT settings');
    }
  };

  const selectedCurrency = currencies.find(c => c.code === currency);

  const currentBuyPrice = selectedCurrency?.buyPrice || 0;
  const currentSellPrice = selectedCurrency?.sellPrice || 0;

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
    setPaymentMethod('');
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setPaymentMethod('');
  };

  const displayedPrice = type === 'SELL_USDT' ? currentSellPrice : currentBuyPrice;
  const priceLabel = type === 'SELL_USDT'
    ? t('dashboard.sellPrice')
    : t('dashboard.buyPrice');

  const calculatedAmount = amount && currentBuyPrice && currentSellPrice
    ? type === 'SELL_USDT'
      ? (parseFloat(amount) * displayedPrice).toFixed(2)
      : (parseFloat(amount) / displayedPrice).toFixed(6)
    : '0';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const isBuy = type === 'BUY_USDT' || type === 'USDT_TO_EGP';
      const order = await orderAPI.create({
        type,
        currency,
        amount: parseFloat(amount),
        paymentMethod,
        walletAddress: isBuy ? walletAddress : null,
        txid: type === 'SELL_USDT' ? txid : null
      });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (currencies.length === 0) {
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

  const handleTelegramContact = () => {
    window.open('https://t.me/Hosssam95', '_blank');
  };

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
              label={t('exchange.selectCurrency')}
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </Select>

            <Select
              label={t('exchange.exchangeType')}
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              <option value="SELL_USDT">{t('exchange.sellUsdtOption')}</option>
              <option value="BUY_USDT">{t('exchange.buyUsdtOption')}</option>
            </Select>

            <Select
              label={t('exchange.selectPaymentMethod')}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
            >
              <option value="">--</option>
              {selectedCurrency?.paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </Select>

            <Input
              label={type === 'SELL_USDT' ? t('exchange.amountInUsdt') : `Amount in ${CURRENCY_SYMBOLS[currency]}`}
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />

            {isBuyOrder && (
              <Input
                label="USDT Wallet Address"
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter your USDT wallet address"
                required
              />
            )}

            {type === 'SELL_USDT' && (
              <Input
                label="Transaction ID (TXID)"
                type="text"
                value={txid}
                onChange={(e) => setTxid(e.target.value)}
                placeholder="Enter transaction ID after sending USDT"
                required
              />
            )}

            {error && (
              <Alert variant="error">{error}</Alert>
            )}

            {success && (
              <Alert variant="success">{success}</Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={submitting || !amount || !paymentMethod || (isBuyOrder && !walletAddress) || (type === 'SELL_USDT' && !txid)}
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">{t('exchange.orderSummary')}</h2>
            <div className="px-3 py-1.5 rounded-full bg-premium-500/20 border border-premium-500/30">
              <span className="text-sm font-medium text-premium-400">{currency}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-surface-700/50 border border-surface-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-surface-400 text-sm">{t('exchange.exchangeType')}</span>
                <span className={`font-semibold ${type === 'SELL_USDT' ? 'text-emerald-400' : 'text-blue-400'}`}>
                  {type === 'SELL_USDT' ? t('exchange.sellUsdt') : t('exchange.buyUsdt')}
                </span>
              </div>
              <div className="text-sm text-surface-500">
                {type === 'SELL_USDT'
                  ? `${CURRENCY_SYMBOLS[currency]} ${t('dashboard.sellPrice')}`
                  : `${CURRENCY_SYMBOLS[currency]} ${t('dashboard.buyPrice')}`
                }
              </div>
            </div>

            <div className="p-4 rounded-lg bg-surface-700/50 border border-surface-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-surface-400 text-sm">{priceLabel}</span>
                <span className="font-bold text-xl text-white">
                  {CURRENCY_SYMBOLS[currency]} {displayedPrice.toFixed(4)}
                </span>
              </div>
              <div className="text-xs text-surface-500">
                1 USDT = {CURRENCY_SYMBOLS[currency]} {displayedPrice.toFixed(4)}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-surface-700 gap-2">
              <span className="text-surface-400 text-sm">{t('exchange.youSend')}</span>
              <span className="font-semibold text-white">
                {amount || '0'} {type === 'SELL_USDT' ? 'USDT' : CURRENCY_SYMBOLS[currency]}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-2">
              <span className="text-surface-400 text-sm">{t('exchange.youReceive')}</span>
              <span className="font-bold text-2xl text-gradient">
                {calculatedAmount} {type === 'SELL_USDT' ? CURRENCY_SYMBOLS[currency] : 'USDT'}
              </span>
            </div>

            {isBuyOrder && walletAddress && (
              <div className="p-3 rounded-lg bg-surface-700/50 border border-surface-600">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-premium-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-xs text-surface-400">Your USDT Wallet</p>
                    <p className="text-sm font-mono text-white truncate">{walletAddress}</p>
                  </div>
                </div>
              </div>
            )}

            {type === 'SELL_USDT' && (usdtSettings.usdtWalletAddress || usdtSettings.usdtQrCodeUrl) && (
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-emerald-400 font-semibold text-sm">Send USDT to our wallet</h3>
                </div>
                {usdtSettings.usdtQrCodeUrl && (
                  <div
                    className="mb-3 cursor-pointer group relative inline-block"
                    onClick={() => setLightboxImage(usdtSettings.usdtQrCodeUrl)}
                  >
                    <img
                      src={usdtSettings.usdtQrCodeUrl}
                      alt="USDT QR Code"
                      className="h-32 w-auto rounded border border-emerald-500/30 group-hover:border-emerald-400 transition-colors"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                )}
                {usdtSettings.usdtWalletAddress && (
                  <div className="flex items-center gap-2 bg-surface-900 rounded-lg p-3 border border-surface-700">
                    <p className="text-white font-mono text-sm flex-1 break-all">{usdtSettings.usdtWalletAddress}</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(usdtSettings.usdtWalletAddress)}
                      className="text-emerald-400 hover:text-emerald-300 transition-colors p-1"
                      title="Copy address"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                )}
                <p className="text-xs text-emerald-300 mt-2">
                  Network: {usdtSettings.usdtNetwork || 'TRC20'}
                </p>
                <div className="mt-3 p-2 rounded bg-amber-500/10 border border-amber-500/30">
                  <p className="text-xs text-amber-300">
                    <strong>Warning:</strong> Send only USDT on {usdtSettings.usdtNetwork || 'TRC20'} network. Sending on another network may result in loss of funds.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4 p-4 rounded-lg bg-surface-700/50 border border-surface-600">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-premium-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-surface-300">
                  <strong className="text-premium-400">{t('common.note')}:</strong> {t('exchange.orderNote')}
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <p className="text-sm text-cyan-300">
                  <strong className="text-cyan-400">Network:</strong> This transaction uses Plasma network
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              className="mt-4 w-full"
              onClick={handleTelegramContact}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-.896.563-2.594.936-.838.184-1.555.277-2.372.104-.041-.008-.135-.033-.269.053-.269.167-.432.461-.488.601-.064.167.004.25.138.334.134.083.585.249 1.375.523 1.52.529 2.655 1.005 2.717 1.029.062.025.121.038.162.016.177-.087 2.125-2.096 2.207-2.296.015-.037.032-.135.015-.201-.017-.065-.079-.138-.173-.194-.155-.093-.41-.061-.563-.036z"/>
              </svg>
              Contact Support on Telegram
            </Button>
          </div>
        </Card>
      </div>
    </div>

    {lightboxImage && (
      <div
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={() => setLightboxImage(null)}
      >
        <div className="relative max-w-2xl max-h-full">
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute -top-10 right-0 text-white hover:text-surface-300 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={lightboxImage}
            alt="QR Code full size"
            className="max-w-full max-h-[85vh] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    )}
  );
}
