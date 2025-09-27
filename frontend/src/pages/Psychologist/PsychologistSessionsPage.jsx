import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookings, updateBookingStatus, rescheduleBooking, sendNotification } from "../../redux/slices/bookingSlice";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import getSessionStatus from "../../utils/sessionStatus";
import RescheduleForm from "../../components/RescheduleForm";
import { FaStar } from "react-icons/fa";
import SkeletonDashboard from "../../components/SkeletonDashboard";

export default function PsychologistSessionsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookings, loading } = useSelector((state) => state.bookings);
  const [now, setNow] = useState(dayjs());
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState("Upcoming");

  const tabs = ["Upcoming", "Completed", "Rejected"];

  // Map main tabs to actual session statuses
  const tabStatusMap = {
    Upcoming: ["Pending", "Upcoming", "Active"],
    Completed: ["Completed"],
    Rejected: ["Rejected"]
  };

  useEffect(() => {
    dispatch(fetchBookings({ status: ["Pending", "Approved", "Active", "Completed", "Rejected"] }));
    const interval = setInterval(() => {
      dispatch(fetchBookings({ status: ["Pending", "Approved", "Active", "Completed", "Rejected"] }));
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(() => setNow(dayjs()), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = (bookingId, status) => {
    dispatch(updateBookingStatus({ bookingId, status }))
      .unwrap()
      .then(() => toast.success(`Appointment ${status.toLowerCase()} successfully!`))
      .catch(() => {
        toast.error(`Failed to ${status.toLowerCase()} appointment.`);
        dispatch(fetchBookings({ status: ["Pending", "Approved", "Active", "Completed", "Rejected"] }));
      });
  };

  const handleRescheduleSubmit = async ({ newDate, newTimeSlot }) => {
    try {
      await dispatch(rescheduleBooking({ bookingId: selectedBooking._id, newDate, newTimeSlot })).unwrap();
      setShowRescheduleModal(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error("Failed to reschedule:", error);
    }
  };

  const handleSendNotification = (bookingId) => {
    dispatch(sendNotification(bookingId));
  };

  const formatDate = (date) => dayjs(date).format("DD/MM/YYYY");

  const renderStars = (rating) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <FaStar
          key={i}
          className={`h-4 w-4 ${i <= rating ? "text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );

  if (loading) return <SkeletonDashboard />;

  // Add session info to bookings
  const bookingsWithSession = bookings
    .filter(b => b.meetingMode === "Chat" || b.meetingMode === "Video")
    .map((b) => ({ ...b, session: getSessionStatus(b, now) }));

  const filteredBookings = bookingsWithSession.filter((b) =>
    tabStatusMap[activeTab].includes(b.session?.status)
  );

  const hasAnySessions = bookingsWithSession.length > 0;

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      
      {/* Filter Tabs (always visible) */}
      <div className="flex justify-center flex-wrap gap-3 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full font-medium text-sm sm:text-base transition 
              ${activeTab === tab
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white/30 dark:bg-gray-700 text-gray-800 dark:text-gray-200 backdrop-blur-md hover:bg-white/40"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sessions */}
      {!hasAnySessions ? (
        <div className="text-center py-10 text-gray-600 dark:text-gray-300">
          No sessions available.
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-10 text-gray-600 dark:text-gray-300">
          No {activeTab.toLowerCase()} sessions.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className={`p-6 rounded-3xl border border-white/20 dark:border-gray-700 backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 shadow-lg hover:shadow-2xl transition-all ${booking.session.canAct ? "cursor-pointer" : "opacity-80 cursor-default"}`}
              onClick={() => booking.session.status === "Active" && navigate(`/psychologist/session/${booking._id}`)}
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={booking.anonymous ? "/anonymous-avatar.png" : booking.student?.profileImage?.url || "/default-avatar.png"}
                  alt={booking.anonymous ? "Anonymous" : booking.student?.username}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-inner"
                />
                <div>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {booking.anonymous ? "Anonymous" : booking.student?.username}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    {booking.anonymous ? "N/A" : booking.student?.email}
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-md text-gray-700 dark:text-gray-300">Date: {formatDate(booking.date)}</p>
              <p className="text-sm sm:text-md text-gray-700 dark:text-gray-300">Time: {booking.timeSlot}</p>
              <p className="text-sm sm:text-md text-gray-700 dark:text-gray-300">Meeting Mode: {booking.meetingMode}</p>

              <span className={`inline-block mt-3 px-3 py-1 text-xs sm:text-sm font-semibold rounded-full text-white ${booking.session.color}`}>
                Status: {booking.session.status}
              </span>

              {tabStatusMap["Upcoming"].includes(booking.session.status) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBooking(booking);
                      setShowRescheduleModal(true);
                    }}
                    className="text-sm sm:text-base bg-yellow-500 text-white px-3 py-1 rounded-xl hover:bg-yellow-600 transition"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendNotification(booking._id);
                    }}
                    className="text-sm sm:text-base bg-green-500 text-white px-3 py-1 rounded-xl hover:bg-green-600 transition"
                  >
                    Send Reminder
                  </button>
                </div>
              )}

              {booking.feedback?.rating && (
                <div className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                  <p className="font-semibold">Student Feedback:</p>
                  {renderStars(booking.feedback.rating)}
                  <p className="italic mt-1">"{booking.feedback.comment}"</p>
                </div>
              )}
            </div>
          ))}
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
