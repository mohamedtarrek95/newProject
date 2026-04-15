'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { orderAPI, rateAPI } from '@/lib/api';
import { Button, Input, Select, Card, Spinner } from '@/components/ui';

export default function ExchangePage() {
  const [type, setType] = useState('EGP_TO_USDT');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadRate();
  }, []);

  const loadRate = async () => {
    try {
      const data = await rateAPI.get();
      setRate(data.rate);
    } catch (err) {
      setError('Failed to load exchange rate');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const order = await orderAPI.create({ type, amount: parseFloat(amount) });
      setSuccess('Order created successfully!');
      setTimeout(() => {
        router.push(`/dashboard/orders/${order._id}`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const calculatedAmount = rate && amount
    ? type === 'EGP_TO_USDT'
      ? (parseFloat(amount) / rate).toFixed(6)
      : (parseFloat(amount) * rate).toFixed(2)
    : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!rate) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="text-center">
          <h2 className="text-xl font-semibold mb-4">Exchange Rate Not Available</h2>
          <p className="text-gray-600 mb-4">
            The admin has not set the exchange rate yet. Please check back later.
          </p>
          <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create Exchange Order</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Select
              label="Exchange Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="EGP_TO_USDT">EGP to USDT (You send EGP, receive USDT)</option>
              <option value="USDT_TO_EGP">USDT to EGP (You send USDT, receive EGP)</option>
            </Select>

            <Input
              label={type === 'EGP_TO_USDT' ? 'Amount in EGP' : 'Amount in USDT'}
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />

            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-100 text-green-700 rounded-lg">
                {success}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={submitting || !amount}
            >
              {submitting ? 'Creating Order...' : 'Create Order'}
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-600">Current Rate</span>
              <span className="font-semibold">EGP {rate.toFixed(2)} / USDT</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-600">You Send</span>
              <span className="font-semibold">
                {amount || '0'} {type === 'EGP_TO_USDT' ? 'EGP' : 'USDT'}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-600">You Receive</span>
              <span className="font-semibold text-primary-600 text-xl">
                {calculatedAmount} {type === 'EGP_TO_USDT' ? 'USDT' : 'EGP'}
              </span>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> After creating the order, you will need to make the payment
                and upload a proof of payment. An admin will review and approve your order.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
