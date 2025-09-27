import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createBooking } from "../../redux/slices/bookingSlice";
import { toast } from "react-toastify";
import dayjs from "dayjs";

export default function BookAppointment() {
  const { id: psychologistId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [reason, setReason] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [meetingMode, setMeetingMode] = useState("Chat");

  const handleBooking = async (e) => {
    e.preventDefault();

    // Validate date/time
    if (!dayjs(date).isValid()) return toast.error("Please select a valid date.");
    if (!timeSlot.includes("-")) return toast.error("Time slot must be in 'HH:mm - HH:mm' format.");

    // Restrict to future dates only
    if (dayjs(date).isBefore(dayjs(), "day")) {
      return toast.error("You cannot select a past date.");
    }

    const formData = { psychologistId, date, timeSlot, reason, anonymous, meetingMode };
    const resultAction = await dispatch(createBooking(formData));

    if (createBooking.fulfilled.match(resultAction)) {
      toast.success("Appointment booked successfully!");
      navigate("/student/bookings");
    } else {
      toast.error("Failed to book appointment.");
    }
  };

  const minDate = dayjs().format("YYYY-MM-DD"); // Disable past dates
  

  return (
    <div className="flex justify-center items-start min-h-screen px-4 py-6 sm:p-8 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-lg sm:max-w-xl p-6 sm:p-8 rounded-3xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-lg border border-white/30 dark:border-gray-700 shadow-xl">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
          Book an Appointment
        </h2>

        <form onSubmit={handleBooking} className="space-y-4 sm:space-y-5">
          {/* Date */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              min={minDate}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 text-sm sm:text-base"
            />
          </div>

          {/* Time Slot */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">Time Slot:</label>
            <input
              type="text"
              placeholder="HH:mm - HH:mm (24h or 12h)"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              required
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 text-sm sm:text-base"
            />
          </div>

          {/* Reason */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">Reason:</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 resize-none text-sm sm:text-base"
            />
          </div>

          {/* Meeting Mode */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">Meeting Mode:</label>
            <select
              value={meetingMode}
              onChange={(e) => setMeetingMode(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 text-sm sm:text-base"
            >
              <option value="Chat">Chat</option>
              <option value="Video">Video</option>
              <option value="In-Person">In-Person</option>
            </select>
          </div>

          {/* Anonymous Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            />
            <label className="text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">
              Book as Anonymous
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 sm:py-3.5 bg-blue-600 hover:bg-blue-700 transition text-white font-semibold rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          >
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
}
