'use client';

import { useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/types/order';
import { useSession } from '@/components/SessionProvider';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';

export default function AdminOrdersPage() {
  const { user, isLoading } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'cooking' | 'serve'>('all');
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'orderId' | 'user'>('orderId');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (!isLoading && user) {
      // Check if user is admin
      if (user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      fetchOrders();
    }
  }, [isLoading, user, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/food-orders', {
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

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdating(orderId);
      const response = await api.patch(`/food-orders/${orderId}`, {
        status: newStatus,
      });

      if (response.status !== 200) {
        throw new Error('Failed to update order status');
      }

      // Update the order in the local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setUpdating(null);
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

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case 'pending':
        return 'cooking';
      case 'cooking':
        return 'serve';
      case 'serve':
        return null; // No next status
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    // Apply status filter
    const statusMatch = filter === 'all' || order.status === filter;
    
    // Apply search filter
    let searchMatch = true;
    if (searchTerm.trim()) {
      if (searchType === 'orderId') {
        searchMatch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (searchType === 'user') {
        searchMatch = order.created_by.toLowerCase().includes(searchTerm.toLowerCase());
      }
    }
    
    return statusMatch && searchMatch;
  });

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-1">Manage all food orders and update their status</p>
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

          {/* Search Section */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Orders
                </label>
                <div className="flex gap-2">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as 'orderId' | 'user')}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="orderId">Order ID</option>
                    <option value="user">User (Created By)</option>
                  </select>
                  <input
                    type="text"
                    id="search"
                    placeholder={searchType === 'orderId' ? 'Search by Order ID...' : 'Search by User...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              {searchTerm && (
                <div className="flex items-end">
                  <span className="text-sm text-gray-600">
                    {filteredOrders.length} result{filteredOrders.length !== 1 ? 's' : ''} found
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Orders List */}
          <div className="divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No matching orders found' : (filter === 'all' ? 'No orders found' : `No ${filter} orders`)}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? `No orders match your search for "${searchTerm}" in ${searchType === 'orderId' ? 'Order ID' : 'User'}.`
                    : (filter === 'all' 
                        ? 'There are no orders in the system yet.'
                        : `There are no ${filter} orders at the moment.`
                      )
                  }
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              filteredOrders.map((order) => {
                const nextStatus = getNextStatus(order.status);
                return (
                  <div key={order.id} className="px-6 py-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id.split('_').pop()}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Room {order.room_id} • {formatDate(order.created_at)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Created by: {order.created_by}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-3 mb-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                          {nextStatus && (
                            <button
                              onClick={() => updateOrderStatus(order.id, nextStatus)}
                              disabled={updating === order.id}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                              {updating === order.id ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Updating...
                                </div>
                              ) : (
                                `Mark as ${getStatusText(nextStatus)}`
                              )}
                            </button>
                          )}
                        </div>
                        <p className="text-lg font-bold text-gray-900">
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
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
