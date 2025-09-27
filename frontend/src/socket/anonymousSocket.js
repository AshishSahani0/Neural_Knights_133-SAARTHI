// src/socket/anonymousSocket.js
import { io } from "socket.io-client";
import store from "../redux/store";
import {
  setAnonymousStatus,
  setAnonymousRoomId,
  setAnonymousRemotePeerId,
  clearAnonymousSession,
} from "../redux/slices/anonymousSlice";
import { toast } from "react-toastify";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const anonymousSocket = io(`${SOCKET_URL}/anonymous`, {
  autoConnect: false, // <-- This ensures it doesn't connect automatically
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

// REMOVE: setTimeout block that forces the connection.
// setTimeout(() => {
//   if (!anonymousSocket.connected) anonymousSocket.connect();
// }, 500); 

// -------------------- Anonymous session events --------------------
anonymousSocket.on("matchFound", ({ roomId, peerId }) => {
  store.dispatch(setAnonymousRoomId(roomId));
  store.dispatch(setAnonymousRemotePeerId(peerId));
  store.dispatch(setAnonymousStatus("matched"));
});

anonymousSocket.on("callOffer", (offer, fromPeerId) => {
  store.dispatch(setAnonymousRemotePeerId(fromPeerId));
  store.dispatch(setAnonymousStatus("receiving"));
});

anonymousSocket.on("callAnswer", () => store.dispatch(setAnonymousStatus("chatting")));
anonymousSocket.on("iceCandidate", (candidate) => {});
anonymousSocket.on("callEnded", () => store.dispatch(clearAnonymousSession()));

// Note: These connect/disconnect toasts will now only fire when the user actively opens the modal.
anonymousSocket.on("connect", () => toast.success("Connected to anonymous chat"));
anonymousSocket.on("disconnect", () => toast.warn("Disconnected from anonymous chat"));

export default anonymousSocket;