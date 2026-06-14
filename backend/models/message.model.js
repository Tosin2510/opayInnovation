import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    messageBody: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Message", messageSchema);