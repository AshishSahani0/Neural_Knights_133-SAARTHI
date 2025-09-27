// src/components/common/FloatingActions.jsx
import React, { useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import CrisisModal from "../components/emergency/CrisisModal";
import AnonymousChatOrCall from "../components/anonymousChatOrVideo/AnonymousChatOrCall";
import ChatlingBot from "../components/chatbot/ChatlingBot";
import useAnonymousChatSocket from "../hooks/useAnonymousChatSocket";
import { useSelector } from "react-redux";

export default function FloatingActions() {
    const { user } = useSelector(state => state.auth);
    const { onlineUsers, socket, connect, disconnect } = useAnonymousChatSocket();
    
    const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
    const [isAnonymousModalOpen, setIsAnonymousModalOpen] = useState(false);
    
    const isStudent = user?.role === "Student";

    const handleOpenAnonymousChat = () => {
        connect();
        setIsAnonymousModalOpen(true);
    };

    const handleCloseAnonymousChat = () => {
        disconnect();
        setIsAnonymousModalOpen(false);
    };

    return (
        <>
            {/* The main container for the two buttons, positioned to stack above Chatling */}
            <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end space-y-4">
                
                {/* Crisis Button */}
                {isStudent && (
                    <button
                        onClick={() => setIsCrisisModalOpen(true)}
                        className="p-4 rounded-full shadow-lg bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        aria-label="Emergency Help"
                        title="Crisis/Emergency Alert"
                    >
                        <ExclamationTriangleIcon className="h-6 w-6" />
                    </button>
                )}

                {/* Anonymous Chat Button */}
                {isStudent && (
                    <button
                        onClick={handleOpenAnonymousChat}
                        className="relative p-4 rounded-full shadow-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        aria-label="Start Anonymous Chat"
                        title="Anonymous Chat"
                    >
                        <ChatBubbleLeftRightIcon className="h-6 w-6" />
                        {onlineUsers > 0 && (
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-600 text-xs font-bold text-white transform translate-x-1/4 -translate-y-1/4">
                                {onlineUsers}
                            </span>
                        )}
                    </button>
                )}
            </div>
            
            {/* The ChatlingBot component is rendered separately to maintain its own fixed position */}
            <ChatlingBot />

            {/* Modals for Crisis and Anonymous Chat */}
            {isCrisisModalOpen && (
                <CrisisModal
                    isOpen={isCrisisModalOpen}
                    onClose={() => setIsCrisisModalOpen(false)}
                />
            )}

            {isAnonymousModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70">
                    <div className="relative w-full h-full max-w-4xl max-h-[80vh] rounded-lg shadow-2xl overflow-hidden">
                        <button
                            onClick={handleCloseAnonymousChat}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                        <AnonymousChatOrCall onClose={handleCloseAnonymousChat} onlineUsers={onlineUsers} socket={socket} />
                    </div>
                </div>
            )}
        </>
    );
}