import asyncHandler from "express-async-handler";
import Chat from "../models/chatModel";
import User from "../models/userModel";
import ErrorHandler from "../utils/ErrorHandler";
import Message from "../models/messageModel";

const getChats = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    throw new Error("send user id");
  }

  let chat: any = await Chat.find({
    isGroup: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage")
    .populate("blockedBy", "-password");

  chat = await User.populate(chat, {
    path: "latestMessage.sender",
    select: "name email",
  });

  if (chat.length > 0) {
    res.status(200).json({ chat: chat[0], created: false });
  } else {
    let data = {
      chatName: "sender ",
      isGroup: false,
      users: [req.user._id, userId],
    };
    let createChat = await Chat.create(data);

    chat = await Chat.findById(createChat._id)
      .populate("users", "-password")
      .populate("latestMessage");

    chat = await User.populate(chat, {
      path: "latestMessage.sender",
      select: "name email avatar",
    });

    res.status(201).json({ chat, created: true });
  }
});

const fetchChats = asyncHandler(async (req, res, next) => {
  let chats: any = await Chat.find({
    $or: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { oldUsers: { $elemMatch: { $eq: req.user._id } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage")
    .populate("blockedBy", "-password")
    .populate("group")
    .sort({ updatedAt: -1 });

  chats = await User.populate(chats, {
    path: "latestMessage.sender",
    select: "name email",
  });

  chats = await Chat.populate(chats, {
    path: "latestMessage.chat",
    select: "",
  });

  res.json({
    success: true,
    chats,
  });
});

const blockChat = asyncHandler(async (req, res, next) => {
  const { chatId } = req.body;
  const chat = await Chat.findByIdAndUpdate(
    chatId,
    { blockedChat: true, blockedBy: req.user._id, blockedAt: Date.now() },
    { new: true }
  ).populate("blockedBy", "-password");

  if (!chat) {
    return next(new ErrorHandler("Chat not found", 404));
  }

  res.status(200).json({
    success: true,
    chat,
  });
});

const unblockChat = asyncHandler(async (req, res, next) => {
  const { chatId } = req.body;
  const chat = await Chat.findByIdAndUpdate(
    chatId,
    { blockedChat: false, blockedBy: null, blockedAt: null },
    { new: true }
  );

  if (!chat) {
    return next(new ErrorHandler("Chat not found", 404));
  }

  res.status(200).json({
    success: true,
    chat,
  });
});

const blockedChats = asyncHandler(async (req, res, next) => {
  const chats = await Chat.find({
    blockedChat: true,
    blockedBy: req.user._id,
  }).populate("users", "-password");

  res.status(200).json({ chats, success: true });
});

const readAllMessages = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const chat = await Chat.findOne({ _id: id });

  if (!chat) {
    return next(new ErrorHandler("chat does not exists", 404));
  }
  await Message.updateMany(
    {
      chat: id,
      users: { $elemMatch: { $eq: req.user._id } },
    },
    { $addToSet: { read: req.user._id } }
  );

  res.status(200).json({
    success: true,
  });
});

export {
  getChats,
  fetchChats,

  // blocks
  blockChat,
  unblockChat,
  blockedChats,
  readAllMessages,
};
