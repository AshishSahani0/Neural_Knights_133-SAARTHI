// src/layout/DashboardLayout.jsx

import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import FloatingActions from "../components/FloatingActions"; // Ensure this path is correct

export default function DashboardLayout() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64 backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 border-l border-white/20 dark:border-gray-700 transition-all duration-300">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
      
      {/* Renders all floating actions (Crisis, Anonymous, Chatling) */}
      <FloatingActions />
    </div>
  );
}