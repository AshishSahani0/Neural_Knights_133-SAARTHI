import Booking from "../models/Booking.js";
import User from "../models/userSchema.js";
import sendEmail from "../util/sendEmail.js";
import dayjs from "dayjs";
import { cleanupMessagesByBooking } from "./chatController.js";
import { getParsedTimeRange } from "../util/dateUtils.js";
import mongoose from "mongoose";

// ---------------- BOOK APPOINTMENT ----------------
export const bookAppointment = async (req, res) => {
  try {
    const { psychologistId, date, timeSlot, reason, anonymous, meetingMode } = req.body;
    const student = req.user;

    const existingBooking = await Booking.findOne({
      student: student._id,
      psychologist: psychologistId,
      date,
      timeSlot,
      status: { $in: ["Pending", "Approved"] },
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending or approved booking with this psychologist at this time.",
      });
    }

    const psychologist = await User.findOne({
      _id: psychologistId,
      role: "CollegePsychologist",
      isActive: true,
    });

    if (!psychologist) {
      return res.status(404).json({
        success: false,
        message: "Psychologist not found or not active.",
      });
    }

    if (String(student.institution) !== String(psychologist.institution)) {
      return res.status(403).json({
        success: false,
        message: "You can only book with a psychologist from your institution.",
      });
    }

    const roomId = `${student._id}_${psychologistId}_${Date.now()}`;

    const newBooking = await Booking.create({
      student: student._id,
      psychologist: psychologist._id,
      date,
      timeSlot,
      reason,
      anonymous,
      meetingMode,
      roomId,
    });

    // Real-time notify psychologists
    const io = req.app.get("io");
    if (io) {
      io.to("psychologists").emit("bookingCreated", {
        _id: newBooking._id,
        date,
        timeSlot,
        meetingMode,
        status: newBooking.status,
        anonymous,
        student: {
          _id: student._id,
          username: student.username,
          email: student.email,
          profileImage: student.profileImage || null,
        },
      });
    }

    // Email notifications
    (async () => {
      try {
        await sendEmail({
          to: psychologist.email,
          subject: "New Appointment Request",
          html: `<p>New appointment from ${anonymous ? "Anonymous" : student.username} on ${date} at ${timeSlot}</p>`,
        });

        await sendEmail({
          to: student.email,
          subject: "Appointment Booked",
          html: `<p>Your appointment with ${psychologist.username} is scheduled for ${date} at ${timeSlot}</p>`,
        });
      } catch (err) {
        console.error("Email send failed:", err);
      }
    })();

    res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      booking: newBooking,
    });
  } catch (error) {
    console.error("Booking failed:", error);
    res.status(500).json({ success: false, message: "Server error during booking." });
  }
};

// ---------------- GET ALL BOOKINGS ----------------
export const getAppointments = async (req, res) => {
  try {
    const user = req.user;
    let filter = {};
    const { status, sort, studentId, psychologistId, meetingMode, page = 1, limit = 100 } = req.query;

    if (user.role === "CollegePsychologist") filter.psychologist = user._id;
    else if (user.role === "Student") filter.student = user._id;
    else if (user.role === "Admin") { /* Admin can see all, no user-specific filter */ }

    if (studentId) filter.student = studentId;
    if (psychologistId) filter.psychologist = psychologistId;
    if (status) filter.status = Array.isArray(status) ? { $in: status } : status;
    if (meetingMode) filter.meetingMode = meetingMode;

    const skip = (page - 1) * limit;
    const sortOrder = sort === "-createdAt" ? { createdAt: -1 } : { createdAt: 1 };

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate("student", "username email profileImage")
      .populate("psychologist", "username email profileImage")
      .sort(sortOrder)
      .skip(skip)
      .limit(limit);

    res.status(200).json({ success: true, bookings, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
};

// ---------------- GET BOOKING BY ID ----------------
export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate("student", "username email profileImage")
      .populate("psychologist", "username email profileImage");

    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    const isOwner =
      String(booking.student._id) === String(req.user._id) ||
      String(booking.psychologist._id) === String(req.user._id);

    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch booking details" });
  }
};

// ---------------- UPDATE BOOKING STATUS ----------------
// ---------------- UPDATE BOOKING STATUS ----------------
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    let { status, cancelReason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    // AUTO-MARK as Completed if Pending and session time is past
    if (booking.status === "Pending") {
      const [startTime, endTime] = getParsedTimeRange(booking.date, booking.timeSlot);

      if (dayjs().isAfter(endTime)) {
        status = "Completed"; // override status to Completed
      }
    }

    booking.status = status;
    if (cancelReason) booking.cancelReason = cancelReason;
    await booking.save();

    // Notify by email
    const student = await User.findById(booking.student);
    const psychologist = await User.findById(booking.psychologist);

    await sendEmail({
      to: student.email,
      subject: `Booking ${status}`,
      html: `<p>Your appointment with ${psychologist.username} has been ${status}</p>`,
    });

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.to(booking.roomId).emit("bookingStatusUpdated", {
        bookingId: booking._id,
        status: booking.status,
      });
    }

    res.status(200).json({ success: true, message: `Booking ${status}`, booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};
// ---------------- UPDATE IN-PERSON DETAILS ----------------
export const updateInPersonDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { meetingLocation, notes } = req.body;

    if (!meetingLocation) {
      return res.status(400).json({ success: false, message: "Meeting location is required" });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { meetingLocation, notes },
      { new: true }
    );

    if (!updatedBooking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    res.status(200).json({ success: true, updatedBooking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update in-person details" });
  }
};

// ---------------- ADD FEEDBACK ----------------
export const addFeedback = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rating, comment } = req.body; // Corrected: Access rating and comment directly from req.body

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.feedback = { rating, comment };
    await booking.save();

    res.status(200).json({ success: true, message: "Feedback added", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to add feedback" });
  }
};

// ---------------- RESCHEDULE BOOKING ----------------
export const rescheduleBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { newDate, newTimeSlot, newMeetingMode } = req.body;

        if (!newDate || !newTimeSlot) {
            return res.status(400).json({ success: false, message: "New date and time slot are required." });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }
        
        // Find the student and psychologist for the email
        const student = await User.findById(booking.student);
        const psychologist = await User.findById(booking.psychologist);

        // Save old details to history before updating
        booking.rescheduleHistory.push({
            oldDate: booking.date,
            oldTimeSlot: booking.timeSlot,
            rescheduledAt: new Date(),
        });

        // Update with new details
        booking.date = newDate;
        booking.timeSlot = newTimeSlot;
        booking.isRescheduled = true;
        if (newMeetingMode) {
            booking.meetingMode = newMeetingMode;
        }

        await booking.save();

        // Send email notification to the student
        const emailSubject = "Appointment Rescheduled";
        const emailBody = `
            <p>Dear ${student.username},</p>
            <p>Your appointment with ${psychologist.username} has been rescheduled.</p>
            <p><strong>New Details:</strong></p>
            <ul>
                <li><strong>Date:</strong> ${dayjs(newDate).format("DD/MM/YYYY")}</li>
                <li><strong>Time:</strong> ${newTimeSlot}</li>
                <li><strong>Meeting Mode:</strong> ${newMeetingMode || booking.meetingMode}</li>
            </ul>
            <p>Please log in to your dashboard to view the updated details.</p>
            <p>Thank you.</p>
        `;

        await sendEmail({
            to: student.email,
            subject: emailSubject,
            html: emailBody,
        });

        res.status(200).json({ success: true, message: "Booking rescheduled successfully.", booking });
    } catch (err) {
        console.error("Failed to reschedule:", err);
        res.status(500).json({ success: false, message: "Failed to reschedule booking due to a server error." });
    }
};
// ---------------- SET ROOM ID ----------------
export const setRoomId = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { roomId } = req.body;

    const booking = await Booking.findByIdAndUpdate(bookingId, { roomId }, { new: true });

    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    res.status(200).json({ success: true, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update room ID" });
  }
};

