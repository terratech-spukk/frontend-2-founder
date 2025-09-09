"use client";

import { useState, useEffect, useMemo } from "react";
import { BookingHistory, RawBookingResponse } from "@/types/room";
import { api } from "@/lib/axios";
import { addToast } from "@heroui/react";
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface BookingAnalyticsProps {
  onError?: (error: string) => void;
}

export function BookingAnalytics({ onError }: BookingAnalyticsProps) {
  const [bookings, setBookings] = useState<BookingHistory[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: "",
    endDate: "",
  });

  // Fetch booking history from API
  const fetchBookings = async () => {
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/hotel-bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // console.log('Fetched bookings data:', response.data);

      const bookingsData: RawBookingResponse[] = Array.isArray(response.data)
        ? response.data
        : response.data.bookings || [];

      if (bookingsData && bookingsData.length > 0) {
        const transformedBookings = bookingsData.map(
          (booking: RawBookingResponse): BookingHistory => {
            let status:
              | "reserved"
              | "checked_in"
              | "checked_out"
              | "cancelled" = "reserved";

            if (booking.unreserve_at) {
              if (booking.unreserve_cause === "checkout") {
                status = "checked_out";
              } else {
                status = "cancelled";
              }
            } else if (booking.checkin_at) {
              status = "checked_in";
            }

            return {
              ...booking,
              status,
            };
          },
        );

        setBookings(transformedBookings);
      } else {
        setBookings([]);
      }
    } catch (error: unknown) {
      console.error("Error fetching bookings:", error);

      let errorMessage = "Failed to load booking history. Please try again.";

      if (error && typeof error === "object") {
        if (
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "data" in error.response
        ) {
          const responseData = error.response.data as { error?: string };
          if (responseData?.error) {
            errorMessage = responseData.error;
          }
        } else if ("message" in error && typeof error.message === "string") {
          errorMessage = error.message;
        }
      }
      setBookingsError(errorMessage);
      onError?.(errorMessage);

      addToast({
        title: "Loading Failed",
        description: errorMessage,
        color: "danger",
        timeout: 4000,
      });
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "reserved":
        return "bg-yellow-100 text-yellow-800";
      case "checked_in":
        return "bg-green-100 text-green-800";
      case "checked_out":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "reserved":
        return "Reserved";
      case "checked_in":
        return "Checked In";
      case "checked_out":
        return "Checked Out";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter bookings by date range
  const filteredBookings = useMemo(() => {
    if (!dateFilter.startDate && !dateFilter.endDate) {
      return bookings;
    }

    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.unreserve_at || booking.reserve_at);
      const startDate = dateFilter.startDate
        ? new Date(dateFilter.startDate)
        : new Date("1900-01-01");
      const endDate = dateFilter.endDate
        ? new Date(dateFilter.endDate)
        : new Date("2100-12-31");

      return bookingDate >= startDate && bookingDate <= endDate;
    });
  }, [bookings, dateFilter]);

  // Prepare chart data for income over time (by checkout date)
  const chartData = useMemo(() => {
    const checkedOutBookings = filteredBookings.filter(
      (booking) => booking.status === "checked_out",
    );

    const groupedData = checkedOutBookings.reduce(
      (acc, booking) => {
        const date = new Date(booking.unreserve_at!)
          .toISOString()
          .split("T")[0];
        if (!acc[date]) {
          acc[date] = { date, income: 0, count: 0 };
        }
        acc[date].income += booking.price;
        acc[date].count += 1;
        return acc;
      },
      {} as Record<string, { date: string; income: number; count: number }>,
    );

    return Object.values(groupedData).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [filteredBookings]);

  // Prepare status distribution data for pie chart
  const statusData = useMemo(() => {
    const statusCounts = filteredBookings.reduce(
      (acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const colors = {
      reserved: "#fbbf24", // yellow
      checked_in: "#10b981", // green
      checked_out: "#3b82f6", // blue
      cancelled: "#ef4444", // red
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: getStatusText(status),
      value: count,
      color: colors[status as keyof typeof colors] || "#6b7280",
    }));
  }, [filteredBookings]);

  // Prepare room occupancy data
  const roomData = useMemo((): {
    room: string;
    bookings: number;
    revenue: number;
  }[] => {
    const roomCounts = filteredBookings.reduce(
      (acc, booking) => {
        const roomNum = booking.room_number.toString();
        if (!acc[roomNum]) {
          acc[roomNum] = { room: `Room ${roomNum}`, bookings: 0, revenue: 0 };
        }
        acc[roomNum].bookings += 1;
        acc[roomNum].revenue += booking.price;
        return acc;
      },
      {} as Record<string, { room: string; bookings: number; revenue: number }>,
    );

    return Object.values(roomCounts).sort((a, b) => b.revenue - a.revenue);
  }, [filteredBookings]);

  // Calculate filtered totals
  const filteredTotalIncome = filteredBookings
    .filter(
      (booking) =>
        booking.status === "checked_out" || booking.status === "checked_in",
    )
    .reduce((total, booking) => total + booking.price, 0);

  const filteredExpectedIncome = filteredBookings
    .filter((booking) => booking.status === "reserved")
    .reduce((total, booking) => total + booking.price, 0);

  if (bookingsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking analytics...</p>
        </div>
      </div>
    );
  }

  if (bookingsError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-xl mb-4">⚠️</div>
        <p className="text-red-600 mb-4">{bookingsError}</p>
        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Booking History Overview</h2>
        <p className="text-gray-600">
          View all hotel booking activities and their current status.
        </p>

        {/* Income Sections */}
        <div className="mt-6 mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Total Income Section */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  รายได้ทั้งหมด (จากลูกค้าที่เช็คเอาท์แล้ว)
                </h3>
                <p className="text-sm text-gray-600">
                  รายได้จากการเช็คเอาท์แล้วเท่านั้น
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  ฿{filteredTotalIncome.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  มีลูกค้าใช้บริการแล้ว{" "}
                  {
                    filteredBookings.filter((b) => b.status === "checked_out")
                      .length
                  }{" "}
                  ครั้ง
                </div>
              </div>
            </div>
          </div>

          {/* Expected Income Section */}
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  รายได้ที่คาดหวัง (จากลูกค้าที่จองและลูกค้าเช็คอินแล้ว)
                </h3>
                <p className="text-sm text-gray-600">
                  รายได้จากลูกค้าที่ยังไม่ได้เช็คเอาท์
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-yellow-600">
                  ฿{filteredExpectedIncome.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  มีลูกค้าคงค้าง{" "}
                  {
                    filteredBookings.filter(
                      (b) =>
                        b.status === "reserved" || b.status === "checked_in",
                    ).length
                  }{" "}
                  คน
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredBookings.filter((b) => b.status === "reserved").length}
            </div>
            <div className="text-sm text-yellow-700">Reserved</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {filteredBookings.filter((b) => b.status === "checked_in").length}
            </div>
            <div className="text-sm text-green-700">Checked In</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {
                filteredBookings.filter((b) => b.status === "checked_out")
                  .length
              }
            </div>
            <div className="text-sm text-blue-700">Checked Out</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {filteredBookings.filter((b) => b.status === "cancelled").length}
            </div>
            <div className="text-sm text-red-700">Cancelled</div>
          </div>
        </div>
      </div>

      {/* Income Chart Section */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
            <h2 className="text-xl font-semibold mb-4 lg:mb-0">
              กราฟรายได้ตามเวลา (จากลูกค้าที่เช็คเอาท์แล้ว)
            </h2>

            {/* Chart Date Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เริ่มต้น
                </label>
                <input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) =>
                    setDateFilter((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cfa349] focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  สิ้นสุด
                </label>
                <input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) =>
                    setDateFilter((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cfa349] focus:border-transparent text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setDateFilter({ startDate: "", endDate: "" })}
                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  ล้าง
                </button>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("th-TH")
                  }
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `฿${value.toLocaleString()}`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `฿${value.toLocaleString()}`,
                    name === "income" ? "รายได้" : "จำนวน",
                  ]}
                  labelFormatter={(label) =>
                    `วันที่: ${new Date(label).toLocaleDateString("th-TH")}`
                  }
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Additional Bar Chart for better visualization */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">
              รายได้รายวัน (Bar Chart)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("th-TH")
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `฿${value.toLocaleString()}`}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `฿${value.toLocaleString()}`,
                      name === "income" ? "รายได้" : "จำนวน",
                    ]}
                    labelFormatter={(label) =>
                      `วันที่: ${new Date(label).toLocaleDateString("th-TH")}`
                    }
                  />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Key Insights Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">📊 สรุปข้อมูลสำคัญ</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {filteredBookings.length}
            </div>
            <div className="text-sm text-blue-700">การจองทั้งหมด</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {roomData.length}
            </div>
            <div className="text-sm text-green-700">ห้องที่มีการเข้าพัก</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              ฿{filteredTotalIncome.toLocaleString()}
            </div>
            <div className="text-sm text-purple-700">รายได้รวม</div>
          </div>
        </div>
      </div>

      {/* Status Distribution Pie Chart */}
      {statusData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">การกระจายสถานะการจอง</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${percent ? (percent * 100).toFixed(0) : "0"}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} การจอง`, "จำนวน"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
