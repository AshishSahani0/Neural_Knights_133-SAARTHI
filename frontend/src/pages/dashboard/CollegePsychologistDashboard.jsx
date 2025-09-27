import { useState, useEffect } from "react";

import ChatlingBot from "../../components/chatbot/ChatlingBot";
import api from "../../api/api";
import { CheckCircleIcon, XCircleIcon,ClockIcon  } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";



// A simple loading skeleton for the cards
const StatsCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md animate-pulse h-32 flex flex-col justify-center">
    <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
    <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-600 rounded"></div>
  </div>
);

export default function CollegePsychologistDashboard() {
  const [stats, setStats] = useState({
    completedSessions: 0,
    rejectedSessions: 0,
    pendingSessions: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/bookings/stats/psychologist");
        // Ensure data is always an object with the required properties
        setStats(data?.data || { completedSessions: 0, rejectedSessions: 0,pendingSessions:0 });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        toast.error("Failed to fetch session statistics.");
        // Set stats to a default value on error
        setStats({ completedSessions: 0, rejectedSessions: 0, pendingSessions:0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
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

            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Rejected Sessions
                </h3>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {stats.rejectedSessions}
                </p>
              </div>
              <XCircleIcon className="h-12 w-12 text-red-500 opacity-20" />
            </div>
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Pending Sessions
                </h3>
                <p className="mt-2 text-3xl font-bold text-yellow-600">
                  {stats.pendingSessions}
                </p>
              </div>
              <ClockIcon className="h-12 w-12 text-yellow-500 opacity-20" />
            </div>
          </>
        )}
      </div>

      {/* 💬 AI Chatbot */}
      <ChatlingBot />
    </div>
  );
}
