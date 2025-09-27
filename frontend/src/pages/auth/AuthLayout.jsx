import React from "react";

export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4 bg-gray-100">
      {/* Animated gradient background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300 animate-gradient-background"></div>

      {/* Floating particles */}
      <div className="absolute inset-0 z-10">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/30 rounded-full blur-xl animate-float-slow"
            style={{
              width: `${Math.random() * 30 + 10}px`,
              height: `${Math.random() * 30 + 10}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 20 + 10}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Glassmorphic card */}
      <div className="relative w-full max-w-md bg-white/40 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 z-20 transform transition-transform hover:scale-105">
        {children}
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes float-slow {
            0%,100% { transform: translateY(0px) translateX(0px); }
            50% { transform: translateY(-20px) translateX(10px); }
          }
          .animate-float-slow { animation: float-slow linear infinite; }

          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient-background {
            background: linear-gradient(270deg, #93c5fd, #d8b4fe, #fbcfe8);
            background-size: 600% 600%;
            animation: gradientShift 15s ease infinite;
          }
        `}
      </style>
    </div>
  );
}
