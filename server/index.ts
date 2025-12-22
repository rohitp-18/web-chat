import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import mongodb from "./config/mongodb";
import user from "./routers/userRouter";
import message from "./routers/messageRouter";
import group from "./routers/groupRouter";
import error from "./middlewares/error";
import chat from "./routers/chatRouter";
import setupSocket from "./socket";
import { createServer } from "http";
import morgan from "morgan";
import { v2 as cloudinary } from "cloudinary";
import webpush from "web-push";

dotenv.config({ path: path.resolve(__dirname, "./config/.env") });

mongodb();

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

webpush.setVapidDetails(
  "mailto:your@email.com",
  process.env.VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

const http = createServer(app);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost",
      "https://relievingly-noncongratulatory-micheline.ngrok-free.dev",
    ],
    credentials: true,
  })
);
app.use(morgan("dev"));

app.use("/api/v1/user", user);
app.use("/api/v1/chats", chat);
app.use("/api/v1/message", message);
app.use("/api/v1/group", group);

const port = process.env.PORT;

//app.use(express.static(path.join(__dirname, "build")));

/*app.use("*", (req, res) => {
  res.send(path.join(__dirname, "build", "index.html"))
})*/

app.use(error);

setupSocket(http);

http.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// const io = require("socket.io")(server, {
//   pingTimeout: 60000,
//   cors: "http://localhost:3000/",
// });

// io.on("connection", (socket: any) => {
//   socket.on("setup", (data: { _id: string }) => {
//     socket.join(data._id);
//     socket.emit("connected");
//   });

//   socket.on("register_user", (data: string) => {
//     socket.join(data);
//   });

//   socket.on("typing", ({ chat, user }: { chat: string; user: string }) => {
//     socket.in(chat).emit("typing", user);
//   });

//   socket.on("stop typing", ({ chat, user }: { chat: string; user: string }) =>
//     socket.in(chat).emit("stop typing", user)
//   );

//   socket.on("new message", (data: any) => {
//     data.chat.users.forEach((user: { _id: string }) => {
//       if (data.sender._id === user._id) return;
//       socket.in(user._id).emit("message received", data);
//     });
//   });
// });