// ---------------- END SESSION ----------------
export const endSession = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (booking.status === "Completed") {
      return res.status(400).json({ success: false, message: "Session already completed." });
    }

    booking.status = "Completed";
    await booking.save();

    // ------------------- NEW: Clean up messages and files -------------------
    await cleanupMessagesByBooking(bookingId);

    const io = req.app.get("io");
    if (io) {
      io.to(booking.roomId).emit("sessionEnded", { bookingId });
    }

    res.status(200).json({ success: true, message: "Session marked as completed." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to end session." });
  }
};

export const notifyStudent = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate("student psychologist");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const studentEmail = booking.student.email;
    const psychologistName = booking.psychologist.username;

    const subject = "Your SAARTHI Session is Starting!";
    const html = `
      <p>Hi ${booking.student.username},</p>
      <p>This is a notification from your psychologist <strong>${psychologistName}</strong> that your session is starting now.</p>
      <p><strong>Date:</strong> ${dayjs(booking.date).format('DD/MM/YYYY')}</p>
      <p><strong>Time:</strong> ${booking.timeSlot}</p>
      <p>Please be ready to join your session.</p>
      <p>Best regards,<br>The SAARTHI Team</p>
    `;

    await sendEmail({ to: studentEmail, subject, html });

    res.status(200).json({ success: true, message: "Notification sent to student successfully." });
  } catch (error) {
    console.error("Error in notifyStudent:", error);
    res.status(500).json({ success: false, message: "Failed to send notification." });
  }
};

export const getPsychologistSessionStats = async (req, res) => {

  try {
    
    const psychologistId = req.user._id;
    

    if (!psychologistId || !mongoose.Types.ObjectId.isValid(psychologistId)) {
      return res.status(400).json({ success: false, message: "Invalid psychologist ID." });
    }

    const completedSessions = await Booking.countDocuments({
      psychologist: psychologistId,
      status: "Completed",
    });

    const rejectedSessions = await Booking.countDocuments({
      psychologist: psychologistId,
      status: "Rejected",
    });

    const pendingSessions = await Booking.countDocuments({
      psychologist: psychologistId,
      status: "Pending",
    });

    return res.status(200).json({
      success: true,
      data: { completedSessions, rejectedSessions, pendingSessions },
    });

  } catch (error) {
    console.error("Error fetching psychologist session stats:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching session stats.",
    });
  }
};


export const getStudentSessionStats = async (req, res) => {
  try {
    const studentId = req.user._id;

    const completedSessions = await Booking.countDocuments({
      student: studentId,
      status: "Completed",
    });

    const rejectedSessions = await Booking.countDocuments({
      student: studentId,
      status: "Rejected",
    });

    res.status(200).json({
      success: true,
      data: {
        completedSessions,
        rejectedSessions,
      },
    });
  } catch (error) {
    console.error("Error fetching student session stats:", error);
    res.status(500).json({ success: false, message: "Server error fetching session stats." });
  }
};
