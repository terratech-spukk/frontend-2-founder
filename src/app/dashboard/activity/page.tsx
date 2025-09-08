"use client";

import { useSession } from "@/components/SessionProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { BookingHistory } from "@/types/room";
import { api } from "@/lib/axios";
import { addToast } from "@heroui/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

export default function ActivityPage() {
    const { user, isLoading } = useSession();
    const router = useRouter();
    const [bookings, setBookings] = useState<BookingHistory[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [bookingsError, setBookingsError] = useState<string | null>(null);
    const [dateFilter, setDateFilter] = useState<{
        startDate: string;
        endDate: string;
    }>({
        startDate: '',
        endDate: ''
    });

    // Fetch booking history from API
    const fetchBookings = async () => {
        setBookingsLoading(true);
        setBookingsError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await api.get('/hotel-bookings', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Fetched bookings data:', response.data);
            
            // Handle both direct array response and wrapped response
            const bookingsData = Array.isArray(response.data) ? response.data : response.data.bookings || [];
            
            if (bookingsData && bookingsData.length > 0) {
                // Transform the booking data to include status
                const transformedBookings = bookingsData.map((booking: any) => {
                    let status: "reserved" | "checked_in" | "checked_out" | "cancelled" = "reserved";
                    
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
                        status
                    };
                });
                
                setBookings(transformedBookings);
            } else {
                setBookings([]);
            }
        } catch (error: any) {
            console.error('Error fetching bookings:', error);
            const errorMessage = error?.response?.data?.error || error?.message || 'Failed to load booking history. Please try again.';
            setBookingsError(errorMessage);
            
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

    useEffect(() => {
        if (!isLoading) {
            // If user is not logged in, redirect to login
            if (!user) {
                router.push("/login");
                return;
            }
            
            // If user is not admin, redirect to menu
            if (user.role !== "admin") {
                router.push("/menu");
                return;
            }
        }
    }, [user, isLoading, router]);

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
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate total income from checked-out guests only
    const totalIncome = bookings
        .filter(booking => booking.status === "checked_out")
        .reduce((total, booking) => total + booking.price, 0);

    // Calculate expected income from reserved and checked-in guests
    const expectedIncome = bookings
        .filter(booking => booking.status === "reserved" || booking.status === "checked_in")
        .reduce((total, booking) => total + booking.price, 0);

    // Filter bookings by date range
    const filteredBookings = useMemo(() => {
        if (!dateFilter.startDate && !dateFilter.endDate) {
            return bookings;
        }
        
        return bookings.filter(booking => {
            const bookingDate = new Date(booking.unreserve_at || booking.reserve_at);
            const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : new Date('1900-01-01');
            const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : new Date('2100-12-31');
            
            return bookingDate >= startDate && bookingDate <= endDate;
        });
    }, [bookings, dateFilter]);

    // Prepare chart data for income over time (by checkout date)
    const chartData = useMemo(() => {
        const checkedOutBookings = filteredBookings.filter(booking => booking.status === "checked_out");
        
        // Group by date
        const groupedData = checkedOutBookings.reduce((acc, booking) => {
            const date = new Date(booking.unreserve_at!).toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { date, income: 0, count: 0 };
            }
            acc[date].income += booking.price;
            acc[date].count += 1;
            return acc;
        }, {} as Record<string, { date: string; income: number; count: number }>);

        // Convert to array and sort by date
        return Object.values(groupedData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [filteredBookings]);

    // Prepare status distribution data for pie chart
    const statusData = useMemo(() => {
        const statusCounts = filteredBookings.reduce((acc, booking) => {
            acc[booking.status] = (acc[booking.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const colors = {
            reserved: '#fbbf24', // yellow
            checked_in: '#10b981', // green
            checked_out: '#3b82f6', // blue
            cancelled: '#ef4444' // red
        };

        return Object.entries(statusCounts).map(([status, count]) => ({
            name: getStatusText(status),
            value: count,
            color: colors[status as keyof typeof colors] || '#6b7280'
        }));
    }, [filteredBookings]);

    // Prepare room occupancy data
    const roomData = useMemo((): { room: string; bookings: number; revenue: number }[] => {
        const roomCounts = filteredBookings.reduce((acc, booking) => {
            const roomNum = booking.room_number.toString();
            if (!acc[roomNum]) {
                acc[roomNum] = { room: `Room ${roomNum}`, bookings: 0, revenue: 0 };
            }
            acc[roomNum].bookings += 1;
            acc[roomNum].revenue += booking.price;
            return acc;
        }, {} as Record<string, { room: string; bookings: number; revenue: number }>);

        return Object.values(roomCounts).sort((a, b) => b.revenue - a.revenue);
    }, [filteredBookings]);

    // Prepare timeline data for reservation flow
    const timelineData = useMemo(() => {
        return filteredBookings
            .filter(booking => booking.reserve_at && booking.price) // Filter out invalid data
            .map(booking => {
                const reserveDate = new Date(booking.reserve_at);
                const checkinDate = booking.checkin_at ? new Date(booking.checkin_at) : null;
                const unreserveDate = booking.unreserve_at ? new Date(booking.unreserve_at) : null;
                
                return {
                    room: `Room ${booking.room_number}`,
                    name: booking.reserve_name || 'Unknown',
                    reserveDate: reserveDate.toISOString().split('T')[0],
                    checkinDate: checkinDate?.toISOString().split('T')[0] || null,
                    unreserveDate: unreserveDate?.toISOString().split('T')[0] || null,
                    status: booking.status,
                    price: Number(booking.price) || 0,
                    duration: checkinDate && unreserveDate ? 
                        Math.ceil((unreserveDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
                };
            })
            .sort((a, b) => new Date(b.reserveDate).getTime() - new Date(a.reserveDate).getTime());
    }, [filteredBookings]);

    // Calculate filtered totals
    const filteredTotalIncome = filteredBookings
        .filter(booking => booking.status === "checked_out")
        .reduce((total, booking) => total + booking.price, 0);

    const filteredExpectedIncome = filteredBookings
        .filter(booking => booking.status === "reserved" || booking.status === "checked_in")
        .reduce((total, booking) => total + booking.price, 0);

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    // If user is not logged in or not admin, don't render content
    if (!user || user.role !== "admin") {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Booking Activity</h1>
                <button
                    onClick={fetchBookings}
                    disabled={bookingsLoading}
                    className="px-4 py-2 bg-[#cfa349] text-white rounded-lg hover:bg-[#b8903e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {bookingsLoading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Booking History Overview</h2>
                <p className="text-gray-600">View all hotel booking activities and their current status.</p>
                
                {/* Income Sections */}
                <div className="mt-6 mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Total Income Section */}
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">รายได้ทั้งหมด (จากลูกค้าที่เช็คเอาท์แล้ว)</h3>
                                <p className="text-sm text-gray-600">รายได้จากการเช็คเอาท์แล้วเท่านั้น</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-green-600">
                                    ฿{filteredTotalIncome.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600">
                                    มีลูกค้าใช้บริการแล้ว {filteredBookings.filter(b => b.status === "checked_out").length} ครั้ง
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Expected Income Section */}
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">รายได้ที่คาดหวัง (จากลูกค้าที่จองและลูกค้าเช็คอินแล้ว)</h3>
                                <p className="text-sm text-gray-600">รายได้จากลูกค้าที่ยังไม่ได้เช็คเอาท์</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-yellow-600">
                                    ฿{filteredExpectedIncome.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600">
                                    มีลูกค้าคงค้าง {filteredBookings.filter(b => b.status === "reserved" || b.status === "checked_in").length} คน
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                            {filteredBookings.filter(b => b.status === "reserved").length}
                        </div>
                        <div className="text-sm text-yellow-700">Reserved</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            {filteredBookings.filter(b => b.status === "checked_in").length}
                        </div>
                        <div className="text-sm text-green-700">Checked In</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                            {filteredBookings.filter(b => b.status === "checked_out").length}
                        </div>
                        <div className="text-sm text-blue-700">Checked Out</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                            {filteredBookings.filter(b => b.status === "cancelled").length}
                        </div>
                        <div className="text-sm text-red-700">Cancelled</div>
                    </div>
                </div>
            </div>

            {/* Income Chart Section */}
            {chartData.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                        <h2 className="text-xl font-semibold mb-4 lg:mb-0">กราฟรายได้ตามเวลา (จากลูกค้าที่เช็คเอาท์แล้ว)</h2>
                        
                        {/* Chart Date Filter Controls */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">เริ่มต้น</label>
                                <input
                                    type="date"
                                    value={dateFilter.startDate}
                                    onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cfa349] focus:border-transparent text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">สิ้นสุด</label>
                                <input
                                    type="date"
                                    value={dateFilter.endDate}
                                    onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cfa349] focus:border-transparent text-sm"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => setDateFilter({ startDate: '', endDate: '' })}
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
                                    tickFormatter={(value) => new Date(value).toLocaleDateString('th-TH')}
                                />
                                <YAxis 
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => `฿${value.toLocaleString()}`}
                                />
                                <Tooltip 
                                    formatter={(value: number, name: string) => [
                                        `฿${value.toLocaleString()}`, 
                                        name === 'income' ? 'รายได้' : 'จำนวน'
                                    ]}
                                    labelFormatter={(label) => `วันที่: ${new Date(label).toLocaleDateString('th-TH')}`}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="income" 
                                    stroke="#10b981" 
                                    strokeWidth={3}
                                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    
                    {/* Additional Bar Chart for better visualization */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4">รายได้รายวัน (Bar Chart)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="date" 
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) => new Date(value).toLocaleDateString('th-TH')}
                                    />
                                    <YAxis 
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) => `฿${value.toLocaleString()}`}
                                    />
                                    <Tooltip 
                                        formatter={(value: number, name: string) => [
                                            `฿${value.toLocaleString()}`, 
                                            name === 'income' ? 'รายได้' : 'จำนวน'
                                        ]}
                                        labelFormatter={(label) => `วันที่: ${new Date(label).toLocaleDateString('th-TH')}`}
                                    />
                                    <Bar 
                                        dataKey="income" 
                                        fill="#10b981"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Key Insights Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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

            {/* Additional Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-8">
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
                                        label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => [`${value} การจอง`, 'จำนวน']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            {/* Timeline Chart Fallback */}
            {timelineData.length === 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h3 className="text-lg font-semibold mb-4">Timeline การจอง</h3>
                    <div className="text-center py-8 text-gray-500">
                        ไม่มีข้อมูลการจองที่ถูกต้องสำหรับแสดง Timeline
                    </div>
                </div>
            )}

            {/* Bookings List */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold">All Bookings</h2>
                </div>

                {bookingsError && (
                    <div className="p-6">
                        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                            {bookingsError}
                        </div>
                    </div>
                )}

                {bookingsLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-lg text-gray-600">Loading bookings...</div>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">
                            {dateFilter.startDate || dateFilter.endDate 
                                ? "No bookings found for the selected date range" 
                                : "No booking history found"
                            }
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ห้อง
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ชื่อผู้จอง
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        สถานะ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        จองเมื่อ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        เช็คอินเมื่อ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ออกเมื่อ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ราคา
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                ห้อง {booking.room_number}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{booking.reserve_name}</div>
                                            {/* <div className="text-sm text-gray-500">{booking.reserve_by}</div> */}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                {getStatusText(booking.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(booking.reserve_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {booking.checkin_at ? formatDate(booking.checkin_at) : "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {booking.unreserve_at ? formatDate(booking.unreserve_at) : "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ฿{booking.price}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
