import React, { useState } from 'react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

export default function RescheduleForm({ booking, onSubmit, onCancel }) {
  const [newDate, setNewDate] = useState(dayjs(booking.date).format('YYYY-MM-DD'));
  const [newTimeSlot, setNewTimeSlot] = useState(booking.timeSlot);
  const [newMeetingMode, setNewMeetingMode] = useState(booking.meetingMode);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newDate || !newTimeSlot) {
      toast.error("Date and time slot are required.");
      return;
    }
    onSubmit({ newDate, newTimeSlot, newMeetingMode });
  };

  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-white/20 dark:bg-gray-800/30 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 transform transition-all duration-300">
        <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800 dark:text-white text-center">
          Reschedule Appointment
        </h3>
        <p className="mb-6 text-gray-700 dark:text-gray-200 text-center">
          With: <span className="font-semibold">{booking.anonymous ? 'Anonymous' : booking.student?.username}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* New Date */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm sm:text-base">
              New Date
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/30 dark:bg-gray-700/30 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>

          {/* New Time Slot */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm sm:text-base">
              New Time Slot
            </label>
            <input
              type="text"
              placeholder="e.g., 10:00 - 11:00"
              value={newTimeSlot}
              onChange={(e) => setNewTimeSlot(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/30 dark:bg-gray-700/30 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>

          {/* Meeting Mode */}
          <div>
            <label className="block mb-2 text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">
              Meeting Mode
            </label>
            <select
              value={newMeetingMode}
              onChange={(e) => setNewMeetingMode(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/30 dark:bg-gray-700/30 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-sm sm:text-base"
            >
              <option value="Chat">Chat</option>
              <option value="Video">Video</option>
              <option value="In-Person">In-Person</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-4 py-2 rounded-xl hover:bg-gray-400 dark:hover:bg-gray-500 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto bg-yellow-600 text-white px-4 py-2 rounded-xl hover:bg-yellow-700 transition"
            >
              Confirm Reschedule
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
