import asyncHandler from "express-async-handler";
import Message from "../models/messageModel";
import Chat from "../models/chatModel";
import User from "../models/userModel";
import ErrorHandler from "../utils/ErrorHandler";

const message = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;

  let message: any = await Message.find({ chat: chatId })
    .populate("sender", "-password")
    .populate("chat")
    .populate("parentMessage");

  message = await User.populate(message, {
    path: "parentMessage.sender",
    select: "-password",
  });

  await Promise.all(
    message.map(async (msg: any) => {
      if (msg.read.includes(req.user._id) === false) {
        msg.read.push(req.user._id);
        await msg.save();
      }
    })
  );

  res.json({
    success: true,
    message,
  });
});

const createMessage = asyncHandler(async (req, res, next) => {
  let { chatId, content, parentMessage } = req.body;

  if (!chatId || !content) {
    return next(new ErrorHandler("Invalid data passed into request", 400));
  }

  let message: any = await Message.create({
    content,
    sender: req.user._id,
    chat: chatId,
    parentMessage,
    read: [req.user._id],
  });

  message = await message.populate("sender", "-password");
  message = await message.populate("chat");
  message = await User.populate(message, {
    path: "chat.users",
    select: "-password",
  });
  message = await message.populate("parentMessage");

  message = await User.populate(message, {
    path: "parentMessage.sender",
    select: "-password",
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

const deleteMessage = asyncHandler(async (req, res, next) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);

  if (!message) {
    return next(new ErrorHandler("Message not found", 404));
  }

  message.isDeleted = true;
  message.deletedContent = message.content;
  message.content = "This message has been deleted.";
  await message.save();

  res.json({
    success: true,
    message: "Message deleted successfully",
  });
});

export { createMessage, message, deleteMessage };
