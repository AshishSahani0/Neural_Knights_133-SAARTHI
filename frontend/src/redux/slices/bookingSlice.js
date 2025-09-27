import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import { toast } from "react-toastify";
import dayjs from "dayjs";

// ----------------- FETCH BOOKINGS -----------------
export const fetchBookings = createAsyncThunk(
  "bookings/fetchBookings",
  async (params = {}, { rejectWithValue }) => {
    try {
      if (params.bookingId) {
        // If a single bookingId is provided, fetch just that one.
        const { data } = await api.get(`/bookings/${params.bookingId}`);
        return data.booking;
      } else {
        // Otherwise, fetch all bookings based on other params.
        const { data } = await api.get("/bookings/all", {
          params: { ...params, sort: "-createdAt" },
        });
        return data.bookings;
      }
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch bookings" });
    }
  }
);

// ----------------- CREATE BOOKING -----------------
export const createBooking = createAsyncThunk(
  "bookings/createBooking",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/bookings/create", formData);
      toast.success(data.message || "Booking created successfully");
      return data.booking;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create booking");
      return rejectWithValue(err.response?.data || { message: "Failed to create booking" });
    }
  }
);

// ----------------- UPDATE BOOKING STATUS -----------------
export const updateBookingStatus = createAsyncThunk(
  "bookings/updateBookingStatus",
  async ({ bookingId, status, cancelReason }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/bookings/update-status/${bookingId}`, { status, cancelReason });
      toast.success(data.message || "Booking status updated");
      return data.booking;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
      return rejectWithValue(err.response?.data || { message: "Failed to update status" });
    }
  }
);

// ----------------- ADD FEEDBACK -----------------
export const addFeedback = createAsyncThunk(
  "bookings/addFeedback",
  async ({ bookingId, feedback }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/bookings/feedback/${bookingId}`, feedback);
      toast.success(data.message || "Feedback added");
      return data.booking;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add feedback");
      return rejectWithValue(err.response?.data || { message: "Failed to add feedback" });
    }
  }
);

// ----------------- RESCHEDULE BOOKING -----------------
export const rescheduleBooking = createAsyncThunk(
  "bookings/rescheduleBooking",
  async ({ bookingId, newDate, newTimeSlot, newMeetingMode }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/bookings/reschedule/${bookingId}`, { newDate, newTimeSlot, newMeetingMode });
      toast.success("Booking rescheduled");
      return data.booking;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reschedule");
      return rejectWithValue(err.response?.data || { message: "Failed to reschedule" });
    }
  }
);

// ----------------- SET ROOM ID -----------------
export const setRoomId = createAsyncThunk(
  "bookings/setRoomId",
  async ({ bookingId, roomId }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/bookings/room/${bookingId}`, { roomId });
      return data.booking;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to set room ID" });
    }
  }
);

// ----------------- UPDATE IN-PERSON DETAILS -----------------
export const updateInPersonDetails = createAsyncThunk(
  "bookings/updateInPersonDetails",
  async ({ bookingId, meetingLocation, notes }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/bookings/${bookingId}/inperson`, { meetingLocation, notes });
      toast.success("In-Person details updated successfully");
      return data.updatedBooking;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update in-person details");
      return rejectWithValue(err.response?.data || { message: "Failed to update in-person details" });
    }
  }
);

// ----------------- SEND NOTIFICATION (NEW THUNK) -----------------
export const sendNotification = createAsyncThunk(
  "bookings/sendNotification",
  async (bookingId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/bookings/${bookingId}/notify`);
      toast.success(data.message);
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send notification.");
      return rejectWithValue(err.response?.data || { message: "Failed to send notification." });
    }
  }
);

// ----------------- SLICE -----------------
const bookingSlice = createSlice({
  name: "bookings",
  initialState: {
    bookings: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.loading = true;
      state.error = null;
    };

    const handleRejected = (state, { payload }) => {
      state.loading = false;
      state.error = payload?.message || "Something went wrong";
    };

    const getStartDateTime = (booking) => {
      const timeStr = booking.timeSlot?.split("-")[0]?.trim() || "00:00";
      const dateStr = booking.date || dayjs().format("YYYY-MM-DD");
      return dayjs(`${dateStr} ${timeStr}`);
    };

    const updateOrAddBooking = (state, payload) => {
      const index = state.bookings.findIndex((b) => b._id === payload._id);
      if (index !== -1) {
        state.bookings[index] = payload;
      } else {
        state.bookings.unshift(payload);
      }
      state.bookings.sort((a, b) => getStartDateTime(a) - getStartDateTime(b));
    };

    builder
      // FETCH
      .addCase(fetchBookings.pending, handlePending)
      .addCase(fetchBookings.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (Array.isArray(payload)) {
          state.bookings = payload.sort((a, b) => getStartDateTime(a) - getStartDateTime(b));
        } else if (payload) {
          // Handle a single booking payload
          updateOrAddBooking(state, payload);
        }
      })
      .addCase(fetchBookings.rejected, handleRejected)

      // CREATE
      .addCase(createBooking.pending, handlePending)
      .addCase(createBooking.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.bookings.unshift(payload);
        state.bookings.sort((a, b) => getStartDateTime(a) - getStartDateTime(b));
      })
      .addCase(createBooking.rejected, handleRejected)

      // UPDATE STATUS
      .addCase(updateBookingStatus.pending, handlePending)
      .addCase(updateBookingStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        updateOrAddBooking(state, payload);
      })
      .addCase(updateBookingStatus.rejected, handleRejected)

      // FEEDBACK
      .addCase(addFeedback.pending, handlePending)
      .addCase(addFeedback.fulfilled, (state, { payload }) => {
        state.loading = false;
        updateOrAddBooking(state, payload);
      })
      .addCase(addFeedback.rejected, handleRejected)

      // RESCHEDULE
      .addCase(rescheduleBooking.pending, handlePending)
      .addCase(rescheduleBooking.fulfilled, (state, { payload }) => {
        state.loading = false;
        updateOrAddBooking(state, payload);
      })
      .addCase(rescheduleBooking.rejected, handleRejected)

      // SET ROOM
      .addCase(setRoomId.pending, handlePending)
      .addCase(setRoomId.fulfilled, (state, { payload }) => {
        state.loading = false;
        updateOrAddBooking(state, payload);
      })
      .addCase(setRoomId.rejected, handleRejected)

      // IN-PERSON DETAILS
      .addCase(updateInPersonDetails.pending, handlePending)
      .addCase(updateInPersonDetails.fulfilled, (state, { payload }) => {
        state.loading = false;
        updateOrAddBooking(state, payload);
      })
      .addCase(updateInPersonDetails.rejected, handleRejected);
  },
});

export default bookingSlice.reducer;