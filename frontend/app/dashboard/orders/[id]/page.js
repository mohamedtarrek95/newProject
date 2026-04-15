'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { orderAPI } from '@/lib/api';
import { Button, Card, Badge, Spinner } from '@/components/ui';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  const loadOrder = async () => {
    try {
      const data = await orderAPI.getById(params.id);
      setOrder(data);
    } catch (err) {
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      await orderAPI.uploadProof(order._id, selectedFile);
      setSuccess('Payment proof uploaded successfully!');
      setSelectedFile(null);
      loadOrder();
    } catch (err) {
      setError(err.message || 'Failed to upload proof');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'pending',
      approved: 'approved',
      rejected: 'rejected'
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="text-center">
          <p className="text-gray-600 mb-4">Order not found.</p>
          <Button onClick={() => router.push('/dashboard/orders')}>Back to Orders</Button>
        </Card>
      </div>
    );
  }

  const calculatedAmount = order.type === 'EGP_TO_USDT'
    ? (order.amount / order.exchangeRate).toFixed(6)
    : (order.amount * order.exchangeRate).toFixed(2);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Button variant="secondary" onClick={() => router.push('/dashboard/orders')} className="mb-6">
        ← Back to Orders
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold">Order Details</h1>
            {getStatusBadge(order.status)}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Order ID</span>
              <span className="font-mono text-sm">{order._id}</span>
            </div>

            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Type</span>
              <span className="font-semibold">
                {order.type === 'EGP_TO_USDT' ? 'EGP → USDT' : 'USDT → EGP'}
              </span>
            </div>

            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Amount</span>
              <span className="font-semibold">
                {order.amount} {order.type === 'EGP_TO_USDT' ? 'EGP' : 'USDT'}
              </span>
            </div>

            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Exchange Rate</span>
              <span className="font-semibold">EGP {order.exchangeRate.toFixed(2)} / USDT</span>
            </div>

            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">You Will {order.type === 'EGP_TO_USDT' ? 'Receive' : 'Pay'}</span>
              <span className="font-semibold text-primary-600 text-xl">
                {calculatedAmount} {order.type === 'EGP_TO_USDT' ? 'USDT' : 'EGP'}
              </span>
            </div>

            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Created</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>

            {order.adminNotes && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Admin Notes:</p>
                <p className="mt-1">{order.adminNotes}</p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-6">Payment Proof</h2>

          {order.paymentProofUrl ? (
            <div>
              <p className="text-green-600 mb-4">Payment proof uploaded ✓</p>
              <img
                src={order.paymentProofUrl}
                alt="Payment Proof"
                className="w-full rounded-lg border"
              />
            </div>
          ) : order.status === 'pending' ? (
            <div>
              <p className="text-gray-600 mb-4">
                Please upload a proof of your payment. This can be a screenshot of your
                bank transfer, receipt, or any proof showing you have made the payment.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100"
                />

                {selectedFile && (
                  <div className="flex items-center gap-4">
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="w-full"
                >
                  {uploading ? 'Uploading...' : 'Upload Proof'}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">
              {order.status === 'rejected'
                ? 'This order was rejected.'
                : 'No payment proof uploaded for this order.'}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
