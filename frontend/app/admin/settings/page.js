'use client';

import { useState, useEffect } from 'react';
import { settingsAPI } from '@/lib/api';
import { Button, Card, Spinner, Input, Alert } from '@/components/ui';
import { useTranslations } from '@/components/TranslationsProvider';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({ usdtWalletAddress: '', usdtNetwork: 'TRC20', usdtQrCodeUrl: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);
  const { t } = useTranslations();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsAPI.get();
      setSettings(data);
    } catch (err) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const validateUrl = (url) => {
    if (!url) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (settings.usdtQrCodeUrl && !validateUrl(settings.usdtQrCodeUrl)) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');
    try {
      const updated = await settingsAPI.update({
        usdtWalletAddress: settings.usdtWalletAddress,
        usdtNetwork: settings.usdtNetwork,
        usdtQrCodeUrl: settings.usdtQrCodeUrl || null
      });
      setSettings(updated);
      setMessage('Settings saved successfully');
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">USDT Receiving Settings</h1>
        <p className="text-surface-400">Configure wallet address and QR code for SELL_USDT orders</p>
      </div>

      {message && <Alert variant="success" className="mb-6">{message}</Alert>}
      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-6">Wallet Configuration</h2>
        <div className="space-y-6">
          <Input
            label="USDT Wallet Address"
            type="text"
            value={settings.usdtWalletAddress}
            onChange={(e) => setSettings(prev => ({ ...prev, usdtWalletAddress: e.target.value }))}
            placeholder="Enter USDT wallet address"
          />
          <Input
            label="Network Name"
            type="text"
            value={settings.usdtNetwork}
            onChange={(e) => setSettings(prev => ({ ...prev, usdtNetwork: e.target.value }))}
            placeholder="TRC20"
          />
          <Input
            label="QR Code Image URL"
            type="url"
            value={settings.usdtQrCodeUrl || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, usdtQrCodeUrl: e.target.value }))}
            placeholder="https://example.com/qr.png"
          />
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 border-2 border-surface-900/30 border-t-surface-900 rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </Card>

      {settings.usdtQrCodeUrl && (
        <Card>
          <h2 className="text-lg font-semibold text-white mb-6">QR Code Preview</h2>
          <div
            className="relative group cursor-pointer overflow-hidden rounded-lg border border-surface-600 hover:border-blue-500 transition-colors inline-block"
            onClick={() => setLightboxImage(settings.usdtQrCodeUrl)}
          >
            <img
              src={settings.usdtQrCodeUrl}
              alt="USDT QR Code"
              className="h-48 w-auto object-contain bg-surface-900"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML += '<p class="text-red-400 text-sm mt-2">Failed to load image</p>';
              }}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </div>
          <p className="text-xs text-surface-500 mt-2">Click to enlarge</p>
        </Card>
      )}

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
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}