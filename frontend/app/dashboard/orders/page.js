'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { orderAPI } from '@/lib/api';
import { Card, Badge, Spinner } from '@/components/ui';
import { useTranslations } from '@/components/TranslationsProvider';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslations();

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
    const statusKey = status?.toLowerCase() || 'pending';
    const label = t(`orders.status.${statusKey}`);
    return <Badge variant={variants[statusKey]}>{label}</Badge>;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">{t('orders.title')}</h1>
        <Link href="/dashboard/exchange">
          <button className="btn-primary text-sm sm:text-base whitespace-nowrap">{t('orders.newOrder')}</button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-600 mb-4 text-sm sm:text-base">{t('orders.noOrders')}</p>
          <Link href="/dashboard/exchange">
            <button className="btn-primary text-sm sm:text-base">{t('orders.createFirstOrder')}</button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id} className="hover:shadow-md transition-shadow">
              <Link href={`/dashboard/orders/${order._id}`} className="block">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="font-semibold text-sm sm:text-base">
                        {order.type === 'EGP_TO_USDT' ? t('orders.type.egp_to_usdt') : t('orders.type.usdt_to_egp')}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {t('orderDetail.amount')}: <span className="font-semibold">{order.amount}</span>
                      {order.type === 'EGP_TO_USDT' ? ' EGP' : ' USDT'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {t('orderDetail.rate')}: EGP {order.exchangeRate.toFixed(2)} / USDT
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    <p className="text-sm text-primary-600 mt-1">{t('orders.viewDetails')} →</p>
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