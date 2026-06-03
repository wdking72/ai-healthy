import mongoose from "mongoose";

const consultMessageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ConsultSession",
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ["user", "assistant", "system"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  emotionTag: {
    type: String,
    default: "",
  },
}, {
  timestamps: true,
})

export default mongoose.models.ConsultMessage || mongoose.model("ConsultMessage", consultMessageSchema)
