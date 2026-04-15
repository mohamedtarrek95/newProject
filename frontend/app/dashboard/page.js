'use client';

import { useState, useEffect } from 'react';
import { rateAPI, userAPI } from '@/lib/api';
import { Card, Badge, Spinner } from '@/components/ui';

export default function UserDashboard() {
  const [rate, setRate] = useState(null);
  const [wallet, setWallet] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const rateData = await rateAPI.get();
      setRate(rateData.rate);
      const userData = await userAPI.updateProfile({});
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
      setMessage('Wallet address updated successfully!');
    } catch (error) {
      setMessage('Failed to update wallet: ' + error.message);
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Current Exchange Rate</h2>
          <div className="text-4xl font-bold text-primary-600">
            {rate ? `EGP ${rate.toFixed(2)} / USDT` : 'Rate not set'}
          </div>
          <p className="text-gray-500 mt-2">EGP to USDT</p>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a href="/dashboard/exchange" className="block">
              <button className="w-full btn-primary">
                Create New Exchange Order
              </button>
            </a>
            <a href="/dashboard/orders" className="block">
              <button className="w-full btn-secondary">
                View My Orders
              </button>
            </a>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4">USDT Wallet Address</h2>
        <p className="text-gray-600 mb-4">
          Add your USDT wallet address to receive withdrawals.
        </p>

        {message && (
          <div className={`mb-4 p-3 rounded-lg ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleUpdateWallet} className="flex gap-4">
          <input
            type="text"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="Enter your TRC-20 USDT wallet address"
            className="flex-1 input-field"
          />
          <button type="submit" disabled={updating || !wallet} className="btn-primary">
            {updating ? 'Updating...' : 'Update'}
          </button>
        </form>
      </Card>
    </div>
  );
}
