"use client";

import { useSession } from "@/components/SessionProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
    const { user, isLoading } = useSession();
    const router = useRouter();

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

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Welcome, {user.id}!</h2>
                <p className="text-gray-600">You have admin access to the dashboard.</p>
                <div className="mt-4">
                    <p><strong>Role:</strong> {user.role}</p>
                    {user.room_id && <p><strong>Room ID:</strong> {user.room_id}</p>}
                </div>
            </div>
        </div>
    );
}