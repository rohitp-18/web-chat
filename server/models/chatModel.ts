import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  chatName: {
    type: String,
    trim: true,
  },
  isGroup: {
    type: Boolean,
    default: false,
  },
  avatar: {
    url: {
      type: String,
    },
    public_id: {
      type: String,
    },
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
