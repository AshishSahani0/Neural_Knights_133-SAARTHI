import AnonymousMessage from "../models/anonymousMessageSchema.js";

// GET Messages by Room
export const getAnonymousMessagesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await AnonymousMessage.find({ roomId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
};

// POST a New Text Message
export const postAnonymousMessage = async (req, res) => {
  try {
    const { senderId, text } = req.body;
    const { roomId } = req.params;

    if (!roomId || !senderId || !text) {
      return res.status(400).json({
        success: false,
        message: "roomId, senderId, and text are required",
      });
    }

    const newMessage = new AnonymousMessage({ roomId, senderId, text });
    await newMessage.save();

    const io = req.app.get("io");
    if (io) {
      const anonNamespace = io.of("/anonymous");
      anonNamespace.to(roomId).emit("newAnonymousMessage", newMessage); // ✅ this is the fix
    }

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Failed to send message:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

// DELETE Messages by Room
export const deleteAnonymousMessagesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    await AnonymousMessage.deleteMany({ roomId });
    res.status(200).json({ success: true, message: "Chat history deleted successfully" });
  } catch (error) {
    console.error("Failed to delete messages:", error);
    res.status(500).json({ success: false, message: "Failed to delete chat history" });
  }
};
