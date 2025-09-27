import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import AnonymousChatRoom from "./AnonymousChatRoom";
import AnonymousVideoCall from "./AnonymousVideoCall";
import api from "../../api/api";
import { XCircleIcon } from "@heroicons/react/24/solid";

export default function AnonymousChatOrCall({ onClose = () => {} }) {
  const { user } = useSelector((state) => state.auth);
  const [sessionState, setSessionState] = useState("idle");
  const [roomId, setRoomId] = useState(null);
  const [isMatchFound, setIsMatchFound] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const myTempId = useRef(user?._id || null);
  const socketRef = useRef(null);

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

    const handleMatchFound = ({ roomId }) => {
      setRoomId(roomId);
      setIsMatchFound(true);
      setSessionState("matched");
      toast.success("Match found! You are now connected.");
    };

    const handlePartnerDisconnected = () => {
      toast.info("Your partner disconnected. Searching for a new one...");
      requeueForMatch();
    };

    const handleOnlineUsers = ({ count }) => setOnlineUsers(count);

    socketRef.current.on("matchFound", handleMatchFound);
    socketRef.current.on("partnerDisconnected", handlePartnerDisconnected);
    socketRef.current.on("updateOnlineUsers", handleOnlineUsers);

    return () => {
      socketRef.current.disconnect();
    };
  }, [user]);

  const findNewMatch = () => {
    if (!socketRef.current) return;
    setSessionState("connecting");
    setIsMatchFound(false);
    setRoomId(null);
    socketRef.current.emit("findAnonymousMatch", { userId: myTempId.current });
  };

  const requeueForMatch = async () => {
    if (roomId && socketRef.current) {
      try {
        await api.delete(
          `${import.meta.env.VITE_API_URL}/anonymous-chat/${roomId}`
        );
        socketRef.current.emit("skipAnonymous", { roomId });
      } catch (err) {
        console.error("Failed to skip previous chat:", err);
      }
    }
    findNewMatch();
  };

  const endSession = async () => {
    if (roomId && socketRef.current) {
      try {
        await api.delete(
          `${import.meta.env.VITE_API_URL}/anonymous-chat/${roomId}`
        );
        socketRef.current.emit("skipAnonymous", { roomId });
      } catch (err) {
        console.error("Failed to end session:", err);
      }
    }
    setSessionState("idle");
    setRoomId(null);
    setIsMatchFound(false);
    onClose();
  };

  return (
    <div className="h-full max-h-screen flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex-1 flex items-center gap-2">
          Anonymous Chat & Video
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            ({onlineUsers} online)
          </span>
        </h2>

        {isMatchFound && (
          <button
            onClick={requeueForMatch}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors mr-2"
          >
            Skip
          </button>
        )}

        <button
          onClick={endSession}
          className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-700 transition"
          title="End Session"
        >
          <XCircleIcon className="h-8 w-8 text-red-600" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden">
        {!isMatchFound && sessionState === "idle" && (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">
              Find a new anonymous partner.
            </p>
            <button
              onClick={findNewMatch}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
            >
              Start Anonymous Session
            </button>
          </div>
        )}

        {sessionState === "connecting" && (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Searching for a partner...
            </p>
          </div>
        )}

        {isMatchFound && (
          <div className="flex flex-col md:flex-row gap-4 h-full p-4">
            <div className="flex-1 flex flex-col h-[50vh] md:h-full overflow-hidden">
              <AnonymousVideoCall
                roomId={roomId}
                userId={myTempId.current}
                socket={socketRef.current}
              />
            </div>
            <div className="flex-1 flex flex-col h-[50vh] md:h-full overflow-hidden">
              <AnonymousChatRoom
                roomId={roomId}
                userId={myTempId.current}
                socket={socketRef.current}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
