'use client';

import { useState, useEffect } from 'react';
import { settingsAPI } from '@/lib/api';
import { Button, Card, Spinner, Input, Alert } from '@/components/ui';
import { useTranslations } from '@/components/TranslationsProvider';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({ usdtWalletAddress: '', usdtNetwork: 'TRC20', usdtQrCodeUrl: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
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

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const updated = await settingsAPI.update({
        usdtWalletAddress: settings.usdtWalletAddress,
        usdtNetwork: settings.usdtNetwork
      });
      setSettings(updated);
      setMessage('Settings saved successfully');
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleQrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    setUploadingQr(true);
    setError('');
    setMessage('');
    try {
      const data = await settingsAPI.uploadQr(file);
      setSettings(prev => ({ ...prev, usdtQrCodeUrl: data.usdtQrCodeUrl }));
      setMessage('QR code uploaded successfully');
    } catch (err) {
      setError(err.message || 'Failed to upload QR code');
    } finally {
      setUploadingQr(false);
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

      <Card>
        <h2 className="text-lg font-semibold text-white mb-6">QR Code</h2>
        {settings.usdtQrCodeUrl && (
          <div className="mb-6">
            <div
              className="relative group cursor-pointer overflow-hidden rounded-lg border border-surface-600 hover:border-blue-500 transition-colors inline-block"
              onClick={() => setLightboxImage(settings.usdtQrCodeUrl)}
            >
              <img
                src={settings.usdtQrCodeUrl}
                alt="USDT QR Code"
                className="h-48 w-auto object-contain bg-surface-900"
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
          </div>
        )}
        <div>
          <label className="block w-full cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleQrUpload}
              className="hidden"
            />
            <div className="border-2 border-dashed border-surface-600 rounded-lg p-6 text-center hover:border-surface-500 transition-colors">
              <svg className="w-8 h-8 text-surface-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-surface-400">
                {uploadingQr ? 'Uploading...' : 'Click to upload QR code image'}
              </p>
              <p className="text-xs text-surface-500 mt-1">PNG, JPG up to 5MB</p>
            </div>
          </label>
        </div>
      </Card>

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
    </div>
  );
}
