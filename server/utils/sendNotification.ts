import webpush from "web-push";
import { io, onlineUsers } from "../socket";
import User from "../models/userModel";
import { Request } from "express";

const sendNotification = async (
  req: Request,
  message: any,
  socket: boolean = true
) => {
  try {
    // const user = await User.findById(req.user._id).select("pushSubscription")
    let usersId = message.users.map((u: any) => u._id.toString());


    // If user is connected via socket -> send realtime
    usersId.forEach((u: string) => {
      if (onlineUsers.has(u)) {
        const socketId = onlineUsers.get(u);
        console.log(socketId, u)
        usersId = usersId.filter((id: string) => id !== u);
        if (socketId) {
          if (socket)
            io.to(socketId).emit("receive_notification", message);
        }
      }
    });

    usersId = usersId.filter((id: string) => id !== req.user._id.toString());

    const users = await User.find({ _id: { $in: usersId } }).select("pushSubscription")

    const payload = JSON.stringify({
      title: message.sender?.name || "Notification",
      body: message.content || "",
      image: message.sender?.avatar?.url,
      data: { url: "/chat" },
    });

    console.log(usersId)

    for (const u of users) {
      if (
        !Array.isArray(u.pushSubscription) ||
        u.pushSubscription.length === 0
      ) {
        continue;
      }
      for (const sub of u.pushSubscription) {
        try {
          await webpush.sendNotification(
            sub as webpush.PushSubscription,
            payload,
            {
              TTL: 60 * 60,
            }
          );
        } catch (err: any) {
          console.error(
            "Push send error for user",
            u._id,
            err?.statusCode || err?.message || err
          );
          if (err && (err.statusCode === 410 || err.statusCode === 404)) {
            continue;
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in sendNotification:", error);
  }
};

export default sendNotification;
