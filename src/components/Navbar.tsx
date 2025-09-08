"use client";

import { useSession } from "@/components/SessionProvider";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { user, logout, isLoading } = useSession();
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

  if (isLoading) {
    return (
      <nav className="bg-[#cfa349] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 onClick={handleMenu} className="text-white text-xl font-bold cursor-pointer hover:text-gray-300 transition-colors">TERRATECH</h1>
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
          <div className="flex items-center space-x-4">
            <h1 onClick={handleMenu} className="text-white text-xl font-bold cursor-pointer hover:text-gray-300 transition-colors">TERRATECH</h1>
            {user?.role === "admin" && (
              <>
                <div onClick={handleDashboard} className="text-white text-xl font-bold cursor-pointer underline hover:text-gray-300 transition-colors"> Dashboard</div>
                <div onClick={handleActivity} className="text-white text-xl font-bold cursor-pointer underline hover:text-gray-300 transition-colors"> Activity</div>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
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
