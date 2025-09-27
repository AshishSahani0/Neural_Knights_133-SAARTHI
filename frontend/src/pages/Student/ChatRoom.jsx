import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import api from "../../api/api";
import {
  addMessage,
  setActiveRoomId,
  fetchChatHistory,
} from "../../redux/slices/chatSlice";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import bookedSocket from "../../socket/bookedSocket";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
const getFullUrl = (url) => (url ? `${SOCKET_URL}${url}` : "");

export default function ChatRoom({ roomId, user, booking }) {
  const { messages, activeRoomId, loading } = useSelector(
    (state) => state.chat
  );
  const dispatch = useDispatch();
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isSendingFile, setIsSendingFile] = useState(false);

  const messagesEndRef = useRef();
  const messagesContainerRef = useRef();
  const fileInputRef = useRef();
  const audioChunks = useRef([]);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isAtBottom =
      container.scrollHeight - container.clientHeight <=
      container.scrollTop + 1;
    if (isAtBottom || messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    if (!activeRoomId) {
      toast.error("Cannot send message: No active session.");
      return;
    }

    const payload = {
      roomId: activeRoomId,
      sender: user,
      text: newMessage,
      bookingId: booking._id,
      isAnonymous: booking.anonymous,
    };

    setNewMessage("");
    setShowEmojiPicker(false);
    bookedSocket.emit("sendMessage", payload);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    // Send typing event
    bookedSocket.emit("typing", { roomId: activeRoomId, user });
    // Reset typing timeout
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      bookedSocket.emit("stopTyping", { roomId: activeRoomId });
    }, 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsSendingFile(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sender", user._id);
    formData.append("bookingId", booking._id);
    formData.append("isAnonymous", booking.anonymous.toString());
    formData.append("roomId", activeRoomId);

    try {
      await api.post(`/chat/${activeRoomId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload file.");
    } finally {
      setIsSendingFile(false);
      fileInputRef.current.value = null;
    }
  };

  const triggerFileInput = () => fileInputRef.current.click();

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunks.current = [];
      recorder.addEventListener("dataavailable", (e) =>
        audioChunks.current.push(e.data)
      );

      recorder.addEventListener("stop", async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/mp4" });
        audioChunks.current = [];
        const formData = new FormData();
        formData.append("file", audioBlob, `voice-message-${Date.now()}.mp4`);
        formData.append("sender", user._id);
        formData.append("bookingId", booking._id);
        formData.append("isAnonymous", booking.anonymous.toString());
        formData.append("roomId", activeRoomId);

        try {
          await api.post(
            `/chat/${activeRoomId}/upload`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
          // The socket event is now handled on the backend
        } catch (err) {
          console.error(err);
          toast.error("Failed to upload voice message.");
        }
      });
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
      toast.error(
        "Failed to start voice recording. Check your microphone permissions."
      );
    }
  };

  const handleStopRecording = () => {
    if (!mediaRecorder) return;
    mediaRecorder.stop();
    setIsRecording(false);
  };

  // Socket setup
  useEffect(() => {
    if (!roomId || !user?._id) return;

    dispatch(setActiveRoomId(roomId));
    dispatch(fetchChatHistory(roomId));

    // Join the room on component mount
    bookedSocket.emit("joinRoom", { roomId, user, bookingId: booking._id });

    // Handle new messages from the socket
    const handleNewMessage = (message) => {
      dispatch(addMessage(message));
      scrollToBottom();
    };

    // Handle typing status
    const handleUserTyping = ({ user: typingUserData }) => {
      // ✅ FIX: Added a null/undefined check for typingUserData
      if (typingUserData && typingUserData._id !== user._id) {
        setTypingUser(typingUserData.username);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 2000);
      }
    };

    const handleUserStopTyping = () => {
      setTypingUser(null);
    };

    bookedSocket.on("newMessage", handleNewMessage);
    bookedSocket.on("userTyping", handleUserTyping);
    bookedSocket.on("userStopTyping", handleUserStopTyping);

    // Cleanup on unmount
    return () => {
      bookedSocket.off("newMessage", handleNewMessage);
      bookedSocket.off("userTyping", handleUserTyping);
      bookedSocket.off("userStopTyping", handleUserStopTyping);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [roomId, user, booking, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading)
    return <div className="p-4 text-center">Loading messages...</div>;

  return (
    <div className="flex flex-col h-full relative p-2 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto space-y-4 px-4 py-2"
      >
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg._id || msg.createdAt}
              className={`p-3 rounded-xl max-w-[80%] break-words shadow-sm ${
                msg.sender?._id === user._id
                  ? "bg-blue-500 text-white ml-auto rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.fileUrl ? (
                msg.fileType.startsWith("image/") ? (
                  <img
                    src={msg.fileUrl}
                    alt="Uploaded"
                    className="max-w-full h-auto rounded-lg"
                  />
                ) : (
                  <audio src={msg.fileUrl} controls className="w-full mt-2" />
                )
              ) : (
                <div>{msg.text}</div>
              )}
              <span className={`block mt-1 text-right text-xs opacity-70`}>
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 mt-2">
            Start the conversation!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-gray-50 rounded-b-lg border-t dark:bg-gray-700 dark:border-gray-600">
        {typingUser && (
          <div className="text-sm text-gray-500 px-2 pb-1 italic dark:text-gray-400">
            User is typing...
          </div>
        )}
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="text-2xl p-2 rounded-full hover:bg-gray-200 transition-colors dark:hover:bg-gray-600"
            title="Emoji"
          >
            😊
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-14 left-0 z-50">
              <Picker
                data={data}
                onEmojiSelect={(emoji) => {
                  setNewMessage((prev) => prev + emoji.native);
                  setShowEmojiPicker(false);
                }}
                theme="light"
              />
            </div>
          )}

          <button
            onClick={triggerFileInput}
            className="text-2xl p-2 rounded-full hover:bg-gray-200 transition-colors dark:hover:bg-gray-600"
            title="Attach File"
            disabled={isSendingFile || isRecording}
          >
            📎
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
            accept="image/*, audio/*"
          />

          <input
            type="text"
            className="flex-1 border-2 border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            placeholder="Type your message..."
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isSendingFile || isRecording}
          />

          {!isRecording ? (
            <button
              className="text-2xl p-2 rounded-full hover:bg-gray-200 transition-colors dark:hover:bg-gray-600"
              title="Record Voice"
              onClick={handleStartRecording}
              disabled={isSendingFile || newMessage.length > 0}
            >
              🎙️
            </button>
          ) : (
            <button
              className="text-2xl p-2 rounded-full text-red-500 animate-pulse"
              title="Stop Recording"
              onClick={handleStopRecording}
            >
              ⏹️
            </button>
          )}

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors"
            onClick={handleSend}
            disabled={
              isSendingFile || isRecording || newMessage.trim().length === 0
            }
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}