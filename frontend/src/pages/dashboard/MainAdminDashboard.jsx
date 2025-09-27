import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMainAdminData } from "../../redux/slices/mainAdminSlice";
import SkeletonDashboard from "../../components/SkeletonDashboard";

// Card component to display count
function StatCard({ title, count }) {
  return (
    <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-lg border border-white/30 dark:border-gray-700/30 shadow-lg rounded-2xl p-6 flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300 w-full">
      <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">{title}</h2>
      <p className="text-4xl font-bold text-gray-800 dark:text-white mt-2">{count}</p>
    </div>
  );
}

export default function MainAdminDashboard() {
  const dispatch = useDispatch();
  const { students, psychologists, institutes, loading, error } = useSelector(
    (state) => state.mainAdmin
  );

  useEffect(() => {
    dispatch(fetchMainAdminData());
  }, [dispatch]);

  if(loading){
    return <SkeletonDashboard/>
  }

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        Main Admin Overview
      </h1>

      

      {error && (
        <div className="bg-red-100/30 dark:bg-red-800/30 border border-red-400/50 text-red-700 dark:text-red-200 px-4 py-3 rounded-2xl relative mb-6 backdrop-blur-md">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-1">{error}</span>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <StatCard title="Institutes" count={institutes?.length || 0} />
          <StatCard title="Students" count={students?.length || 0} />
          <StatCard title="Psychologists" count={psychologists?.length || 0} />
        </div>
      )}
    </div>
  );
}
