import express from "express";
import { isAuthenticated, isStudent } from "../middlewares/authMiddleware.js";
import { sendEmergencyAlert } from "../controllers/emergencyController.js";

const emergencyRouter = express.Router();

emergencyRouter.post("/alert", isAuthenticated, isStudent, sendEmergencyAlert);

export default emergencyRouter;