import { NextFunction, Request, Response } from "express";
import Group from "../models/groupModel";
import ErrorHandler from "../utils/ErrorHandler";
import { v2 as cloudinary } from "cloudinary";
import expressAsyncHandler from "express-async-handler";
import { Types } from "mongoose";
import Chat from "../models/chatModel";
import sendInfoMessage from "../utils/sendInfoMessage";
import User from "../models/userModel";
import { io, onlineUsers } from "../socket";

const createGroup = expressAsyncHandler(async (req, res, next) => {
  const { name, username, about, members } = req.body;

  if (!name || !username) {
    return next(new ErrorHandler("Please fill all required fields", 400));
  }

  if (!members) {
    return next(new ErrorHandler("Group members are required", 400));
  }

  if (members && !Array.isArray(members)) {
    return next(new ErrorHandler("Members must be an array", 400));
  }

  if (members && members.length < 2) {
    return next(new ErrorHandler("A group must have at least 3 members", 400));
  }

  // Create the group chat
  const group = await Group.create({
    name,
    username,
    about,
    members: [req.user._id, ...(members || [])],
    admins: [req.user._id],
    createdBy: req.user._id,
  });

  if (!group) {
    return next(new ErrorHandler("Failed to create group", 500));
  }

  const chat = await Chat.create({
    chatName: name,
    isGroup: true,
    group: group._id,
    users: group.members,
  });

  group.chat = chat._id;

  if (!chat) {
    return next(new ErrorHandler("Failed to create chat for group", 500));
  }

  if (req.file) {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    try {
      const data = await cloudinary.uploader.upload(dataURI, {
        folder: `web-chat/group/${name}`,
        crop: "pad",
      });
      group.avatar = { public_id: data.public_id, url: data.secure_url };
    } catch (error) {
      return next(new ErrorHandler("Image upload failed", 500));
    }
  }

  await group.save();

  await sendInfoMessage(chat._id.toString(), `${req.user.name} created the group`, null, req, next);

  res.status(201).json({
    success: true,
    group,
  });
});

const updateGroup = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, username, about, removeAvatar } = req.body;

    if (!name || !username) {
      return next(new ErrorHandler("Please fill all required fields", 400));
    }

    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return next(new ErrorHandler("Group not found", 404));
    }

    group.name = name || group.name;
    group.username = username || group.username;
    group.about = about || group.about;

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      try {
        if (group.avatar && group.avatar.public_id) {
          await cloudinary.uploader.destroy(group.avatar.public_id);
        }
        const data = await cloudinary.uploader.upload(dataURI, {
          folder: `web-chat/group/${name}`,
          crop: "pad",
        });
        group.avatar = { public_id: data.public_id, url: data.secure_url };
      } catch (error) {
        return next(new ErrorHandler("Image upload failed", 500));
      }
    }

    if (removeAvatar) {
      if (group.avatar && group.avatar.url && group.avatar.public_id) {
        await cloudinary.uploader.destroy(group.avatar.public_id);
        group.avatar = null;
      }
    }
    await group.save();

    res.status(200).json({
      success: true,
      group,
    });
  }
);

const leaveGroup = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return next(new ErrorHandler("Group not found", 404));
    }

    if (!group.members.includes(req.user._id)) {
      return next(new ErrorHandler("You are not a member of this group", 400));
    }
    const chat = await Chat.findOne({ group: group._id });
    if (!chat) {
      return next(new ErrorHandler("Associated chat not found", 404));
    }

    await sendInfoMessage(chat._id.toString(), `${req.user.name} left the group`, null, req, next);


    group.members = group.members.filter(
      (memberId) => memberId.toString() !== req.user._id.toString()
    );
    group.userBlocked = group.userBlocked.filter(
      (userId) => userId.toString() !== req.user._id.toString()
    );
    group.admins = group.admins.filter(
      (adminId) => adminId.toString() !== req.user._id.toString()
    );


    if (chat) {
      chat.users = chat.users.filter(
        (userId) => userId.toString() !== req.user._id.toString()
      );
      chat.oldUsers.push(req.user._id);
      await chat.save();
    }
    await group.save();


    if (onlineUsers.has(req.user._id.toString())) {
      const socketId = onlineUsers.get(req.user._id.toString())
      if (socketId) {
        io.to(socketId).emit("update_chat_users", { _id: chat._id, users: chat.users });
      }
    }

    res.status(200).json({
      success: true,
      message: "Left the group successfully",
    });
  }
);

