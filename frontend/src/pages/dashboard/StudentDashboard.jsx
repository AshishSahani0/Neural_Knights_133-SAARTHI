import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SkeletonDashboard from "../../components/SkeletonDashboard";
import api from "../../api/api";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

// A simple card skeleton for the stats
const StatsCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md animate-pulse h-32 flex flex-col justify-center">
    <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
    <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-600 rounded"></div>
  </div>
);

export default function StudentDashboard() {
  // All floating button state has been moved to FloatingActions.jsx
  const [stats, setStats] = useState({
    completedSessions: 0,
    rejectedSessions: 0,
  });
  const [loading, setLoading] = useState(true);

  // Effect to fetch the student's session statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // API call to the new backend route
        const { data } = await api.get("/bookings/stats/student");
        setStats(data?.data || { completedSessions: 0, rejectedSessions: 0 });
      } catch (err) {
        console.error("Failed to fetch student stats:", err);
        setStats({ completedSessions: 0, rejectedSessions: 0 }); 
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <SkeletonDashboard />; // Render the skeleton screen while loading
  }

  return (
    <div className="relative space-y-6">
      {/* Main Dashboard Content */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          Student Dashboard
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          Welcome! Access wellness tools, book appointments, and explore resources.
        </p>
      </div>

      {/* Student Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            {/* Completed Sessions Card */}
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Completed Sessions
                </h3>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {stats.completedSessions}
                </p>
              </div>
              <CheckCircleIcon className="h-12 w-12 text-green-500 opacity-20" />
            </div>

            {/* Rejected/Cancelled Sessions Card */}
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Rejected/Cancelled Bookings
                </h3>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {stats.rejectedSessions}
                </p>
              </div>
              <XCircleIcon className="h-12 w-12 text-red-500 opacity-20" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}