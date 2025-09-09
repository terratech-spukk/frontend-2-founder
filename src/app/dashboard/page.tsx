"use client";

import { useSession } from "@/components/SessionProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  OrderManagement,
  OrderOverview,
  IncomeAnalytics,
  PopularMenuAnalytics,
  OrderDataProvider,
} from "@/components/dashboard";

export default function DashboardPage() {
  const { user, isLoading } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (!isLoading && user) {
      // Check if user is admin
      if (user.role !== "admin") {
        router.push("/menu");
        return;
      }
    }
  }, [isLoading, user, router]);

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <OrderDataProvider onError={handleError}>
          {/* Order Overview */}
          <div className="mb-8">
            <OrderOverview onError={handleError} />
          </div>

          {/* Income Analytics */}
          <div className="mb-8">
            <IncomeAnalytics onError={handleError} />
          </div>

          {/* Popular Menu Analytics */}
          <div className="mb-8">
            <PopularMenuAnalytics onError={handleError} />
          </div>

          {/* Order Management */}
          <div className="mb-8">
            <OrderManagement onError={handleError} />
          </div>
        </OrderDataProvider>
      </div>
    </div>
  );
}
