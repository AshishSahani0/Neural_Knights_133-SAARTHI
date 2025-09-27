import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import {
  createJournalPost,
  getJournalPosts,
  likePost,
  commentOnPost,
  connectToPostAuthor,
} from "../controllers/journalPostController.js";

const journalRouter = express.Router();

journalRouter.post("/posts", isAuthenticated, createJournalPost);
journalRouter.get("/posts", isAuthenticated, getJournalPosts);
journalRouter.post("/posts/:postId/like", isAuthenticated, likePost);
journalRouter.post("/posts/:postId/comment", isAuthenticated, commentOnPost);
journalRouter.post("/connect/:postId", isAuthenticated, connectToPostAuthor);

export default journalRouter;