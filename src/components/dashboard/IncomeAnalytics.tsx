"use client";

import { useState } from "react";
import { useOrderData } from "./OrderDataProvider";
import { Order } from "@/types/order";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface IncomeAnalyticsProps {
  onError?: (error: string) => void;
}

interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
  completedOrders: number;
  completedRevenue: number;
}

interface HourlyRevenue {
  hour: string;
  revenue: number;
  orders: number;
}

export function IncomeAnalytics({ onError }: IncomeAnalyticsProps) {
  const { orders, loading, error, refetch } = useOrderData();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("week");

  const filterOrdersByTimeRange = (orders: Order[]) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return orders.filter((order) => {
      const orderDate = new Date(order.created_at);

      switch (timeRange) {
        case "week":
          return orderDate >= weekAgo;
        case "month":
          return orderDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const calculateDailyRevenue = (): DailyRevenue[] => {
    const filteredOrders = filterOrdersByTimeRange(orders);
    const revenueMap = new Map<string, DailyRevenue>();

    filteredOrders.forEach((order) => {
      const date = new Date(order.created_at).toISOString().split("T")[0];
      const existing = revenueMap.get(date);

      if (existing) {
        existing.revenue += order.total_amount;
        existing.orders += 1;
        if (order.status === "serve") {
          existing.completedOrders += 1;
          existing.completedRevenue += order.total_amount;
        }
      } else {
        revenueMap.set(date, {
          date,
          revenue: order.total_amount,
          orders: 1,
          completedOrders: order.status === "serve" ? 1 : 0,
          completedRevenue: order.status === "serve" ? order.total_amount : 0,
        });
      }
    });

    return Array.from(revenueMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  };

  const calculateHourlyRevenue = (): HourlyRevenue[] => {
    const filteredOrders = filterOrdersByTimeRange(orders);
    const hourlyMap = new Map<string, HourlyRevenue>();

    filteredOrders.forEach((order) => {
      const hour = new Date(order.created_at).getHours();
      const hourKey = `${hour}:00`;
      const existing = hourlyMap.get(hourKey);

      if (existing) {
        existing.revenue += order.total_amount;
        existing.orders += 1;
      } else {
        hourlyMap.set(hourKey, {
          hour: hourKey,
          revenue: order.total_amount,
          orders: 1,
        });
      }
    });

    return Array.from(hourlyMap.values()).sort(
      (a, b) => parseInt(a.hour) - parseInt(b.hour),
    );
  };

  const calculateTotalStats = () => {
    const filteredOrders = filterOrdersByTimeRange(orders);
    const totalRevenue = filteredOrders.reduce(
      (sum, order) => sum + order.total_amount,
      0,
    );
    const completedOrders = filteredOrders.filter(
      (order) => order.status === "serve",
    );
    const completedRevenue = completedOrders.reduce(
      (sum, order) => sum + order.total_amount,
      0,
    );
    const pendingRevenue = filteredOrders
      .filter((order) => order.status !== "serve")
      .reduce((sum, order) => sum + order.total_amount, 0);

    return {
      totalRevenue,
      completedRevenue,
      pendingRevenue,
      totalOrders: filteredOrders.length,
      completedOrders: completedOrders.length,
      averageOrderValue:
        filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0,
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
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

  const dailyRevenue = calculateDailyRevenue();
  const hourlyRevenue = calculateHourlyRevenue();
  const stats = calculateTotalStats();

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Income Analytics
            </h2>
            <p className="text-gray-600 text-sm">
              Revenue trends and income from served orders
            </p>
          </div>
          <select
            value={timeRange}
            onChange={(e) =>
              setTimeRange(e.target.value as "week" | "month" | "all")
            }
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-green-900">
                  ฿{stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">
                💰
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Completed Revenue
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  ฿{stats.completedRevenue.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                ✅
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">
                  Pending Revenue
                </p>
                <p className="text-2xl font-bold text-yellow-900">
                  ฿{stats.pendingRevenue.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-xl">
                ⏳
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">
                  Avg Order Value
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  ฿{stats.averageOrderValue.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl">
                📊
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Daily Revenue Chart */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Daily Revenue Trend
            </h3>
            {dailyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis tickFormatter={(value) => `฿${value}`} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `฿${value.toFixed(2)}`,
                      name === "revenue"
                        ? "Revenue"
                        : name === "completedRevenue"
                          ? "Completed Revenue"
                          : "Orders",
                    ]}
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Total Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="completedRevenue"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Completed Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data available for the selected time range
              </div>
            )}
          </div>

          {/* Hourly Revenue Chart */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Peak Hours
            </h3>
            {hourlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis tickFormatter={(value) => `฿${value}`} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `฿${value.toFixed(2)}`,
                      name === "revenue" ? "Revenue" : "Orders",
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data available for the selected time range
              </div>
            )}
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.totalOrders > 0
                  ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(
                      1,
                    )
                  : 0}
                %
              </div>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.totalOrders > 0
                  ? (
                      (stats.completedRevenue / stats.totalRevenue) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </div>
              <p className="text-sm text-gray-600">Revenue Realized</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats.completedOrders > 0
                  ? (stats.completedRevenue / stats.completedOrders).toFixed(2)
                  : 0}
              </div>
              <p className="text-sm text-gray-600">Avg Completed Order Value</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
