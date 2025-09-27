// utils/dateUtils.js
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import isBetween from "dayjs/plugin/isBetween.js";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";

// Extend dayjs with plugins
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

/**
 * Parses a date and a time slot string into Day.js start and end times.
 * Handles time slots that cross midnight and invalid times.
 * @param {string|Date} date - The date of the booking.
 * @param {string} timeSlot - The time slot string, e.g., "10:00 AM - 11:00 AM".
 * @returns {[Dayjs, Dayjs]} - Start and end times as Day.js objects.
 */
export const getParsedTimeRange = (date, timeSlot) => {
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

  // Fallback if parsing fails
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
