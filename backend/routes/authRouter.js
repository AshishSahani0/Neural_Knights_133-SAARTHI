import express from "express";
import {
  registerUser,
  verifyOTP,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  updatePassword,
  resendOTP,
  getMe,
  refreshToken,
} from "../controllers/authController.js";
import { isAuthenticated, isRefreshTokenAuthenticated } from "../middlewares/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/verify-otp", verifyOTP);
authRouter.post("/login", loginUser);
authRouter.get("/logout", isAuthenticated, logoutUser);
authRouter.post("/forgot-password", forgotPassword);
authRouter.put("/reset-password/:token", resetPassword);
authRouter.put("/update-password", isAuthenticated, updatePassword);
authRouter.post("/resend-otp", resendOTP);
authRouter.get("/me", isAuthenticated, getMe);


// New refresh token route
authRouter.post("/refresh-token", isRefreshTokenAuthenticated, refreshToken);

export default authRouter;