const adminBlockUser = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return next(new ErrorHandler("Group not found", 404));
    }

    if (!group.admins.includes(req.user._id)) {
      return next(new ErrorHandler("Only admins can block members", 403));
    }

    if (!group.members.includes(userId)) {
      return next(new ErrorHandler("User is not a member of the group", 400));
    }

    if (group.blockedMembers.includes(userId)) {
      return next(new ErrorHandler("User is already blocked", 400));
    }

    group.blockedMembers.push(userId);
    group.members = group.members.filter(
      (memberId) => memberId.toString() !== userId.toString()
    );

    const chat = await Chat.findOne({ group: group._id });

    if (!chat) {
      return next(new ErrorHandler("Associated chat not found", 404));
    }

    await sendInfoMessage(chat!._id.toString(), ` ${user.name} has been blocked by admin`, userId, req, next);

    if (chat) {
      chat.users = chat.users.filter(
        (memberId) => memberId.toString() !== userId.toString()
      );
      chat.oldUsers.push(new Types.ObjectId(userId));
      await chat.save();
    }
    await group.save();

    if (onlineUsers.has(userId)) {
      const socketId = onlineUsers.get(userId)
      if (socketId) {
        io.to(socketId).emit("update_chat_users", { _id: chat._id, users: chat.users });
      }
    }

    res.status(200).json({
      success: true,
      message: "User blocked successfully",
    });
  }
);

const userBlockGroup = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return next(new ErrorHandler("Group not found", 404));
    }

    if (group.blockedMembers.includes(req.user._id)) {
      return next(new ErrorHandler("You are blocked from this group", 403));
    }
    if (group.userBlocked.includes(req.user._id)) {
      return next(new ErrorHandler("You have already blocked this group", 400));
    }
    group.userBlocked.push(req.user._id);
    group.members = group.members.filter(
      (memberId) => memberId.toString() !== req.user._id.toString()
    );

    const chat = await Chat.findOne({ group: group._id });
    if (!chat) {
      return next(new ErrorHandler("Associated chat not found", 404));
    }

    await sendInfoMessage(chat!._id.toString(), `${req.user.name} has left the group`, null, req, next);

    chat.users = chat.users.filter(
      (memberId) => memberId.toString() !== req.user._id.toString()
    );
    chat.oldUsers.push(req.user._id);
    await chat.save();
    await group.save();

    if (onlineUsers.has(req.user._id.toString())) {
      const socketId = onlineUsers.get(req.user._id.toString())
      if (socketId) {
        io.to(socketId).emit("update_chat_users", { _id: chat._id, users: chat.users });
      }
    }

    res.status(200).json({
      success: true,
      message: "Group blocked successfully",
    });
  }
);

const userUnblockGroup = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return next(new ErrorHandler("Group not found", 404));
    }
    if (group.blockedMembers.includes(req.user._id)) {
      return next(new ErrorHandler("You are blocked from this group", 403));
    }
    if (!group.userBlocked.includes(req.user._id)) {
      return next(new ErrorHandler("You have not blocked this group", 400));
    }
    group.userBlocked = group.userBlocked.filter(
      (userId) => userId.toString() !== req.user._id.toString()
    );
    group.members.push(req.user._id);

    const chat = await Chat.findOne({ group: group._id });

    if (!chat) {
      return next(new ErrorHandler("Associated chat not found", 404));
    }

    if (chat) {
      chat.users.push(req.user._id);
      chat.oldUsers = chat.oldUsers.filter(
        (userId) => userId.toString() !== req.user._id.toString()
      );
      await chat.save();
    }
    await group.save();
    await sendInfoMessage(chat!._id.toString(), `${req.user.name} has rejoined the group`, null, req, next);


    if (onlineUsers.has(req.user._id.toString())) {
      const socketId = onlineUsers.get(req.user._id.toString())
      if (socketId) {
        io.to(socketId).emit("update_chat_users", { _id: chat._id, users: chat.users });
      }
    }

    res.status(200).json({
      success: true,
      message: "Group unblocked successfully",
    });
  }
);

const adminUnblockUser = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return next(new ErrorHandler("Group not found", 404));
    }

    if (!group.admins.includes(req.user._id)) {
      return next(new ErrorHandler("Only admins can unblock members", 403));
    }
    if (group.userBlocked.includes(userId)) {
      return next(new ErrorHandler("User has blocked the group", 400));
    }
    if (!group.blockedMembers.includes(userId)) {
      return next(new ErrorHandler("User is not blocked", 400));
    }

    const chat = await Chat.findOne({ group: group._id });
    if (!chat) {
      return next(new ErrorHandler("Associated chat not found", 404));
    }

    group.blockedMembers = group.blockedMembers.filter(
      (memberId) => memberId.toString() !== userId.toString()
    );
    group.members.push(new Types.ObjectId(userId));
    if (chat) {
      chat.users.push(new Types.ObjectId(userId));
      chat.oldUsers = chat.oldUsers.filter(
        (memberId) => memberId.toString() !== userId.toString()
      );
      await chat.save();
    }
    await group.save();

    await sendInfoMessage(chat!._id.toString(), `${user.name} has been unblocked by admin`, userId, req, next);

    if (onlineUsers.has(userId)) {
      const socketId = onlineUsers.get(userId)
      if (socketId) {
        io.to(socketId).emit("update_chat_users", { _id: chat._id, users: chat.users });
      }
    }

    res.status(200).json({
      success: true,
      message: "User unblocked successfully",
    });
  }
);

