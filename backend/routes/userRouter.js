import express from "express";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/authMiddleware.js";
import {
  registerInstitute,
  getAllInstitutions,
  getAllStudents,
  updateProfileByAdmin,
  deleteEntityByAdmin,
  registerPsychologist,
  getAllPsychologists,
  updateProfile,
  getAllUsers,
  getAdminOverview,
  getPsychologistsForStudent,
} from "../controllers/userController.js";
import { uploadProfile } from "../middlewares/multer.js";

const userRouter = express.Router();

// General user profile update (for self)
userRouter.put(
  "/update-profile",
  isAuthenticated,
  uploadProfile.single("profileImage"),
  updateProfile
);

// --- MainAdmin Routes ---
userRouter.post(
  "/register-institute",
  isAuthenticated,
  isAuthorized("MainAdmin"),
  registerInstitute
);
userRouter.get(
  "/all-institutes",
  isAuthenticated,
  isAuthorized("MainAdmin"),
  getAllInstitutions
);

// --- InstitutionAdmin Routes ---
userRouter.post(
  "/register-psychologist",
  isAuthenticated,
  isAuthorized("InstitutionAdmin"),
  registerPsychologist
);

// --- Shared Admin Routes (MainAdmin & InstitutionAdmin) ---
userRouter.get(
  "/all-students",
  isAuthenticated,
  isAuthorized("MainAdmin", "InstitutionAdmin"),
  getAllStudents
);
userRouter.get(
  "/all-psychologists",
  isAuthenticated,
  isAuthorized("InstitutionAdmin", "MainAdmin", "Student"),
  getAllPsychologists
);
userRouter.put(
  "/admin/update-profile/:id",
  isAuthenticated,
  isAuthorized("MainAdmin", "InstitutionAdmin"),
  updateProfileByAdmin
);
userRouter.delete(
  "/admin/delete/:targetId",
  isAuthenticated,
  isAuthorized("MainAdmin", "InstitutionAdmin"),
  deleteEntityByAdmin
);

// In routes/userRouter.js

userRouter.get("/all", isAuthenticated, isAuthorized("MainAdmin"), getAllUsers);

userRouter.get(
  "/overview",
  isAuthenticated,
  isAuthorized("MainAdmin"),
  getAdminOverview
);


userRouter.get("/student/psychologists",isAuthenticated,getPsychologistsForStudent);

export default userRouter;
