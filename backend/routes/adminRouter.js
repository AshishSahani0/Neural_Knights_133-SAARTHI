import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import { getAdminOverview } from "../controllers/userController.js";

const adminRouter = express.Router();

// --- MainAdmin Dashboard Route ---
adminRouter.get(
  "/overview",
  isAuthenticated,
  isAuthorized("MainAdmin"),
  getAdminOverview
);

export default adminRouter;
