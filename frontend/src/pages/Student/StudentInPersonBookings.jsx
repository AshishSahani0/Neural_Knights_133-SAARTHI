import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookings } from "../../redux/slices/bookingSlice";
import dayjs from "dayjs";
import getSessionStatus from "../../utils/sessionStatus";
import SkeletonDashboard from "../../components/SkeletonDashboard";

export default function StudentInPersonBookings() {
  const dispatch = useDispatch();
  const { bookings, loading } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.auth);

  const [now, setNow] = useState(dayjs());
  const [activeTab, setActiveTab] = useState("Upcoming");

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchBookings({ studentId: user._id, meetingMode: "In-Person" }));
    }
  }, [dispatch, user]);

  useEffect(() => {
    const interval = setInterval(() => setNow(dayjs()), 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <SkeletonDashboard />;

  const formatDate = (date) => dayjs(date).format("DD/MM/YYYY");

  const allBookings = bookings
    ?.filter((b) => b.meetingMode === "In-Person")
    .map((b) => ({
      ...b,
      session: getSessionStatus(b, now),
    }));

  // Updated tab filtering: Upcoming = Active + Pending + Upcoming
  const displayedBookings = allBookings?.filter((b) => {
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
          No {activeTab.toLowerCase()} in-person bookings.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedBookings.map((booking) => (
            <div
              key={booking._id}
              className="p-6 rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-white/20 dark:border-gray-700 shadow-lg hover:shadow-2xl cursor-default"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={booking.psychologist?.profileImage?.url || "/default-avatar.png"}
                  alt={booking.psychologist?.username || "Psychologist"}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-inner"
                />
                <div>
                  <h2 className="text-md font-semibold text-gray-800 dark:text-white">
                    Psychologist: {booking.psychologist?.username || "Unknown"}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {booking.psychologist?.email || ""}
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <p>
                  Date: {formatDate(booking.date)} at {booking.timeSlot || "N/A"}
                </p>
                <p>Reason: {booking.reason || "N/A"}</p>
              </div>

              {booking.meetingLocation ? (
                <p className="text-sm text-green-600 font-semibold mt-2">
                  Location: {booking.meetingLocation}
                </p>
              ) : (
                <p className="text-sm text-red-500 font-semibold mt-2">
                  Location: Not yet set by psychologist
                </p>
              )}

              {booking.notes && (
                <p className="text-sm text-gray-700 dark:text-gray-200 mt-2">
                  Notes: {booking.notes}
                </p>
              )}

              <span
                className={`inline-block mt-3 px-2 py-1 text-xs font-semibold rounded-full text-white ${booking.session.color}`}
              >
                Status: {booking.session.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
