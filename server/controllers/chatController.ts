import asyncHandler from "express-async-handler";
import Chat from "../models/chatModel";
import User from "../models/userModel";
import ErrorHandler from "../utils/ErrorHandler";

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
    $or: [{ users: { $elemMatch: { $eq: req.user._id } } }],
  })
    .populate("users", "-password")
    .populate("latestMessage")
    .populate("blockedBy", "-password")
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

const createGroup = asyncHandler(async (req, res, next) => {
  const { users, name } = req.body;

  if (users.length < 2) {
    throw new Error("At least 2 user compalsary");
  }

  users.push(req.user._id);

  const group = await Chat.create({
    chatName: name,
    isGroup: true,
    users,
    admin: req.user._id,
  });

  const fullGroup = await Chat.findById(group._id).populate(
    "users",
    "-password"
  );
  res.json(fullGroup);
});

const renameGroup = asyncHandler(async (req, res, next) => {
  const { name, groupId } = req.body;

  if (!name) {
    throw new Error("send group name");
  }

  const group = await Chat.findByIdAndUpdate(
    groupId,
    { chatName: name },
    { new: true }
  ).populate("users", "-password");

  res.json(group);
});

const addUser = asyncHandler(async (req, res, next) => {
  const { groupId, userId } = req.body;

  const group = await Chat.findByIdAndUpdate(
    { _id: groupId },
    { $push: { users: userId } },
    { new: true }
  ).populate("users", "-password");
  res.json(group);
});

const removeUser = asyncHandler(async (req, res, next) => {
  const { groupId, userId } = req.body;

  const group = await Chat.findByIdAndUpdate(
    { _id: groupId },
    { $pull: { users: userId } },
    { new: true }
  ).populate("users", "-password");
  res.json(group);
});

const updateGroup = asyncHandler(async (req, res, next) => {
  const { groupId, users, name } = req.body;

  const group = await Chat.findByIdAndUpdate(
    groupId,
    { users, chatName: name },
    { new: true }
  ).populate("users", "-password");

  res.json(group);
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

const blockUserInChat = asyncHandler(async (req, res, next) => {
  const { chatId, userId } = req.body;

  const tempChat = await Chat.findById(chatId);
  if (!tempChat) {
    return next(new ErrorHandler("Chat not found", 404));
  }

  if (tempChat.admin?.toString() !== req.user._id.toString()) {
    return next(
      new ErrorHandler("Only admin can block users in group chat", 403)
    );
  }

  if (tempChat.adminBlockedUsers.includes(userId)) {
    return next(new ErrorHandler("User already blocked in chat", 400));
  }

  const chat = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { adminBlockedUsers: userId } },
    { new: true }
  ).populate("users", "-password");
  res.status(200).json({ success: true, chat });
});

const unblockUserInChat = asyncHandler(async (req, res, next) => {
  const { chatId, userId } = req.body;

  const tempChat = await Chat.findById(chatId);
  if (!tempChat) {
    return next(new ErrorHandler("Chat not found", 404));
  }

  if (tempChat.admin?.toString() !== req.user._id.toString()) {
    return next(
      new ErrorHandler("Only admin can block users in group chat", 403)
    );
  }

  if (tempChat.adminBlockedUsers.includes(userId) == false) {
    return next(new ErrorHandler("User is not blocked in chat", 400));
  }

  const chat = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { adminBlockedUsers: userId } },
    { new: true }
  ).populate("users", "-password");
  res.status(200).json({ chat, success: true });
});

const blockedChats = asyncHandler(async (req, res, next) => {
  const chats = await Chat.find({
    blockedChat: true,
    blockedBy: req.user._id,
  }).populate("users", "-password");

  res.status(200).json({ chats, success: true });
});

const blockGroup = asyncHandler(async (req, res, next) => {
  const { chatId } = req.body;

  const tempChat = await Chat.findById(chatId);

  if (!tempChat || !tempChat.isGroup) {
    return next(new ErrorHandler("Group chat not found", 404));
  }

  if (tempChat.blockedChatUsers.includes(req.user._id)) {
    return next(
      new ErrorHandler("You have already blocked in this group", 400)
    );
  }

  const chat = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { blockedChatUsers: req.user._id } },
    { new: true }
  ).populate("users", "-password");

  res.status(200).json({ success: true, chat });
});

const unblockGroup = asyncHandler(async (req, res, next) => {
  const { chatId } = req.body;
  const tempChat = await Chat.findById(chatId);
  if (!tempChat || !tempChat.isGroup) {
    return next(new ErrorHandler("Group chat not found", 404));
  }

  if (!tempChat.blockedChatUsers.includes(req.user._id)) {
    return next(new ErrorHandler("You are not blocked in this group", 400));
  }
  const chat = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { blockedChatUsers: req.user._id } },
    { new: true }
  ).populate("users", "-password");

  res.status(200).json({ success: true, chat });
});

export {
  getChats,
  fetchChats,
  createGroup,
  renameGroup,
  addUser,
  removeUser,
  updateGroup,

  // blocks
  blockChat,
  unblockChat,
  blockUserInChat,
  unblockUserInChat,
  blockedChats,
  blockGroup,
  unblockGroup,
};