const addUsersToGroup = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userIds } = req.body;

    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      return next(new ErrorHandler("One or more users not found", 404));
    }

    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return next(new ErrorHandler("Group not found", 404));
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return next(new ErrorHandler("User IDs must be a non-empty array", 400));
    }

    const chat = await Chat.findOne({ group: group._id });

    if (!chat) {
      return next(new ErrorHandler("Associated chat not found", 404));
    }

    if (group.admins.includes(req.user._id) === false) {
      return next(
        new ErrorHandler("Only admins can add users to the group", 403)
      );
    }

    group.members.push(...userIds.map((id: string) => new Types.ObjectId(id)));

    chat.users.push(...userIds.map((id: string) => new Types.ObjectId(id)));

    await chat.save();

    await group.save();

    await Promise.all(
      users.map(async (user) => {
        await sendInfoMessage(chat._id.toString(), `${user.name} has been added to the group`, user._id.toString(), req, next);
      })
    );

    users.map((user) => {
      if (onlineUsers.has(user._id.toString())) {
        const socketId = onlineUsers.get(user._id.toString())
        if (socketId) {
          io.to(socketId).emit("update_chat_users", { _id: chat._id, users: chat.users });
        }
      }
    })

    res.status(200).json({
      success: true,
      message: "Users added to group successfully",
    });
  }
);

const removeUsersFromGroup = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userIds } = req.body;

    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      return next(new ErrorHandler("One or more users not found", 404));
    }

    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return next(new ErrorHandler("Group not found", 404));
    }
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return next(new ErrorHandler("User IDs must be a non-empty array", 400));
    }
    if (group.admins.includes(req.user._id) === false) {
      return next(
        new ErrorHandler("Only admins can remove users from the group", 403)
      );
    }

    const chat = await Chat.findOne({ group: group._id });
    if (!chat) {
      return next(new ErrorHandler("Associated chat not found", 404));
    }

    await Promise.all(
      users.map(async (user) => {
        await sendInfoMessage(chat!._id.toString(), `${user.name} has been removed from the group`, user._id.toString(), req, next);
      })
    );

    chat.users = chat.users.filter(
      (memberId) => !userIds.includes(memberId.toString())
    );

    group.members = group.members.filter(
      (memberId) => !userIds.includes(memberId.toString())
    );

    userIds.forEach((userId: string) => {
      chat.oldUsers.push(new Types.ObjectId(userId));
    });

    await chat.save();

    await group.save();

    users.map((user) => {
      if (onlineUsers.has(user._id.toString())) {
        const socketId = onlineUsers.get(user._id.toString())
        if (socketId) {
          io.to(socketId).emit("update_chat_users", { _id: chat._id, users: chat.users });
        }
      }
    })

    res.status(200).json({
      success: true,
      message: "Users removed from group successfully",
    });
  }
);

const getGroupDetails = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const group = await Group.findById(req.params.groupId)
      .populate("admins", "-password")
      .populate("members", "-password")
      .populate("blockedMembers", "-password")
      .populate("userBlocked", "-password");

    if (!group) {
      return next(new ErrorHandler("Group not found", 404));
    }

    res.status(200).json({
      success: true,
      group,
    });
  }
);

const toggleAdminStatus = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, makeAdmin } = req.body;
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return next(new ErrorHandler("Group not found", 404));
    }

    if (!group.admins.includes(req.user._id)) {
      return next(new ErrorHandler("Only admins can change admin status", 403));
    }

    if (makeAdmin) {
      if (!group.admins.includes(userId)) {
        group.admins.push(new Types.ObjectId(userId));
      }
    } else {
      group.admins = group.admins.filter(
        (adminId) => adminId.toString() !== userId.toString()
      );
    }
    await group.save();

    res.status(200).json({
      success: true,
    });
  }
);

export {
  createGroup,
  updateGroup,
  leaveGroup,
  adminBlockUser,
  userBlockGroup,
  userUnblockGroup,
  adminUnblockUser,
  removeUsersFromGroup,
  addUsersToGroup,
  getGroupDetails,
  toggleAdminStatus,
};
