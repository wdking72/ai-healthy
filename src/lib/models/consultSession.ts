import mongoose from "mongoose";

const consultSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  title: {
    type: String,
    default: "新对话",
  },
  summary: {
    type: String,
    default: "",
  },
  modelSource: {
    type: String,
    default: "siliconflow",
  },
  modelName: {
    type: String,
    default: "DeepSeek-V2",
  },
  crisisFlagged: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
})

export default mongoose.models.ConsultSession || mongoose.model("ConsultSession", consultSessionSchema)
