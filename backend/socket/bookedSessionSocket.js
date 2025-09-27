import Message from "../models/messageSchema.js";
import User from "../models/userSchema.js";
import mongoose from "mongoose";

let onlineBookedUsers = 0;

export const setupBookedSessionSocket = (io) => {
  const bookedNamespace = io.of("/booked");

  bookedNamespace.on("connection", (socket) => {
    onlineBookedUsers++;
    bookedNamespace.emit("updateOnlineUsers", { count: onlineBookedUsers });
    //console.log(`Booked session connected: ${socket.id}. Online: ${onlineBookedUsers}`);

    // -------------------- Identify user --------------------
    socket.on("identify", ({ userId, role }) => {
      if (role === "CollegePsychologist") socket.join("psychologists");
      socket.userId = userId;
      //console.log(`User ${userId} identified as ${role}`);
    });

    // -------------------- Join room --------------------
    socket.on("joinRoom", ({ roomId, user, bookingId }) => {
      socket.join(roomId);
      //console.log(`${user.username} joined room ${roomId}`);
    });

    // -------------------- Typing indicators --------------------
    socket.on("typing", ({ roomId, user }) => {
      socket.to(roomId).emit("userTyping", { userId: user._id });
    });

    socket.on("stopTyping", ({ roomId, userId }) => {
      socket.to(roomId).emit("userStopTyping", { userId });
    });

    // -------------------- Send message --------------------
    socket.on("sendMessage", async ({ roomId, sender, text, bookingId, fileUrl, fileType, isAnonymous }) => {
      if (!sender?._id || !mongoose.Types.ObjectId.isValid(sender._id)) return;
      const senderToSave = isAnonymous ? null : sender._id;

      const newMsg = new Message({
        roomId,
        sender: senderToSave,
        text: text || "",
        booking: bookingId,
        fileUrl: fileUrl || null,
        fileType: fileType || null,
      });

      await newMsg.save();

      let populatedMessage;
      if (isAnonymous) {
        const userDoc = await User.findById(sender._id);
        populatedMessage = {
          ...newMsg.toObject(),
          sender: {
            _id: userDoc._id,
            username: userDoc.username,
            profileImage: userDoc.profileImage || null,
          },
        };
      } else {
        populatedMessage = await newMsg.populate("sender", "username profileImage");
      }

      bookedNamespace.to(roomId).emit("newMessage", populatedMessage);
    });

    // -------------------- Disconnect --------------------
    socket.on("disconnect", () => {
      onlineBookedUsers--;
      bookedNamespace.emit("updateOnlineUsers", { count: onlineBookedUsers });
      //console.log(`Booked session disconnected: ${socket.id}. Online: ${onlineBookedUsers}`);
    });
  });
};