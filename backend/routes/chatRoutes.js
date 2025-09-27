import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { 
    getMessagesByRoom, 
    postMessage, 
    deleteMessagesByBooking, 
    uploadFile,
    cleanupMessagesByBooking // ✅ for internal use if needed
} from "../controllers/chatController.js";
import { uploadChatFile } from "../middlewares/multer.js"; 

const chatRouter = express.Router();

// ----------------------------
// GET ALL MESSAGES BY ROOM
// ----------------------------
chatRouter.get("/:roomId", isAuthenticated, getMessagesByRoom);

// ----------------------------
// POST A NEW TEXT MESSAGE
// ----------------------------
chatRouter.post("/:roomId", isAuthenticated, postMessage);

// ----------------------------
// DELETE ALL MESSAGES (AND FILES) FOR A BOOKING
// Manual deletion by authorized user
// ----------------------------
chatRouter.delete("/:bookingId", isAuthenticated, deleteMessagesByBooking);

// ----------------------------
// UPLOAD A FILE (PHOTO/AUDIO) AND CREATE A MESSAGE
// ----------------------------
chatRouter.post(
    "/:roomId/upload", 
    isAuthenticated, 
    uploadChatFile.single('file'), 
    uploadFile
);

export default chatRouter;
