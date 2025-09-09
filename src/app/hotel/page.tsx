import HotelListPage from "@/components/hotel/hotelList";
import { OrderOverview, IncomeAnalytics, PopularMenuAnalytics, OrderDataProvider } from "@/components/dashboard";

export default function HotelPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <OrderDataProvider>
          {/* Order Overview */}
          <div className="mb-8">
            <OrderOverview />
          </div>

          {/* Income Analytics */}
          <div className="mb-8">
            <IncomeAnalytics />
          </div>

          {/* Popular Menu Analytics */}
          <div className="mb-8">
            <PopularMenuAnalytics />
          </div>

          {/* Hotel List */}
          <div className="mb-8">
            <HotelListPage />
          </div>
        </OrderDataProvider>
      </div>
    </div>
  );
}