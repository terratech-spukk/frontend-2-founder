"use client";

import { useSession } from "@/components/SessionProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HotelRoomManagement, BookingAnalytics, BookingList } from "@/components/dashboard";

export default function ActivityPage() {
    const { user, isLoading } = useSession();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const handleError = (errorMessage: string) => {
        setError(errorMessage);
    };

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

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">⚠️</div>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Booking Dashboard</h1>
            </div>

            {/* Hotel Room Management Section */}
            <div className="mb-8">
                <HotelRoomManagement onError={handleError} />
            </div>

            {/* Booking Analytics Section */}
            <div className="mb-8">
                <BookingAnalytics onError={handleError} />
            </div>

            {/* Booking List Section */}
            <div className="mb-8">
                <BookingList onError={handleError} />
            </div>
        </div>
    );
}