import React from 'react';

export default function SkeletonDashboard() {
  return (
    <div className="p-6 animate-pulse">
      {/* Header Section Skeleton */}
      <div className="flex items-center space-x-4">
        <div className="h-10 w-48 bg-gray-300 rounded"></div>
        <div className="h-6 w-96 bg-gray-200 rounded"></div>
      </div>
      
      {/* Booking Button Skeleton */}
      <div className="mt-6 h-10 w-40 bg-blue-200 rounded"></div>

      {/* Main Content Skeleton */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card Skeletons */}
        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md h-40">
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-600 rounded"></div>
        </div>
        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md h-40">
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-600 rounded"></div>
        </div>
        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md h-40">
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    </div>
  );
}