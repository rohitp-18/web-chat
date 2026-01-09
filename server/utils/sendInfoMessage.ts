import { NextFunction, Request } from "express";
import Message from "../models/messageModel";
import Chat from "../models/chatModel";
import ErrorHandler from "./ErrorHandler";
import User from "../models/userModel";
import sendNotification from "./sendNotification";


const sendInfoMessage = async (chatId: string, content: string, recieverUser: string | null, req: Request, next: NextFunction) => {
  const chat = await Chat.findById(chatId);

  if (!chat) {
    return next(new ErrorHandler("Chat not found", 404));
  }

  let message: any = await Message.create({
    content,
    sender: req.user._id,
    chat: chatId,
    recieverUser,
    isInfoMessage: true,
    read: [req.user._id],
    users: chat.users,
  });

  message = await message.populate("sender", "-password");
  message = await message.populate("recieverUser", "-password");
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

  await sendNotification(req, message);

  if (req.body) {
    req.body.message = message;
  }
}

export default sendInfoMessage