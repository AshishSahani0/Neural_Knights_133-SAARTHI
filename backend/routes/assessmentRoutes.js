import express from "express";
import { submitAssessment, getAssessmentsForStudent } from "../controllers/assessmentController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const  assessmentRoutes = express.Router();

assessmentRoutes.post("/", isAuthenticated, submitAssessment);
assessmentRoutes.get("/student", isAuthenticated, getAssessmentsForStudent);

export default assessmentRoutes;
