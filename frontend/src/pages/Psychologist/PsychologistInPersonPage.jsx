import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBookings,
  updateBookingStatus,
  updateInPersonDetails
} from "../../redux/slices/bookingSlice";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import getSessionStatus from "../../utils/sessionStatus";
import InPersonDetailsForm from "./InPersonDetailsForm";
import SkeletonDashboard from "../../components/SkeletonDashboard";

export default function PsychologistInPersonPage() {
  const dispatch = useDispatch();
  const { bookings: reduxBookings, loading } = useSelector((state) => state.bookings);
  const [bookings, setBookings] = useState([]);
  const [now, setNow] = useState(dayjs());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState("Upcoming");

  const tabs = ["Upcoming", "Completed", "Rejected"];
  const tabStatusMap = {
    Upcoming: ["Pending", "Upcoming", "Active"],
    Completed: ["Completed"],
    Rejected: ["Rejected"]
  };

  // Fetch bookings
  useEffect(() => {
    dispatch(fetchBookings({ meetingMode: "In-Person" }))
      .then((res) => setBookings(res.payload || []));
  }, [dispatch]);

  useEffect(() => setBookings(reduxBookings || []), [reduxBookings]);

  // Update current time
  useEffect(() => {
    const interval = setInterval(() => setNow(dayjs()), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = (bookingId, status) => {
    setBookings((prev) => prev.map(b => b._id === bookingId ? { ...b, status } : b));

    dispatch(updateBookingStatus({ bookingId, status }))
      .unwrap()
      .then(() => toast.success(`Appointment marked as ${status.toLowerCase()}.`))
      .catch(() => {
        toast.error(`Failed to mark as ${status.toLowerCase()}.`);
        dispatch(fetchBookings({ meetingMode: "In-Person" }))
          .then(res => setBookings(res.payload || []));
      });
  };

  const openManageModal = (booking) => setSelectedBooking(booking);

  const handleFormSubmit = ({ meetingLocation, notes }) => {
    if (!meetingLocation.trim()) return toast.error("Location cannot be empty.");

    const updatedBooking = { ...selectedBooking, meetingLocation, notes };
    setBookings(prev => prev.map(b => b._id === updatedBooking._id ? updatedBooking : b));
    setSelectedBooking(null);

    dispatch(updateInPersonDetails({
      bookingId: updatedBooking._id,
      meetingLocation: updatedBooking.meetingLocation,
      notes: updatedBooking.notes
    }))
      .unwrap()
      .then(() => toast.success("Details updated."))
      .catch(() => {
        toast.error("Failed to update details.");
        dispatch(fetchBookings({ meetingMode: "In-Person" }))
          .then(res => setBookings(res.payload || []));
      });
  };

  const formatDate = (date) => dayjs(date).format("DD/MM/YYYY");

  if (loading) return <SkeletonDashboard />;

  // Add session info
  const bookingsWithSession = bookings.map(b => ({ ...b, session: getSessionStatus(b, now) }));

  // Filter bookings for active tab
  const filteredBookings = bookingsWithSession.filter(b =>
    tabStatusMap[activeTab].includes(b.session?.status)
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      
      {/* Tabs (always visible) */}
      <div className="flex justify-center gap-4 flex-wrap mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full font-medium transition 
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
      {filteredBookings.length === 0 ? (
        <div className="text-center py-10 text-gray-600 dark:text-gray-300">
          {bookingsWithSession.length === 0
            ? "No in-person sessions scheduled."
            : `No ${activeTab.toLowerCase()} in-person sessions.`}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => {
            const session = booking.session;
            return (
              <div
                key={booking._id}
                className={`p-6 rounded-3xl border border-white/20 dark:border-gray-700 backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 shadow-lg hover:shadow-2xl transition-all ${session.canAct ? "cursor-pointer" : "opacity-70"}`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={booking.anonymous ? "/anonymous-avatar.png" : booking.student?.profileImage?.url || "/default-avatar.png"}
                    alt={booking.anonymous ? "Anonymous" : booking.student?.username}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-inner"
                  />
                  <div>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">{booking.anonymous ? "Anonymous" : booking.student?.username}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">{booking.anonymous ? "N/A" : booking.student?.email}</p>
                  </div>
                </div>

                <p className="text-sm sm:text-md text-gray-700 dark:text-gray-300">Date: {formatDate(booking.date)}</p>
                <p className="text-sm sm:text-md text-gray-700 dark:text-gray-300">Time: {booking.timeSlot}</p>
                {booking.meetingLocation ? (
                  <p className="text-sm sm:text-md text-green-600 font-semibold mt-2">Location: {booking.meetingLocation}</p>
                ) : (
                  <p className="text-sm sm:text-md text-red-500 font-semibold mt-2">Location: Not yet set</p>
                )}
                {booking.notes && <p className="text-sm sm:text-md text-gray-700 dark:text-gray-300 mt-1">Notes: {booking.notes}</p>}

                <span className={`inline-block mt-3 px-3 py-1 text-xs sm:text-sm font-bold rounded-full text-white ${session.color}`}>
                  Status: {session.status}
                </span>

                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={() => openManageModal(booking)}
                    disabled={!session.canAct}
                    className={`px-4 py-2 rounded-xl text-sm sm:text-base transition ${session.canAct ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                  >
                    Manage Details
                  </button>
                  {session.canAct && (
                    <button
                      onClick={() => handleStatusUpdate(booking._id, "Completed")}
                      className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm sm:text-base hover:bg-green-700 transition"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedBooking && (
        <InPersonDetailsForm
          booking={selectedBooking}
          onSubmit={handleFormSubmit}
          onCancel={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
