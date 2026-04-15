'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { orderAPI } from '@/lib/api';
import { Card, Badge, Spinner } from '@/components/ui';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await orderAPI.getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <Link href="/dashboard/exchange">
          <button className="btn-primary">New Order</button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't created any orders yet.</p>
          <Link href="/dashboard/exchange">
            <button className="btn-primary">Create Your First Order</button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id} className="hover:shadow-md transition-shadow">
              <Link href={`/dashboard/orders/${order._id}`} className="block">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold">
                        {order.type === 'EGP_TO_USDT' ? 'EGP → USDT' : 'USDT → EGP'}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-gray-600">
                      Amount: <span className="font-semibold">{order.amount}</span>
                      {order.type === 'EGP_TO_USDT' ? ' EGP' : ' USDT'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Rate: EGP {order.exchangeRate.toFixed(2)} / USDT
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    <p className="text-sm text-primary-600 mt-1">View Details →</p>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
