import AnonymousMessage from "../models/anonymousMessageSchema.js";

const anonymousQueue = [];
const anonymousVideoQueue = [];
const anonymousRooms = new Map();
let onlineAnonymousUsers = 0;

export const setupAnonymousSessionSocket = (io) => {
  const anonNamespace = io.of("/anonymous");

  anonNamespace.on("connection", (socket) => {
    onlineAnonymousUsers++;
    anonNamespace.emit("updateOnlineUsers", { count: onlineAnonymousUsers });
    console.log(`Anonymous session connected: ${socket.id}. Online: ${onlineAnonymousUsers}`);

    // -------------------- Matchmaking --------------------
    const findMatch = ({ userId, meetingMode = "Chat" }) => {
      const queue = meetingMode === "Video" ? anonymousVideoQueue : anonymousQueue;
      let existingMatch = null;

      while (queue.length) {
        const potentialMatch = queue.shift();
        if (anonNamespace.sockets.has(potentialMatch)) {
          existingMatch = potentialMatch;
          break;
        }
      }

      if (existingMatch) {
        const roomId = `anonymous_${userId}_${existingMatch}`;
        socket.join(roomId);
        anonNamespace.sockets.get(existingMatch).join(roomId);

        anonymousRooms.set(socket.id, { roomId, partnerId: existingMatch, meetingMode });
        anonymousRooms.set(existingMatch, { roomId, partnerId: socket.id, meetingMode });

        socket.emit("matchFound", { roomId, meetingMode });
        anonNamespace.to(existingMatch).emit("matchFound", { roomId, meetingMode });
      } else {
        queue.push(socket.id);
      }
    };

    socket.on("findAnonymousMatch", findMatch);

    // -------------------- Messaging --------------------
    socket.on("sendAnonymousMessage", async ({ roomId, senderId, text }, callback) => {
  try {
    const newMsg = new AnonymousMessage({ roomId, senderId, text: text || "" });
    await newMsg.save();

    anonNamespace.to(roomId).emit("newAnonymousMessage", newMsg);
    callback?.({ success: true, message: newMsg });
  } catch (error) {
    console.error("Socket msg save error:", error);
    callback?.({ success: false });
  }
});


    // -------------------- Video Call Signaling --------------------
    socket.on("anonymousCallUser", ({ userToCall, signalData }) => {
      if (anonNamespace.sockets.has(userToCall)) {
        anonNamespace.to(userToCall).emit("anonymousIncomingCall", { signal: signalData, callerId: socket.id });
      }
    });

    socket.on("anonymousAcceptCall", ({ to, signal }) => {
      if (anonNamespace.sockets.has(to)) anonNamespace.to(to).emit("anonymousCallAccepted", signal);
    });

    socket.on("anonymousCallEnded", ({ to }) => {
      if (anonNamespace.sockets.has(to)) anonNamespace.to(to).emit("anonymousCallEnded");
    });

    // -------------------- Skip Partner --------------------
    socket.on("skipAnonymous", ({ roomId }) => {
      if (anonymousRooms.has(socket.id)) {
        const { partnerId, meetingMode } = anonymousRooms.get(socket.id);

        if (anonNamespace.sockets.has(partnerId)) {
          anonNamespace.to(partnerId).emit("partnerDisconnected");
        }

        anonymousRooms.delete(socket.id);
        anonymousRooms.delete(partnerId);

        findMatch({ userId: socket.id, meetingMode });
      }
    });

    // -------------------- Disconnect Handling --------------------
    socket.on("disconnect", () => {
      onlineAnonymousUsers--;
      anonNamespace.emit("updateOnlineUsers", { count: onlineAnonymousUsers });

      [anonymousQueue, anonymousVideoQueue].forEach((q) => {
        const idx = q.indexOf(socket.id);
        if (idx > -1) q.splice(idx, 1);
      });

      if (anonymousRooms.has(socket.id)) {
        const { partnerId } = anonymousRooms.get(socket.id);
        if (anonNamespace.sockets.has(partnerId)) {
          anonNamespace.to(partnerId).emit("partnerDisconnected");
        }
        anonymousRooms.delete(socket.id);
        anonymousRooms.delete(partnerId);
      }

      console.log(`Anonymous session disconnected: ${socket.id}. Online: ${onlineAnonymousUsers}`);
    });
  });
};
