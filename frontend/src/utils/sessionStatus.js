// utils/getSessionStatus.js
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween.js";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

// Extend dayjs with plugins
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

/**
 * Returns a standardized session status object for any booking.
 * Automatically marks 'Pending' sessions as 'Completed' if time has passed.
 * @param {Object} booking - Booking object from DB.
 * @param {Dayjs} now - Optional current time (defaults to dayjs()).
 * @returns {Object} { status, canAct, isPending, isCompleted, color }
 */
const getSessionStatus = (booking, now = dayjs()) => {
  // ---------------- Parse Time Slot ----------------
  const parseTimeSlot = (date, timeSlot) => {
    if (!timeSlot || !timeSlot.includes("-")) {
      return [dayjs(date).startOf("day"), dayjs(date).endOf("day")];
    }

    const [startStr, endStr] = timeSlot.split("-").map(str => str.trim());
    const datePart = dayjs(date).format("YYYY-MM-DD");

    let startTime = dayjs(
      `${datePart} ${startStr}`,
      ["YYYY-MM-DD HH:mm", "YYYY-MM-DD hh:mm A"],
      true
    );
    let endTime = dayjs(
      `${datePart} ${endStr}`,
      ["YYYY-MM-DD HH:mm", "YYYY-MM-DD hh:mm A"],
      true
    );

    if (!startTime.isValid() || !endTime.isValid()) {
      startTime = dayjs(date).startOf("day");
      endTime = dayjs(date).endOf("day");
    }

    // Adjust if endTime is before startTime (crosses midnight)
    if (endTime.isBefore(startTime)) {
      endTime = endTime.add(1, "day");
    }

    return [startTime, endTime];
  };

  const [startTime, endTime] = parseTimeSlot(booking.date, booking.timeSlot);

  // ---------------- Handle Non-Approved Sessions ----------------
  if (booking.status !== "Approved") {
    const isExpired = now.isSameOrAfter(endTime);

    // Special Case: If status is Pending but time has passed → treat as Completed
    if (booking.status === "Pending" && isExpired) {
      return {
        status: "Completed",
        canAct: false,
        isPending: false,
        isCompleted: true,
        color: "bg-red-500",
      };
    }

    let color = "bg-yellow-500"; // Default for Pending
    if (booking.status === "Rejected") color = "bg-red-500";
    if (booking.status === "Completed") color = "bg-red-500";

    return {
      status: booking.status,
      canAct: booking.status === "Pending",
      isPending: booking.status === "Pending",
      isCompleted: booking.status === "Completed",
      color,
    };
  }

  // ---------------- Handle Approved Sessions ----------------
  const earlyJoinBuffer = 5; // minutes before start
  const canJoinTime = startTime.subtract(earlyJoinBuffer, "minute");

  if (now.isBetween(canJoinTime, endTime, null, "[]")) {
    return {
      status: "Active",
      canAct: true,
      isCompleted: false,
      color: "bg-green-500",
    };
  }

  if (now.isSameOrAfter(endTime)) {
    return {
      status: "Completed",
      canAct: false,
      isCompleted: true,
      color: "bg-red-500",
    };
  }

  return {
    status: "Upcoming",
    canAct: true,
    isCompleted: false,
    color: "bg-blue-500",
  };
};

export default getSessionStatus;
