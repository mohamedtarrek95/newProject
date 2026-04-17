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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{t('orders.title')}</h1>
          <p className="text-surface-400">View and manage your exchange orders</p>
        </div>
        <Link href="/dashboard/exchange">
          <button className="btn-primary text-sm sm:text-base whitespace-nowrap">
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t('orders.newOrder')}
          </button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-surface-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-surface-400 mb-6">{t('orders.noOrders')}</p>
          <Link href="/dashboard/exchange">
            <button className="btn-primary text-sm sm:text-base">{t('orders.createFirstOrder')}</button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order._id} href={`/dashboard/orders/${order._id}`} className="block group">
              <Card className="hover:border-surface-500 hover:shadow-premium-md transition-all duration-200">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="font-semibold text-white text-sm sm:text-base">
                        {order.type === 'BUY_USDT' ? t('orders.type.buy_usdt') : order.type === 'SELL_USDT' ? t('orders.type.sell_usdt') : order.type === 'EGP_TO_USDT' ? t('orders.type.egp_to_usdt') : t('orders.type.usdt_to_egp')}
                      </span>
                      {getStatusBadge(order.status)}
                      <span className="text-xs text-surface-500 px-2 py-0.5 bg-surface-700 rounded">{order.currency}</span>
                    </div>
                    <p className="text-surface-300 text-sm sm:text-base mb-1">
                      {t('orderDetail.amount')}: <span className="font-semibold text-white">{order.amount}</span>
                      {order.type === 'BUY_USDT' || order.type === 'EGP_TO_USDT' ? ` ${order.currency}` : ' USDT'}
                    </p>
                    <p className="text-xs sm:text-sm text-surface-500">
                      Rate: {order.currency} {order.exchangeRate.toFixed(2)} / USDT
                    </p>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <p className="text-sm text-surface-500">{formatDate(order.createdAt)}</p>
                    <p className="text-sm text-premium-400 mt-2 group-hover:text-premium-300 transition-colors duration-200 flex items-center gap-1">
                      {t('orders.viewDetails')}
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}