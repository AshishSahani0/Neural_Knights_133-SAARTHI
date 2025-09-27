import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import dayjs from "dayjs";

export default function InPersonDetailsForm({ booking, onSubmit, onCancel }) {
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (booking) {
      setLocation(booking.meetingLocation || '');
      setNotes(booking.notes || '');
      // Trigger slide-up with bounce
      setTimeout(() => setIsVisible(true), 50);
    }
  }, [booking]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!location.trim()) {
      toast.error('Meeting location is required.');
      return;
    }
    onSubmit({ meetingLocation: location, notes });
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onCancel, 400); // allow bounce animation to finish
  };

  if (!booking) return null;

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4">
      <div className={`
        w-full max-w-md bg-white/30 dark:bg-gray-900/30 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-xl p-6 sm:p-8
        transform transition-transform duration-500
        ${isVisible ? 'animate-slideUpBounce' : 'translate-y-full'}
      `}>
        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 dark:text-white">In-Person Meeting Details</h3>

        <p className="mb-2 text-gray-700 dark:text-gray-300">
          For: <span className="font-semibold">{booking.anonymous ? 'Anonymous' : booking.student?.username}</span>
        </p>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          On: <span className="font-semibold">{dayjs(booking.date).format("DD/MM/YYYY")} at {booking.timeSlot}</span>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="location" className="block text-gray-800 dark:text-gray-200 font-semibold mb-2">
              Meeting Location <span className="text-red-500">*</span>
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Room 101, College Library"
              className="w-full p-3 rounded-xl border border-white/30 dark:border-gray-700/30 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/40 dark:bg-gray-800/40 text-gray-900 dark:text-white backdrop-blur-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-gray-800 dark:text-gray-200 font-semibold mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Please bring a notebook."
              rows="3"
              className="w-full p-3 rounded-xl border border-white/30 dark:border-gray-700/30 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/40 dark:bg-gray-800/40 text-gray-900 dark:text-white backdrop-blur-sm resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end mt-2">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded-xl hover:bg-gray-400 dark:hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
            >
              Save Details
            </button>
          </div>
        </form>
      </div>

      {/* Tailwind custom keyframes */}
      <style jsx>{`
        @keyframes slideUpBounce {
          0% { transform: translateY(100%); }
          60% { transform: translateY(-10%); }
          80% { transform: translateY(5%); }
          100% { transform: translateY(0); }
        }
        .animate-slideUpBounce {
          animation: slideUpBounce 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
