import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/api";

export default function AnonymousChatRoom({ roomId, userId, socket }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!roomId || !socket) return;

    socket.emit("joinAnonymousRoom", { roomId, userId });

    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/anonymous-chat/${roomId}`);
        setMessages(data.messages || []);
      } catch (err) {
        toast.error("Failed to load chat history.");
      }
    };
    fetchMessages();

    const handleNewMessage = (message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    };

    const handleClearChatHistory = () => setMessages([]);
    const handlePartnerDisconnected = () => {
      toast.info("Partner disconnected. Chat cleared.");
      setMessages([]);
    };

    socket.on("newAnonymousMessage", handleNewMessage);
    socket.on("clearChatHistory", handleClearChatHistory);
    socket.on("partnerDisconnected", handlePartnerDisconnected);

    return () => {
      socket.off("newAnonymousMessage", handleNewMessage);
      socket.off("clearChatHistory", handleClearChatHistory);
      socket.off("partnerDisconnected", handlePartnerDisconnected);
    };
  }, [roomId, userId, socket]);

  useEffect(() => scrollToBottom(), [messages]);

  const handleSend = () => {
  if (!newMessage.trim() || !roomId || !socket) return;

  socket.emit(
    "sendAnonymousMessage",
    { roomId, senderId: userId, text: newMessage },
    (response) => {
      if (response?.success) {
        setNewMessage("");
        adjustTextareaHeight();
        scrollToBottom();
      } else {
        toast.error("Failed to send message.");
      }
    }
  );
};


  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustTextareaHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 150) + "px";
    }
  };

  useEffect(() => adjustTextareaHeight(), [newMessage]);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-lg shadow-inner">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-xl max-w-[80%] break-words shadow-sm ${
                msg.senderId === userId
                  ? "bg-blue-500 text-white ml-auto rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 mt-2">
            Start the conversation!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t dark:border-gray-700">
        <div className="flex items-center gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            className="flex-1 border-2 border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white resize-none overflow-y-auto max-h-36"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onInput={adjustTextareaHeight}
            onKeyDown={handleKeyDown}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors"
            onClick={handleSend}
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
