import mongoose from "mongoose";

const anonymousMessageSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true
    },
    text: {
      type: String,
      trim: true,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: '1h' }
    },
  },
  {
    timestamps: false,
  }
);

export default mongoose.model("AnonymousMessage", anonymousMessageSchema);