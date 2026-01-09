import asyncHandler from "express-async-handler";
import Message from "../models/messageModel";
import Chat from "../models/chatModel";
import User from "../models/userModel";
import ErrorHandler from "../utils/ErrorHandler";
import sendNotification from "../utils/sendNotification";
import sendInfoMessage from "../utils/sendInfoMessage";

const message = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;

  let message: any = await Message.find({
    chat: chatId,
    users: { $in: [req.user._id] },
  })
    .populate("sender", "-password")
    .populate("recieverUser", "-password")
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

  const chat = await Chat.findById(chatId);

  if (!chat) {
    return next(new ErrorHandler("Chat not found", 404));
  }

  if (chat.blockedChat) {
    return next(new ErrorHandler("Cannot send message to a blocked chat", 403));
  }

  if (chat.users.indexOf(req.user._id) === -1) {
    return next(new ErrorHandler("You are not a member of this chat", 403));
  }

  let message: any = await Message.create({
    content,
    sender: req.user._id,
    chat: chatId,
    parentMessage,
    read: [req.user._id],
    users: chat.users,
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

  await sendNotification(req, message, false);

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

const createInfoMessage = asyncHandler(async (req, res, next) => {
  const { chatId, content, recieverUser } = req.body;
  if (!chatId || !content) {
    return next(new ErrorHandler("Invalid data passed into request", 400));
  }

  await sendInfoMessage(chatId, content, recieverUser, req, next);

  res.json({
    success: true,
    message: req.body.message,
  });
});

export { createMessage, message, deleteMessage, createInfoMessage };