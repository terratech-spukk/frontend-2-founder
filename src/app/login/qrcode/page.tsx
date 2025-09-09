"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/components/SessionProvider";

function AutoLoginContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useSession();

  // Get URL parameters
  const loginname = searchParams.get("loginname");
  const password = searchParams.get("password");

  // Auto-login if parameters are present
  useEffect(() => {
    if (loginname && password) {
      handleAutoLogin(loginname, password);
    }
  }, [loginname, password]);

  const handleAutoLogin = async (username: string, password: string) => {
    setIsAutoLoggingIn(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Use session context to store user data
        login(data.token, data.user);
        
        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        setError(data.error || "Auto-login failed");
        setIsAutoLoggingIn(false);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setIsAutoLoggingIn(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Use session context to store user data
        login(data.token, data.user);
        
        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <title>Auto Login - TERRATECH</title>

      {/* Background blur image */}
      <div className="fixed inset-0 -z-10 bg-center bg-no-repeat bg-cover blur-sm" />

      <div className="flex bg-[url('/bg_hotel.png')] bg-no-repeat bg-cover justify-center items-center h-screen">
        <div className="bg-[rgba(207,163,73,0.2)] backdrop-blur-md p-16 rounded-2xl shadow-xl text-white">
          <div className="text-white text-center w-[400px] max-w-[90vw]">
            <h2 className="text-yellow-400 text-2xl mb-3">TERRATECH</h2>
            <h1 className="text-4xl mb-2">Auto Login</h1>
            <p className="text-lg mb-8">Login with URL parameters or enter manually</p>

            {/* Auto-login status */}
            {isAutoLoggingIn && (
              <div className="mb-6 p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
                <p className="text-blue-200">Auto-logging in with provided credentials...</p>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 rounded-lg border border-red-400/30">
                <p className="text-red-200 font-bold">{error}</p>
              </div>
            )}

            {/* Manual Login Form */}
            <form onSubmit={handleManualLogin}>
              <input
                type="text"
                name="username"
                placeholder="Username"
                required
                className="w-full px-4 py-4 mb-5 border-2 border-[rgba(199,167,103,0.8)] bg-[rgba(80,79,61,0.8)] rounded-lg text-white text-base placeholder:text-white/60 backdrop-blur-md outline-none"
              />

              <div className="relative flex items-center py-5">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  className="w-full px-4 py-4 pr-12 border-2 border-[rgba(199,167,103,0.8)] bg-[rgba(80,79,61,0.8)] rounded-lg text-white text-base placeholder:text-white/60 backdrop-blur-md outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || isAutoLoggingIn}
                className="w-full py-4 bg-[#cfa349] rounded-lg text-lg font-bold text-white hover:bg-[#b8903e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* Instructions */}
            <div className="mt-6 text-sm text-gray-300 space-y-2">
              <p className="font-semibold">Auto Login URL Format:</p>
              <p className="text-xs break-all bg-gray-700/50 p-2 rounded">
                /login/qrcode?loginname=username&password=password
              </p>
            </div>

            {/* Back to regular login */}
            <div className="mt-6">
              <a 
                href="/login" 
                className="text-yellow-300 hover:text-yellow-200 underline text-sm"
              >
                ← Back to regular login
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AutoLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex bg-[url('/bg_hotel.png')] bg-no-repeat bg-cover justify-center items-center h-screen">
        <div className="bg-[rgba(207,163,73,0.2)] backdrop-blur-md p-16 rounded-2xl shadow-xl text-white">
          <div className="text-white text-center w-[400px] max-w-[90vw]">
            <h2 className="text-yellow-400 text-2xl mb-3">TERRATECH</h2>
            <h1 className="text-4xl mb-2">Loading...</h1>
            <p className="text-lg">Please wait while we load the login page...</p>
          </div>
        </div>
      </div>
    }>
      <AutoLoginContent />
    </Suspense>
  );
}
