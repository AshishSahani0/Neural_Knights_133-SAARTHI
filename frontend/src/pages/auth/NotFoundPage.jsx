import React from 'react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-700">
      <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
      <p className="text-lg">Page Not Found</p>
      <p className="mt-2 text-md">The page you are looking for does not exist.</p>
    </div>
  );
}