'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { orderAPI } from '@/lib/api';
import { Button, Card, Badge, Spinner, Input } from '@/components/ui';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  const loadOrder = async () => {
    try {
      const data = await orderAPI.getById(params.id);
      setOrder(data);
      setAdminNotes(data.adminNotes || '');
    } catch (err) {
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      await orderAPI.approve(order._id, { adminNotes });
      setSuccess('Order approved successfully!');
      loadOrder();
    } catch (err) {
      setError(err.message || 'Failed to approve order');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!adminNotes) {
      setError('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      await orderAPI.reject(order._id, { adminNotes });
      setSuccess('Order rejected successfully!');
      loadOrder();
    } catch (err) {
      setError(err.message || 'Failed to reject order');
    } finally {
      setProcessing(false);
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
          <Button onClick={() => router.push('/admin/orders')}>Back to Orders</Button>
        </Card>
      </div>
    );
  }

  const calculatedAmount = order.type === 'EGP_TO_USDT'
    ? (order.amount / order.exchangeRate).toFixed(6)
    : (order.amount * order.exchangeRate).toFixed(2);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Button variant="secondary" onClick={() => router.push('/admin/orders')} className="mb-6">
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
              <span className="text-gray-600">User</span>
              <span>
                {order.userId?.email} <br />
                <span className="text-sm text-gray-500">
                  {order.userId?.firstName} {order.userId?.lastName}
                </span>
              </span>
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
              <span className="text-gray-600">Converted Amount</span>
              <span className="font-semibold text-primary-600">
                {calculatedAmount} {order.type === 'EGP_TO_USDT' ? 'USDT' : 'EGP'}
              </span>
            </div>

            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Created</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>

            {order.processedBy && (
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Processed By</span>
                <span>{order.processedBy.email}</span>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-6">Admin Actions</h2>

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

          {order.status === 'pending' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (required for rejection)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Enter notes about this order..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  rows="4"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  variant="success"
                  onClick={handleApprove}
                  disabled={processing}
                  className="flex-1"
                >
                  {processing ? 'Processing...' : 'Approve Order'}
                </Button>
                <Button
                  variant="danger"
                  onClick={handleReject}
                  disabled={processing}
                  className="flex-1"
                >
                  {processing ? 'Processing...' : 'Reject Order'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Status:</p>
                <p className="font-semibold text-lg">
                  This order has been {order.status}.
                </p>
              </div>

              {order.adminNotes && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Admin Notes:</p>
                  <p>{order.adminNotes}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-semibold mb-4">Payment Proof</h3>
            {order.paymentProofUrl ? (
              <img
                src={order.paymentProofUrl}
                alt="Payment Proof"
                className="w-full rounded-lg border"
              />
            ) : (
              <p className="text-gray-500">No payment proof uploaded.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
