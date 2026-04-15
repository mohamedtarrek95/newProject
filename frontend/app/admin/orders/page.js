'use client';

import { useState, useEffect } from 'react';
import { orderAPI } from '@/lib/api';
import { Card, Badge, Spinner, Button } from '@/components/ui';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 50 };
      if (statusFilter) params.status = statusFilter;

      const data = await orderAPI.getAll(params);
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to load orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId) => {
    setActionLoading(orderId);
    setError('');
    try {
      await orderAPI.approve(orderId);
      setOrders(orders.map(order =>
        order._id === orderId ? { ...order, status: 'approved' } : order
      ));
    } catch (err) {
      setError('Failed to approve order: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (orderId) => {
    setActionLoading(orderId);
    setError('');
    try {
      await orderAPI.reject(orderId);
      setOrders(orders.map(order =>
        order._id === orderId ? { ...order, status: 'rejected' } : order
      ));
    } catch (err) {
      setError('Failed to reject order: ' + err.message);
    } finally {
      setActionLoading(null);
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
      month: 'short',
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}

      <Card className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Filter by Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40 px-3 py-2 border rounded-lg"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <span className="text-gray-600">Total: {pagination.total} orders</span>
        </div>
      </Card>

      {orders.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-600">No orders found.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl shadow-sm border border-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.userId?.email || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.type === 'EGP_TO_USDT' ? 'EGP → USDT' : 'USDT → EGP'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {order.amount} {order.type === 'EGP_TO_USDT' ? 'EGP' : 'USDT'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    EGP {order.exchangeRate?.toFixed(2) || 'N/A'} / USDT
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    {order.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApprove(order._id)}
                          disabled={actionLoading === order._id}
                        >
                          {actionLoading === order._id ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject(order._id)}
                          disabled={actionLoading === order._id}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
