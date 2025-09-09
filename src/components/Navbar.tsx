"use client";

import { useSession } from "@/components/SessionProvider";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";

export function Navbar() {
  const { user, logout, isLoading } = useSession();
  const { cart } = useCart();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleMenu = () => {
    router.push('/menu');
  };

  const handleDashboard = () => {
    router.push('/dashboard');
  };

  const handleActivity = () => {
    router.push('/dashboard/activity');
  };

  const handleFoodEdit = () => {
    router.push('/admin/food-edit');
  };

  const handleOrders = () => {
    router.push('/orders');
  };

  const handleAdminOrders = () => {
    router.push('/admin/orders');
  };

  const handleCart = () => {
    router.push('/pay');
  };

  if (isLoading) {
    return (
      <nav className="bg-[#cfa349] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <h1 onClick={handleMenu} className="text-white text-xl font-bold cursor-pointer hover:text-gray-300 transition-colors">TERRATECH</h1>
              <h1 onClick={handleMenu} className="text-white text-xl font-bold cursor-pointer hover:text-gray-300 transition-colors">Menu</h1>
            </div>
            <div className="text-white">Loading...</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-[#cfa349] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-5">
            <h1 onClick={handleMenu} className="text-white text-xl font-bold cursor-pointer hover:text-gray-300 transition-colors">TERRATECH</h1>
            <h1 onClick={handleMenu} className="text-white text-xl font-bold cursor-pointer hover:text-gray-300 transition-colors">Menu</h1>
            {user?.role === "admin" && (
              <>
                <div onClick={handleDashboard} className="text-white text-xl font-bold cursor-pointer underline hover:text-gray-300 transition-colors"> Dashboard</div>
                <div onClick={handleActivity} className="text-white text-xl font-bold cursor-pointer underline hover:text-gray-300 transition-colors"> Activity</div>
                <div onClick={handleFoodEdit} className="text-white text-xl font-bold cursor-pointer underline hover:text-gray-300 transition-colors"> Food Edit</div>
                <div onClick={handleAdminOrders} className="text-white text-xl font-bold cursor-pointer underline hover:text-gray-300 transition-colors"> Orders</div>
              </>
            )}
            {user && (
              <div onClick={handleOrders} className="text-white text-xl font-bold cursor-pointer underline hover:text-gray-300 transition-colors"> My Orders</div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <button
              onClick={handleCart}
              className="relative bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
            >
              <Image 
                src="/cart/cart.png" 
                alt="Cart" 
                width={24} 
                height={24} 
                className="w-6 h-6"
              />
              {cart.totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cart.totalItems}
                </span>
              )}
            </button>

            {user ? (
              <>
                <div className="text-white">
                  <span className="font-medium">{user.id}</span>
                  <span className="text-sm opacity-75 ml-2">
                    ({user.role})
                    {user.room_id && ` - Room ${user.room_id}`}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-white text-[#cfa349] px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="text-white">
                <span className="text-sm opacity-75">Not logged in</span>
                <button
                  onClick={() => router.push("/login")}
                  className="bg-white text-[#cfa349] px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors ml-4"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
