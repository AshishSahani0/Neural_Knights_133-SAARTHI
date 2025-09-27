import Message from "../models/messageSchema.js";
import User from "../models/userSchema.js";
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from "../config/cloudinary.js";

// -------------------- DELETE Messages by Booking --------------------
export const deleteMessagesByBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        await cleanupMessagesByBooking(bookingId);
        res.status(200).json({ success: true, message: `Messages for booking ${bookingId} deleted.` });
    } catch (error) {
        console.error("Failed to delete messages:", error);
        res.status(500).json({ success: false, message: "Failed to delete messages" });
    }
};

// -------------------- CLEANUP Messages & Files --------------------
export const cleanupMessagesByBooking = async (bookingId) => {
    try {
        const messages = await Message.find({ booking: bookingId, fileUrl: { $ne: null } });
        for (const msg of messages) {
            const publicId = getPublicIdFromUrl(msg.fileUrl);
            await deleteFromCloudinary(publicId);
            console.log(`[AUTO DELETE] File removed: ${publicId}`);
        }
        await Message.deleteMany({ booking: bookingId });
        console.log(`[AUTO DELETE] Messages deleted for booking ${bookingId}`);
    } catch (error) {
        console.error("Failed to auto delete messages:", error);
    }
};

// -------------------- GET Messages by Room --------------------
export const getMessagesByRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const messages = await Message.find({ roomId })
            .populate("sender", "username profileImage")
            .sort({ createdAt: 1 });
        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error("Failed to fetch messages:", error);
        res.status(500).json({ success: false, message: "Failed to fetch messages" });
    }
};

// -------------------- POST a New Text Message --------------------
export const postMessage = async (req, res) => {
    try {
        const { sender, text, bookingId, isAnonymous } = req.body;
        const { roomId } = req.params;

        if (!roomId || !sender || (!text && !bookingId)) {
            return res.status(400).json({ success: false, message: "roomId, sender, and text or bookingId required" });
        }

        const senderToSave = isAnonymous === "true" ? null : sender;

        const newMessage = new Message({
            roomId,
            sender: senderToSave,
            text: text || "",
            booking: bookingId,
        });

        await newMessage.save();

        let populatedMessage;
        if (isAnonymous === "true") {
            const userDoc = await User.findById(sender);
            populatedMessage = {
                ...newMessage.toObject(),
                sender: { _id: userDoc._id, username: userDoc.username, profileImage: userDoc.profileImage || null },
            };
        } else {
            populatedMessage = await newMessage.populate("sender", "username profileImage");
        }

        const io = req.app.get("io");
        if (io) io.to(roomId).emit("newMessage", populatedMessage);

        res.status(201).json({ success: true, message: populatedMessage });
    } catch (error) {
        console.error("Failed to send message:", error);
        res.status(500).json({ success: false, message: "Failed to send message" });
    }
};

// -------------------- UPLOAD a File Message --------------------

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });

        const { roomId } = req.params;
        const { sender, bookingId, isAnonymous, text } = req.body;

        if (!roomId || !sender || !bookingId) return res.status(400).json({ success: false, message: "roomId, sender, bookingId required" });

        // Update the call to use the correct folder
        const cloudinaryResult = await uploadToCloudinary(req.file.buffer, { folder: "SAARTHI/chat_uploads" });
        const fileUrl = cloudinaryResult.secure_url;
        const fileType = req.file.mimetype;

        const senderToSave = isAnonymous === "true" ? null : sender;
        const newMessage = new Message({ roomId, sender: senderToSave, text: text || "", fileUrl, fileType, booking: bookingId });

        await newMessage.save();

        let populatedMessage;
        if (isAnonymous === "true") {
            const userDoc = await User.findById(sender);
            populatedMessage = { ...newMessage.toObject(), sender: { _id: userDoc._id, username: userDoc.username, profileImage: userDoc.profileImage || null } };
        } else {
            populatedMessage = await newMessage.populate("sender", "username profileImage");
        }

        const io = req.app.get("io");
        if (io) io.to(roomId).emit("newMessage", populatedMessage);

        res.status(201).json({ success: true, message: populatedMessage });
    } catch (error) {
        console.error("Failed to upload file message:", error);
        res.status(500).json({ success: false, message: "Failed to upload file message" });
    }
};