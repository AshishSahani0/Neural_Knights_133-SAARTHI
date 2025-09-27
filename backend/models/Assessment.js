import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  answers: [Number],
  phqScore: Number,
  gadScore: Number,
  ghqScore: Number,
  feedback: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Assessment", assessmentSchema);
