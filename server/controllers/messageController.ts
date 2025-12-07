import asyncHandler from "express-async-handler";
import Message from "../models/messageModel";
import Chat from "../models/chatModel";
import User from "../models/userModel";

const message = asyncHandler(async (req, res, next) => {
  let { chatId } = req.params;

  const message = await Message.find({ chat: chatId })
    .populate("sender", "name email")
    .populate("chat");

  res.json({
    success: true,
    message,
  });
});

const createMessage = asyncHandler(async (req, res, next) => {
  let { chatId, content } = req.body;

  if (!chatId || !content) {
    throw new Error("Please provide chatId and content");
  }

  let message: any = await Message.create({
    content,
    sender: req.user._id,
    chat: chatId,
  });

  message = await message.populate("sender", "name email");
  message = await message.populate("chat");
  message = await User.populate(message, {
    path: "chat.users",
    select: "name email",
  });

  await Chat.findByIdAndUpdate(
    chatId,
    {
      latestMessage: message,
    },
    {
      new: true,
    }
  );

  res.json({
    success: true,
    message,
  });
});

export { createMessage, message };
