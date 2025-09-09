"use client";

import { useState, useEffect, useMemo } from "react";
import { BookingHistory, RawBookingResponse } from "@/types/room";
import { api } from "@/lib/axios";
import { addToast } from "@heroui/react";

interface BookingListProps {
    onError?: (error: string) => void;
}

export function BookingList({ onError }: BookingListProps) {
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
            
            const bookingsData: RawBookingResponse[] = Array.isArray(response.data) ? response.data : response.data.bookings || [];
            
            if (bookingsData && bookingsData.length > 0) {
                const transformedBookings = bookingsData.map((booking: RawBookingResponse): BookingHistory => {
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
        } catch (error: unknown) {
            console.error('Error fetching bookings:', error);
            
            let errorMessage = 'Failed to load booking history. Please try again.';
            
            if (error && typeof error === 'object') {
                if ('response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
                    const responseData = error.response.data as { error?: string };
                    if (responseData?.error) {
                        errorMessage = responseData.error;
                    }
                } else if ('message' in error && typeof error.message === 'string') {
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
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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

    if (bookingsLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading bookings...</p>
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
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">All Bookings</h2>
                    <button
                        onClick={fetchBookings}
                        disabled={bookingsLoading}
                        className="px-4 py-2 bg-[#cfa349] text-white rounded-lg hover:bg-[#b8903e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {bookingsLoading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {/* Date Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={dateFilter.startDate}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cfa349] focus:border-transparent text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
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
                            Clear Filter
                        </button>
                    </div>
                </div>
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
    );
}
