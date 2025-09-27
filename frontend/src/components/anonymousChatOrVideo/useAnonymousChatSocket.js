import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const useAnonymousChatSocket = () => {
  const { user } = useSelector((state) => state.auth);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const socketRef = useRef(null);
  const myTempId = useRef(user?._id || null);

  useEffect(() => {
    if (!myTempId.current) return;

    // Use VITE_SOCKET_URL
    socketRef.current = io(`${import.meta.env.VITE_SOCKET_URL}/anonymous`, {
      transports: ["websocket"],
      autoConnect: true,
    });

    socketRef.current.emit("identify", {
      userId: myTempId.current,
      role: user.role,
    });

    const handleOnlineUsers = ({ count }) => setOnlineUsers(count);
    const handlePartnerDisconnected = () => {
      toast.info("Your partner disconnected. Searching for a new one...");
    };

    socketRef.current.on("updateOnlineUsers", handleOnlineUsers);
    socketRef.current.on("partnerDisconnected", handlePartnerDisconnected);

    return () => {
      socketRef.current.disconnect();
    };
  }, [user]);

  return { onlineUsers, socket: socketRef.current };
};

export default useAnonymousChatSocket;