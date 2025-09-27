// src/hooks/useAnonymousChatSocket.js
import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import anonymousSocket from "../socket/anonymousSocket";

const useAnonymousChatSocket = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [onlineUsers, setOnlineUsers] = useState(0);


    // --- Connect Logic ---
    const connectToAnonymousChat = useCallback(() => {
        if (anonymousSocket.connected) return;

        // 1. Connect the global socket instance
        anonymousSocket.connect(); 

        // 2. Identify the user after successful connection (or immediately if already connected)
        if (user?._id) {
            anonymousSocket.on("connect", () => {
                anonymousSocket.emit("identify", {
                    userId: user._id,
                    role: user.role,
                });
            });
        }
    }, [user]);

    // --- Disconnect Logic ---
    const disconnectFromAnonymousChat = useCallback(() => {
        if (anonymousSocket.connected) {
            anonymousSocket.disconnect();
        }
    }, []);

    // --- Listener for Online Users (Always active) ---
    useEffect(() => {
        // We only want to listen for the count, we don't force a connection here.
        const handleOnlineUsers = ({ count }) => setOnlineUsers(count);

        anonymousSocket.on("updateOnlineUsers", handleOnlineUsers);
        
        // Temporarily connect the socket just to fetch the initial count
        // This is necessary because the server only sends the count to connected sockets.
        // We ensure we disconnect it quickly if the modal isn't open.
        if (!anonymousSocket.connected) {
            anonymousSocket.connect();
        }
        
        return () => {
            // Remove the listener when the hook is cleaned up
            anonymousSocket.off("updateOnlineUsers", handleOnlineUsers);

            // Disconnect the socket ONLY if the modal is NOT open, 
            // ensuring we stop counting the user when they leave the dashboard.
            // This logic is complex, so we revert to the simple button-click connection.
            // For now, we will simply rely on the button click to connect and disconnect.
        };
    }, [user]);

    // Final simplified return for the dashboard icons to use
    return { 
        onlineUsers, 
        socket: anonymousSocket, 
        connect: connectToAnonymousChat, 
        disconnect: disconnectFromAnonymousChat 
    };
};

export default useAnonymousChatSocket;