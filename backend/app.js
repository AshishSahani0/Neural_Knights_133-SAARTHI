import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

// Routes & DB
import connectDB from "./db/db.js";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import bookingRouter from "./routes/bookingRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import adminRouter from "./routes/adminRouter.js";
import chatRouter from "./routes/chatRoutes.js";
import anonymousChatRouter from "./routes/anonymousChatRouter.js";

// Socket handlers (separated)
import { setupBookedSessionSocket } from "./socket/bookedSessionSocket.js";
import { setupAnonymousSessionSocket } from "./socket/anonymousSessionSocket.js";
import journalRouter from "./routes/journalRoutes.js";
import emergencyRouter from "./routes/emergencyRoutes.js";

// Load environment variables
dotenv.config({ quiet: true });

const app = express();
const server = http.createServer(app);

// ------------------- SOCKET.IO -------------------
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

// Setup separate namespaces
setupBookedSessionSocket(io);
setupAnonymousSessionSocket(io);

app.set("io", io); // make io accessible in controllers if needed

// ------------------- DATABASE -------------------
connectDB();

// ------------------- MIDDLEWARE -------------------
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------- API ROUTES -------------------
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/chat", chatRouter);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/anonymous-chat", anonymousChatRouter);
app.use("/api/journal", journalRouter); 
app.use("/api/emergency", emergencyRouter); 

// ------------------- HEALTH CHECK -------------------
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});

// ------------------- ERROR HANDLER -------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ------------------- EXPORT -------------------
export { app, server };
