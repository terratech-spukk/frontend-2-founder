"use client";

import { useState } from "react";
import Image from "next/image";

export  function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => {
      setShowPassword(!showPassword);
    };
  
    return (
      <>
        <title>เข้าสู่ระบบ</title>
  
        {/* Background blur image */}
        <div className="fixed inset-0 -z-10 bg-center bg-no-repeat bg-cover blur-sm" />
  
        <div className="flex bg-[url('/bg_hotel.png')] bg-no-repeat bg-cover justify-center items-center h-screen">
          <div className="bg-[rgba(207,163,73,0.2)] backdrop-blur-md p-16 rounded-2xl shadow-xl text-white">
            <div className="text-white text-center w-[400px] max-w-[90vw]">
              <h2 className="text-yellow-400 text-2xl mb-3">TERRATECH</h2>
              <h1 className="text-4xl mb-2">Login</h1>
              <p className="text-lg mb-8">Use room number and hotel code</p>
  
              <form id="loginForm">
                <input
                  type="text"
                  placeholder="Use room number"
                  id="roomNumber"
                  required
                  className="w-full px-4 py-4 mb-5 border-2 border-[rgba(199,167,103,0.8)] bg-[rgba(80,79,61,0.8)] rounded-lg text-white text-base placeholder:text-white/60 backdrop-blur-md outline-none"
                />
  
                <div className="relative flex items-center py-5">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    id="password"
                    required
                    className="w-full px-4 py-4 pr-12 border-2 border-[rgba(199,167,103,0.8)] bg-[rgba(80,79,61,0.8)] rounded-lg text-white text-base placeholder:text-white/60 backdrop-blur-md outline-none"
                  />

                  {/* Eye off */}
                  {!showPassword && (
                    <Image
                      src="/hide.png"
                      alt="Eye Off"
                      width={24}
                      height={24}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                      onClick={togglePassword}
                  />
                  )}

                  {/* Eye on */}
                  {showPassword && (
                    <Image
                      src="/view.png"
                      alt="Eye On"
                      width={24}
                      height={24}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                      onClick={togglePassword}
                    />
                  )}
                </div>
  
                <button
                  type="submit"
                  className="w-full py-4 bg-[#cfa349] rounded-lg text-lg font-bold text-white hover:bg-[#b8903e] transition-colors"
                >
                  Login
                </button>
              </form>
  
              <div id="message" className="mt-4 font-bold"></div>
  
              {/* <a href="#" className="block mt-5 text-base text-white underline">
                HELP
              </a> */}
            </div>
          </div>
        </div>
      </>
    );
  }
  