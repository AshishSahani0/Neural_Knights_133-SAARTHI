import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchBookings, addFeedback } from "../../redux/slices/bookingSlice";
import dayjs from "dayjs";
import getSessionStatus from "../../utils/sessionStatus";
import FeedbackForm from "../../components/FeedbackForm";
import { FaStar } from "react-icons/fa";
import SkeletonDashboard from "../../components/SkeletonDashboard";
import { toast } from "react-toastify";

export default function BookingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookings, loading } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.auth);

  const [now, setNow] = useState(dayjs());
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState("Upcoming");

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchBookings({ studentId: user._id, meetingMode: ["Chat", "Video"] }));
    }
  }, [dispatch, user]);

  useEffect(() => {
    const interval = setInterval(() => setNow(dayjs()), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFeedbackSubmit = async ({ rating, comment }) => {
    try {
      await dispatch(addFeedback({ bookingId: selectedBooking._id, feedback: { rating, comment } })).unwrap();
      setShowFeedbackModal(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error("Failed to add feedback:", error);
      toast.error("Failed to add feedback.");
    }
  };

  const renderStars = (rating) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <FaStar key={i} className={`h-4 w-4 ${i <= rating ? "text-yellow-400" : "text-gray-300"}`} />
      ))}
    </div>
  );

  if (loading) return <SkeletonDashboard />;

  const formatDate = (date) => dayjs(date).format("DD/MM/YYYY");

  const filteredBookings = bookings
    ?.filter((b) => b.meetingMode === "Chat" || b.meetingMode === "Video")
    .map((booking) => ({
      ...booking,
      session: getSessionStatus(booking, now),
    }));

  // Updated tab filtering: Upcoming = Active + Pending + Upcoming
  const displayedBookings = filteredBookings?.filter((b) => {
    if (activeTab === "Upcoming") return ["Upcoming", "Active", "Pending"].includes(b.session.status);
    if (activeTab === "Completed") return b.session.status === "Completed";
    if (activeTab === "Rejected") return b.session.status === "Rejected";
    return false;
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      
      {/* Tabs */}
      <div className="flex justify-center mb-6 flex-wrap gap-3">
        {["Upcoming", "Completed", "Rejected"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full font-medium transition 
              ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white/30 dark:bg-gray-700 text-gray-800 dark:text-gray-200 backdrop-blur-md hover:bg-white/40"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {displayedBookings?.length === 0 ? (
        <div className="text-center text-gray-600 dark:text-gray-300">
          No {activeTab.toLowerCase()} bookings.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedBookings.map((booking) => (
            <div
              key={booking._id}
              onClick={() =>
                booking.session.status === "Active" &&
                navigate(`/student/chat-or-call/${booking._id}`)
              }
              className={`
                p-6 rounded-2xl bg-white/40 dark:bg-gray-800/40 
                backdrop-blur-md border border-white/20 dark:border-gray-700 
                shadow-lg hover:shadow-2xl transition 
                ${
                  booking.session.status === "Active"
                    ? "cursor-pointer hover:scale-[1.02]"
                    : "cursor-default opacity-80"
                }
              `}
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={booking.psychologist?.profileImage?.url || "/default-avatar.png"}
                  alt={booking.psychologist?.username || "Psychologist"}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-inner"
                />
                <div className="flex-1">
                  <h2 className="text-md font-semibold text-gray-800 dark:text-white">
                    Psychologist: {booking.psychologist?.username || "Unknown"}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {booking.psychologist?.email || ""}
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <p>Date: {formatDate(booking.date)} at {booking.timeSlot || "N/A"}</p>
                <p>Reason: {booking.reason || "N/A"}</p>
                <p>Meeting Mode: {booking.meetingMode}</p>
              </div>

              <span
                className={`inline-block mt-3 px-2 py-1 text-xs font-semibold rounded-full text-white ${booking.session.color}`}
              >
                Status: {booking.session.status}
              </span>

              {booking.session.status === "Completed" && !booking.feedback?.rating && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBooking(booking);
                    setShowFeedbackModal(true);
                  }}
                  className="mt-3 w-full bg-blue-500 text-white text-sm py-1.5 rounded-md hover:bg-blue-600 transition"
                >
                  Give Feedback
                </button>
              )}

              {booking.session.status === "Completed" && booking.feedback?.rating && (
                <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-semibold">Feedback given:</p>
                  {renderStars(booking.feedback.rating)}
                  <p className="italic mt-1">"{booking.feedback.comment}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showFeedbackModal && (
        <FeedbackForm
          booking={selectedBooking}
          onSubmit={handleFeedbackSubmit}
          onCancel={() => setShowFeedbackModal(false)}
        />
      )}
    </div>
  );
}
