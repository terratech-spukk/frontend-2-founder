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
    router.push('/dashboard');
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
              <h1 onClick={handleMenu} className="text-white text-xl font-bold cursor-pointer hover:text-gray-300 transition-colors">TERRA</h1>
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
          {/* Logo and Menu - Mobile responsive */}
          <div className="flex items-center space-x-2 sm:space-x-5">
            <h1 onClick={handleMenu} className="text-white text-lg sm:text-xl font-bold cursor-pointer hover:text-gray-300 transition-colors">TERRA</h1>
            <h1 onClick={handleMenu} className="text-white text-lg sm:text-xl font-bold cursor-pointer hover:text-gray-300 transition-colors hidden sm:block">Menu</h1>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-5">
            {user?.role === "admin" && (
              <>
                <div onClick={handleDashboard} className="text-white text-lg font-bold cursor-pointer underline hover:text-gray-300 transition-colors">Order Dashboard</div>
                <div onClick={handleActivity} className="text-white text-lg font-bold cursor-pointer underline hover:text-gray-300 transition-colors">Booking Dashboard</div>
                <div onClick={handleFoodEdit} className="text-white text-lg font-bold cursor-pointer underline hover:text-gray-300 transition-colors">Food Edit</div>
              </>
            )}
            {user && (
              <div onClick={handleOrders} className="text-white text-lg font-bold cursor-pointer underline hover:text-gray-300 transition-colors">My Orders</div>
            )}
          </div>
          
          {/* Right side - Cart and User info */}
          <div className="flex items-center space-x-2 sm:space-x-4">
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
                className="w-5 h-5 sm:w-6 sm:h-6"
              />
              {cart.totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cart.totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => {
                  // Toggle mobile menu - you can implement this with state if needed
                  const mobileMenu = document.getElementById('mobile-menu');
                  if (mobileMenu) {
                    mobileMenu.classList.toggle('hidden');
                  }
                }}
                className="text-white p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* User info and actions - Responsive */}
            {user ? (
              <div className="hidden sm:flex items-center space-x-2">
                <div className="text-white">
                  <span className="font-medium text-sm sm:text-base">{user.id}</span>
                  <span className="text-xs sm:text-sm opacity-75 ml-1 sm:ml-2">
                    ({user.role})
                    {user.room_id && ` - Room ${user.room_id}`}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-white text-[#cfa349] px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm sm:text-base"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-white text-sm opacity-75">Not logged in</span>
                <button
                  onClick={() => router.push("/login")}
                  className="bg-white text-[#cfa349] px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm sm:text-base"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu - Hidden by default */}
        <div id="mobile-menu" className="hidden lg:hidden border-t border-white/20 py-4">
          <div className="flex flex-col space-y-3">
            <div onClick={handleMenu} className="text-white text-lg font-bold cursor-pointer hover:text-gray-300 transition-colors px-2 py-1">Menu</div>
            {user?.role === "admin" && (
              <>
                <div onClick={handleDashboard} className="text-white text-lg font-bold cursor-pointer underline hover:text-gray-300 transition-colors px-2 py-1">Order Dashboard</div>
                <div onClick={handleActivity} className="text-white text-lg font-bold cursor-pointer underline hover:text-gray-300 transition-colors px-2 py-1">Booking Dashboard</div>
                <div onClick={handleFoodEdit} className="text-white text-lg font-bold cursor-pointer underline hover:text-gray-300 transition-colors px-2 py-1">Food Edit</div>
              </>
            )}
            {user && (
              <div onClick={handleOrders} className="text-white text-lg font-bold cursor-pointer underline hover:text-gray-300 transition-colors px-2 py-1">My Orders</div>
            )}
            {user ? (
              <div className="px-2 py-1">
                <div className="text-white text-sm mb-2">
                  <span className="font-medium">{user.id}</span>
                  <span className="text-xs opacity-75 ml-1">
                    ({user.role})
                    {user.room_id && ` - Room ${user.room_id}`}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-white text-[#cfa349] px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm w-full"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-2 py-1">
                <span className="text-white text-sm opacity-75 block mb-2">Not logged in</span>
                <button
                  onClick={() => router.push("/login")}
                  className="bg-white text-[#cfa349] px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm w-full"
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
