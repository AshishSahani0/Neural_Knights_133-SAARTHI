import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  psychologist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  anonymous: {
    type: Boolean,
    default: false,
  },
  meetingMode: {
    type: String,
    enum: ["Video", "Chat", "In-Person"],
    default: "Chat",
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Completed", "Cancelled"],
    default: "Pending",
  },
  cancelReason: {
    type: String,
    default: null,
  },
  isCancelled: {
    type: Boolean,
    default: false,
  },
  isRescheduled: {
    type: Boolean,
    default: false,
  },
  rescheduleHistory: [
    {
      oldDate: Date,
      oldTimeSlot: String,
      rescheduledAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
  },
  meetingLocation: {
    type: String,
    default: null,
  },
  notes: {
    type: String,
    default: null,
  },
  roomId: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

// TTL index: auto-delete completed bookings 2 days (172800 seconds) after the appointment date
bookingSchema.index(
  { date: 1 },
  {
    expireAfterSeconds: 86400, // 1 days
    partialFilterExpression: { status: "Completed" },
  }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
