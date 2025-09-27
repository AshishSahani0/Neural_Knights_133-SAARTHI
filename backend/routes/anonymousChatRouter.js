import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { 
  getAnonymousMessagesByRoom, 
  postAnonymousMessage,
  deleteAnonymousMessagesByRoom,
} from "../controllers/anonymousChatController.js";

const anonymousChatRouter = express.Router();

// Get all messages for a specific anonymous room
anonymousChatRouter.get("/:roomId", isAuthenticated, getAnonymousMessagesByRoom);

// Post a new message to an anonymous room
anonymousChatRouter.post("/:roomId", isAuthenticated, postAnonymousMessage);

// Delete all messages for a specific anonymous room
anonymousChatRouter.delete("/:roomId", isAuthenticated, deleteAnonymousMessagesByRoom);

export default anonymousChatRouter;
