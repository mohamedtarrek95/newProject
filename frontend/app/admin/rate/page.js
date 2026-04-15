'use client';

import { useState, useEffect } from 'react';
import { rateAPI } from '@/lib/api';
import { Button, Card, Spinner, Input } from '@/components/ui';

export default function AdminRatePage() {
  const [rate, setRate] = useState('');
  const [currentRate, setCurrentRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
      setError('Please enter a valid positive number');
      setUpdating(false);
      return;
    }

    try {
      await rateAPI.update({ rate: rateValue });
      setMessage('Exchange rate updated successfully!');
      setCurrentRate(rateValue);
    } catch (err) {
      setError(err.message || 'Failed to update rate');
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
      <h1 className="text-3xl font-bold mb-8">Set Exchange Rate</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-xl font-semibold mb-6">Current Rate</h2>

          <div className="text-4xl font-bold text-primary-600 mb-4">
            {currentRate ? `EGP ${currentRate.toFixed(2)}` : 'Not Set'}
          </div>

          <p className="text-gray-600">
            Current rate: EGP per USDT
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-6">Update Rate</h2>

          {message && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="Exchange Rate (EGP per USDT)"
              type="number"
              step="0.01"
              min="0"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="Enter rate (e.g., 50.00)"
              required
            />

            <Button
              type="submit"
              className="w-full"
              disabled={updating || !rate}
            >
              {updating ? 'Updating...' : 'Update Rate'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Changing the rate will not affect existing orders.
              Only new orders will use the updated rate.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
