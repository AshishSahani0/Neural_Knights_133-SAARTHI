import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookings, updateBookingStatus, rescheduleBooking } from "../../redux/slices/bookingSlice";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import getSessionStatus from "../../utils/sessionStatus";
import RescheduleForm from "../../components/RescheduleForm";
import SkeletonDashboard from "../../components/SkeletonDashboard";

export default function AppointmentPage() {
  const dispatch = useDispatch();
  const { bookings, loading, error } = useSelector((state) => state.bookings);
  const [now, setNow] = useState(dayjs());
  const [filter, setFilter] = useState("Pending"); // default tab
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    dispatch(fetchBookings({ status: ["Pending", "Approved"], sort: "-createdAt" }));
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(() => setNow(dayjs()), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = (bookingId, status) => {
    dispatch(updateBookingStatus({ bookingId, status }))
      .unwrap()
      .then(() => toast.success(`Appointment ${status.toLowerCase()} successfully!`))
      .catch(() => toast.error(`Failed to ${status.toLowerCase()} appointment.`));
  };

  const handleRescheduleSubmit = async ({ newDate, newTimeSlot, newMeetingMode }) => {
    try {
      await dispatch(rescheduleBooking({ bookingId: selectedBooking._id, newDate, newTimeSlot, newMeetingMode })).unwrap();
      setShowRescheduleModal(false);
      setSelectedBooking(null);
      handleStatusUpdate(selectedBooking._id, "Approved");
      toast.success("Appointment rescheduled and approved.");
    } catch {
      toast.error("Failed to reschedule appointment.");
    }
  };

  const formatDate = (date) => dayjs(date).format("DD/MM/YYYY");

  // Filter bookings based on the selected tab
  const filteredBookings = bookings?.filter((booking) => {
    const session = getSessionStatus(booking, now);
    return session?.status === filter;
  }) || [];

  if (loading) return <SkeletonDashboard />;
  if (error) return <div className="text-center py-10 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center sm:justify-center">
        {["Pending", "Active", "Upcoming"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full font-semibold text-sm sm:text-base transition
              ${filter === status
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white/30 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300 backdrop-blur-md hover:bg-blue-500/50 hover:text-white"
              }
            `}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Booking Cards */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-10 text-gray-600 dark:text-gray-300">
          No {filter.toLowerCase()} sessions.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => {
            const session = getSessionStatus(booking, now);

            return (
              <div
                key={booking._id}
                className="p-6 rounded-3xl border border-white/20 dark:border-gray-700 backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 shadow-lg hover:shadow-2xl transition-all"
              >
                <div className="mb-4">
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    Student: {booking.anonymous ? "Anonymous" : booking.student?.username}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    Email: {booking.anonymous ? "N/A" : booking.student?.email}
                  </p>
                </div>

                <p className="text-sm sm:text-md text-gray-700 dark:text-gray-300">Date: {formatDate(booking.date)}</p>
                <p className="text-sm sm:text-md text-gray-700 dark:text-gray-300">Time: {booking.timeSlot}</p>
                <p className="text-sm sm:text-md text-gray-700 dark:text-gray-300">Reason: {booking.reason}</p>
                <p className="text-sm sm:text-md text-gray-700 dark:text-gray-300">Meeting Mode: {booking.meetingMode}</p>

                <span
                  className={`inline-block mt-2 px-3 py-1 text-xs sm:text-sm font-bold rounded-full text-white ${session.color}`}
                >
                  Status: {session.status}
                </span>

                {booking.status === "Pending" && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      onClick={() => handleStatusUpdate(booking._id, "Approved")}
                      className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm sm:text-base hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(booking._id, "Rejected")}
                      className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm sm:text-base hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowRescheduleModal(true);
                      }}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-xl text-sm sm:text-base hover:bg-yellow-600 transition"
                    >
                      Reschedule
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showRescheduleModal && (
        <RescheduleForm
          booking={selectedBooking}
          onSubmit={handleRescheduleSubmit}
          onCancel={() => setShowRescheduleModal(false)}
        />
      )}
    </div>
  );
}
