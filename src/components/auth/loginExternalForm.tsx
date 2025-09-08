"use client";

export function LoginExternalForm() {
  
    return (
      <>
        <title>เข้าสู่ระบบ</title>
  
        {/* Background blur image */}
        <div className="fixed inset-0 -z-10 bg-center bg-no-repeat bg-cover blur-sm" />
  
        <div className="flex bg-[url('/bg_hotel.png')] bg-no-repeat bg-cover justify-center items-center h-screen">
          <div className="bg-[rgba(207,163,73,0.2)] backdrop-blur-md p-16 rounded-2xl shadow-xl text-white">
            <div className="text-white text-center w-[400px] max-w-[90vw]">
              <h2 className="text-yellow-400 text-2xl mb-3">TERRATECH</h2>
              <h1 className="text-4xl mb-2">Start Ordering</h1>
              <p className="text-lg mb-8">Scan to Use</p>
  
              <form id="loginForm">
                <input
                  type="text"
                  placeholder="Use room number"
                  id="roomNumber"
                  required
                  className="w-full px-4 py-4 mb-5 border-2 border-[rgba(199,167,103,0.8)] bg-[rgba(80,79,61,0.8)] rounded-lg text-white text-base placeholder:text-white/60 backdrop-blur-md outline-none"
                />

                <div className="w-[200px] h-[200px] bg-[rgba(80,79,61,0.8)] border-2 border-[rgba(199,167,103,0.8)] rounded-lg p-2 backdrop-blur-md flex justify-center items-center mx-auto mb-5">
                      <img
                        src="/messageImage_1757311093912.jpg"
                        alt="QR Code"
                        className="max-w-full max-h-[200px] object-contain rounded-md"
                      />
                </div>
  
                <button
                  type="submit"
                  className="w-full py-4 bg-[#cfa349] rounded-lg text-lg font-bold text-white hover:bg-[#b8903e] transition-colors"
                >
                  Start Ordering
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
  