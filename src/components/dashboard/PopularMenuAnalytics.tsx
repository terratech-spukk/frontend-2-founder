"use client";

import { useState } from "react";
import { useOrderData } from "./OrderDataProvider";
import { Order, OrderItem } from "@/types/order";

interface PopularMenuAnalyticsProps {
  onError?: (error: string) => void;
}

interface MenuItemStats {
  menu_id: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
  averagePrice: number;
}

export function PopularMenuAnalytics({ onError }: PopularMenuAnalyticsProps) {
  const { orders, loading, error, refetch } = useOrderData();
  const [timeRange, setTimeRange] = useState<
    "all" | "today" | "week" | "month"
  >("all");

  const filterOrdersByTimeRange = (orders: Order[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return orders.filter((order) => {
      const orderDate = new Date(order.created_at);

      switch (timeRange) {
        case "today":
          return orderDate >= today;
        case "week":
          return orderDate >= weekAgo;
        case "month":
          return orderDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const calculatePopularMenuItems = (): MenuItemStats[] => {
    const filteredOrders = filterOrdersByTimeRange(orders);
    const menuItemMap = new Map<string, MenuItemStats>();

    filteredOrders.forEach((order) => {
      order.items.forEach((item: OrderItem) => {
        const existing = menuItemMap.get(item.menu_id);
        if (existing) {
          existing.totalQuantity += item.quantity;
          existing.totalRevenue += item.total_price;
          existing.orderCount += 1;
          existing.averagePrice =
            existing.totalRevenue / existing.totalQuantity;
        } else {
          menuItemMap.set(item.menu_id, {
            menu_id: item.menu_id,
            name: item.name,
            totalQuantity: item.quantity,
            totalRevenue: item.total_price,
            orderCount: 1,
            averagePrice: item.price_each,
          });
        }
      });
    });

    return Array.from(menuItemMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10); // Top 10 most popular items
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const popularItems = calculatePopularMenuItems();
  const totalQuantity = popularItems.reduce(
    (sum, item) => sum + item.totalQuantity,
    0,
  );

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Popular Menu Items
            </h2>
            <p className="text-gray-600 text-sm">
              Most ordered food items and their performance
            </p>
          </div>
          <select
            value={timeRange}
            onChange={(e) =>
              setTimeRange(e.target.value as "all" | "today" | "week" | "month")
            }
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        {popularItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🍽️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-500">
              {timeRange === "all"
                ? "No orders have been placed yet."
                : `No orders found for the selected time range.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {popularItems.map((item, index) => {
              const percentage =
                totalQuantity > 0
                  ? (item.totalQuantity / totalQuantity) * 100
                  : 0;

              return (
                <div
                  key={item.menu_id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Menu ID: {item.menu_id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {item.totalQuantity} orders
                      </p>
                      <p className="text-sm text-gray-500">
                        {percentage.toFixed(1)}% of total
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-600">
                        Total Revenue
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        ฿{item.totalRevenue.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-600">
                        Order Count
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {item.orderCount}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-600">
                        Average Price
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        ฿{item.averagePrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {popularItems.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {popularItems.length}
                </p>
                <p className="text-sm text-gray-600">Unique Items</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {totalQuantity}
                </p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  ฿
                  {popularItems
                    .reduce((sum, item) => sum + item.totalRevenue, 0)
                    .toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
