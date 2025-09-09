"use client";

import { useOrderData } from './OrderDataProvider';

interface OrderOverviewProps {
    onError?: (error: string) => void;
}

interface OrderStats {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    cookingOrders: number;
    totalRevenue: number;
    completedRevenue: number;
    averageOrderValue: number;
}

export function OrderOverview({ onError }: OrderOverviewProps) {
    const { orders, loading, error, refetch } = useOrderData();

    const calculateStats = (): OrderStats => {
        const totalOrders = orders.length;
        const completedOrders = orders.filter(order => order.status === 'serve').length;
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        const cookingOrders = orders.filter(order => order.status === 'cooking').length;
        
        const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
        const completedRevenue = orders
            .filter(order => order.status === 'serve')
            .reduce((sum, order) => sum + order.total_amount, 0);
        
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return {
            totalOrders,
            completedOrders,
            pendingOrders,
            cookingOrders,
            totalRevenue,
            completedRevenue,
            averageOrderValue,
        };
    };


    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded"></div>
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

    const stats = calculateStats();

    const statCards = [
        {
            title: 'Total Orders',
            value: stats.totalOrders,
            icon: '📋',
            color: 'bg-blue-50 text-blue-600',
            bgColor: 'bg-blue-500',
        },
        {
            title: 'Completed Orders',
            value: stats.completedOrders,
            icon: '✅',
            color: 'bg-green-50 text-green-600',
            bgColor: 'bg-green-500',
        },
        {
            title: 'Pending Orders',
            value: stats.pendingOrders,
            icon: '⏳',
            color: 'bg-yellow-50 text-yellow-600',
            bgColor: 'bg-yellow-500',
        },
        {
            title: 'Cooking Orders',
            value: stats.cookingOrders,
            icon: '👨‍🍳',
            color: 'bg-orange-50 text-orange-600',
            bgColor: 'bg-orange-500',
        },
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Order Overview</h2>
                <p className="text-gray-600 text-sm">Key metrics and statistics for all orders</p>
            </div>

            <div className="p-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {statCards.map((card, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                                </div>
                                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-2xl`}>
                                    {card.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Revenue Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Total Revenue</p>
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
                                <p className="text-sm font-medium text-blue-600">Completed Revenue</p>
                                <p className="text-2xl font-bold text-blue-900">
                                    ฿{stats.completedRevenue.toFixed(2)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                                🎯
                            </div>
                        </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600">Average Order Value</p>
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

                {/* Completion Rate */}
                <div className="mt-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">Order Completion Rate</h3>
                            <span className="text-2xl font-bold text-gray-900">
                                {stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                    width: `${stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0}%` 
                                }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            {stats.completedOrders} of {stats.totalOrders} orders completed
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
