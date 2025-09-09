'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/types/order';
import { useSession } from '@/components/SessionProvider';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';

export default function OrdersPage() {
  const { user, isLoading } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'cooking' | 'serve'>('all');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (!isLoading && user) {
      fetchOrders();
    }
  }, [isLoading, user, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/food-orders?created_by=${user?.id}`, {
      });

      if (response.status !== 200) {
        throw new Error('Failed to fetch orders');
      }

      const data = response.data;
      // Handle array response
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cooking':
        return 'bg-blue-100 text-blue-800';
      case 'serve':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'cooking':
        return 'Cooking';
      case 'serve':
        return 'Ready to Serve';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOrders = orders.filter(order => 
    filter === 'all' || order.status === filter
  );

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-1">Track your food orders and their status</p>
          </div>

          {/* Filter Tabs */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {[
                { key: 'all', label: 'All Orders' },
                { key: 'pending', label: 'Pending' },
                { key: 'cooking', label: 'Cooking' },
                { key: 'serve', label: 'Ready' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as 'all' | 'pending' | 'cooking' | 'serve')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === tab.key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          <div className="divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">🍽️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
                </h3>
                <p className="text-gray-500 mb-6">
                  {filter === 'all' 
                    ? 'Start by ordering some delicious food from our menu!'
                    : `You don't have any ${filter} orders at the moment.`
                  }
                </p>
                <button
                  onClick={() => router.push('/menu')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.id} className="px-6 py-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.id.split('_').pop()}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Room {order.room_id} • {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        ฿{order.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          {item.note && (
                            <p className="text-sm text-gray-500 italic">Note: {item.note}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {item.quantity} × ฿{item.price_each.toFixed(2)}
                          </p>
                          <p className="font-medium text-gray-900">
                            ฿{item.total_price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
