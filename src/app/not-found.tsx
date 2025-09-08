'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const NotFoundPage: React.FC = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Blurred Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/bg_hotel.png')",
          filter: 'blur(3px)',
          transform: 'scale(1.1)',
        }}
      />
      
      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* Main Container with Glass Effect */}
          <div 
            className="rounded-2xl p-12 border-2 shadow-2xl"
            style={{
              backdropFilter: 'blur(10px)',
              background: 'rgba(0, 0, 0, 0.3)',
              borderColor: 'rgba(199, 167, 103, 0.8)',
            }}
          >
            {/* 404 Large Number */}
            <div className="text-yellow-400 text-9xl md:text-[12rem] font-bold leading-none mb-4 opacity-90 animate-fade-in-up">
              404
            </div>
            
            {/* Main Message */}
            <h1 className="text-yellow-400 text-4xl md:text-5xl font-elegant mb-6 tracking-wide animate-fade-in-up-delay-2">
              Oh no, page not found!
            </h1>
            
            {/* Decorative Line */}
            <div 
              className="w-32 h-0.5 mx-auto mb-10 opacity-60 animate-fade-in-up-delay-3"
              style={{ backgroundColor: 'rgba(199, 167, 103, 0.8)' }}
            />
            
            {/* Go Back Button */}
            <button 
              onClick={handleGoBack}
              className="inline-flex items-center px-8 py-4 text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl animate-fade-in-up-delay-4"
              style={{ backgroundColor: 'rgba(199, 167, 103, 0.8)' }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Return to Homepage
            </button>
            
          </div>
          
          {/* Floating Decorative Elements */}
          <div 
            className="absolute top-10 left-10 w-20 h-20 border-2 rounded-full opacity-20 animate-pulse"
            style={{ borderColor: 'rgba(199, 167, 103, 0.8)' }}
          />
          <div 
            className="absolute bottom-10 right-10 w-16 h-16 border-2 rounded-full opacity-20 animate-pulse"
            style={{ borderColor: 'rgba(199, 167, 103, 0.8)', animationDelay: '1s' }}
          />
          <div 
            className="absolute top-1/2 left-5 w-12 h-12 border-2 rounded-full opacity-15 animate-pulse"
            style={{ borderColor: 'rgba(199, 167, 103, 0.8)', animationDelay: '2s' }}
          />
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;700&display=swap');
        
        .font-elegant {
          font-family: 'Playfair Display', serif;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }
        
        .animate-fade-in-up-delay-1 {
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }
        
        .animate-fade-in-up-delay-2 {
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }
        
        .animate-fade-in-up-delay-3 {
          animation: fadeInUp 0.8s ease-out 0.6s both;
        }
        
        .animate-fade-in-up-delay-4 {
          animation: fadeInUp 0.8s ease-out 0.8s both;
        }
        
      `}</style>
    </div>
  );
};

export default NotFoundPage;