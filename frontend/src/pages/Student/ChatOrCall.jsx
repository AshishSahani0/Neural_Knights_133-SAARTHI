import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ChatRoom from "../Student/ChatRoom";
import VideoCall from "../Student/VideoCall";
import InPersonDetailsForm from "../Psychologist/InPersonDetailsForm";
import api from "../../api/api";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isBetween from "dayjs/plugin/isBetween";
import {
  updateBookingStatus,
  updateInPersonDetails,
  fetchBookings,
} from "../../redux/slices/bookingSlice";
import getSessionStatus from "../../utils/sessionStatus";
import bookedSocket from "../../socket/bookedSocket";

dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

export default function ChatOrCall() {
  const { bookingId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { bookings } = useSelector((state) => state.bookings);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const booking = bookings.find((b) => b._id === bookingId);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(
    sessionStorage.getItem(`joined_${bookingId}`) === "true"
  );

  useEffect(() => {
    if (!booking) {
      const getInitialBooking = async () => {
        try {
          await dispatch(fetchBookings({ bookingId }));
        } catch {
          toast.error("Failed to fetch booking details.");
        } finally {
          setLoading(false);
        }
      };
      getInitialBooking();
      return;
    }

    setLoading(false);

    if (["Chat", "Video"].includes(booking.meetingMode)) {
      if (!bookedSocket.connected) bookedSocket.connect();
      bookedSocket.emit("joinRoom", { roomId: booking.roomId, user, bookingId });
    }

    const handleSessionEnded = ({ bookingId: endedBookingId }) => {
      if (endedBookingId === bookingId) {
        toast.info("The session has been ended.");
        dispatch(updateBookingStatus({ bookingId, status: "Completed" }));
        setJoined(false);
      }
    };

    const handleRescheduleUpdate = (updatedBooking) => {
      if (updatedBooking._id === bookingId) {
        toast.info("Your appointment has been rescheduled.");
        dispatch(updateBookingStatus(updatedBooking));
      }
    };

    bookedSocket.on("sessionEnded", handleSessionEnded);
    bookedSocket.on("bookingUpdated", handleRescheduleUpdate);

    return () => {
      bookedSocket.off("sessionEnded", handleSessionEnded);
      bookedSocket.off("bookingUpdated", handleRescheduleUpdate);
    };
  }, [bookingId, dispatch, booking, user]);

  const handleInPersonSubmit = async (updatedDetails) => {
    try {
      await dispatch(updateInPersonDetails({ bookingId, ...updatedDetails })).unwrap();
      toast.success("Meeting details saved!");
    } catch {
      toast.error("Failed to save in-person details.");
    }
  };

  const handleEndSession = async () => {
    try {
      await api.post(`/bookings/${bookingId}/end`);
      toast.info("Session ended successfully");
      dispatch(updateBookingStatus({ bookingId, status: "Completed" }));
      setJoined(false);
      bookedSocket.emit("endSession", { roomId: booking.roomId, bookingId });
    } catch {
      toast.error("Failed to end session.");
    }
  };

  const handleJoinSession = () => {
    setJoined(true);
    sessionStorage.setItem(`joined_${bookingId}`, "true");
  };

  if (loading || !booking)
    return <div className="p-4 text-center">Loading...</div>;
  if (booking.status === "Rejected")
    return <div className="p-4 text-center text-red-600">This appointment was rejected.</div>;

  const session = getSessionStatus(booking, dayjs());
  const isPsychologist = user?.role === "CollegePsychologist";
  const showChatOrVideo = (session.status === "Active" || session.status === "Completed") && joined;
  const showJoinButton = session.status === "Active" && !joined;
  const showEndButton = isPsychologist && session.status === "Active" && joined;

  if (booking.meetingMode === "In-Person") {
    if (isPsychologist) {
      return (
        <InPersonDetailsForm
          booking={booking}
          onSubmit={handleInPersonSubmit}
          onCancel={() => navigate("/dashboard")}
        />
      );
    }
    return (
      <div className="p-4 glassmorphism rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-2">In-Person Meeting Details</h3>
        <p><strong>Location:</strong> {booking.meetingLocation || "Not set"}</p>
        <p><strong>Notes:</strong> {booking.notes || "No notes"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen p-2 md:p-4 gap-2 bg-gray-100">
      <div className={`w-full py-2 text-center font-semibold text-white mb-4 rounded-lg ${session.color}`}>
        {session.status === "Upcoming" ? "Upcoming Session" : session.status}
      </div>

      {showEndButton && (
        <div className="text-center mb-4">
          <button
            onClick={handleEndSession}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            End Session
          </button>
        </div>
      )}

      {showJoinButton && (
        <div className="text-center mb-4">
          <button
            onClick={handleJoinSession}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Join Session
          </button>
        </div>
      )}

      {session.status === "Completed" && (
        <div className="p-4 text-center text-gray-600 mb-4">
          Session has ended.
        </div>
      )}

      {showChatOrVideo && (
        <div className="flex flex-col md:flex-row flex-1 gap-2">
          {booking.meetingMode === "Chat" && (
            <div className="flex-1 glassmorphism p-2 rounded-lg shadow-lg overflow-hidden">
              <ChatRoom roomId={booking.roomId} user={user} booking={booking} />
            </div>
          )}
          {booking.meetingMode === "Video" && (
            <div className="flex-1 flex flex-col glassmorphism p-2 rounded-lg shadow-lg overflow-hidden">
              <VideoCall roomId={booking.roomId} user={user} booking={booking} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
