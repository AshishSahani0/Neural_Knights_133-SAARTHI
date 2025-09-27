import express from "express";
import { isAuthenticated, isCollegePsychologist, isStudent } from "../middlewares/authMiddleware.js";
import {
  bookAppointment,
  getAppointments,
  getBookingById,
  updateBookingStatus,
  updateInPersonDetails,
  addFeedback,
  rescheduleBooking,
  setRoomId,
  endSession,
  notifyStudent,
  getPsychologistSessionStats,
  getStudentSessionStats
} from "../controllers/bookingController.js";


const bookingRouter = express.Router();

bookingRouter.post("/create", isAuthenticated, bookAppointment);
bookingRouter.get("/all", isAuthenticated, getAppointments);
bookingRouter.get("/:bookingId", isAuthenticated, getBookingById);
bookingRouter.put("/update-status/:bookingId", isAuthenticated, updateBookingStatus);
bookingRouter.put("/:bookingId/inperson", isAuthenticated, updateInPersonDetails);
bookingRouter.put("/feedback/:bookingId", isAuthenticated, addFeedback);
bookingRouter.put("/reschedule/:bookingId", isAuthenticated, rescheduleBooking);
bookingRouter.put("/room/:bookingId", isAuthenticated, setRoomId);
bookingRouter.post("/:bookingId/end", isAuthenticated, endSession);
bookingRouter.post("/:bookingId/notify", isAuthenticated,notifyStudent);
bookingRouter.get(
  "/stats/psychologist",
  isAuthenticated,
  isCollegePsychologist,
  getPsychologistSessionStats
);
bookingRouter.get(
  "/stats/student",
  isAuthenticated,
  isStudent,
  getStudentSessionStats
);

export default bookingRouter;
