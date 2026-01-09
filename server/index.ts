import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import morgan from "morgan";
import { v2 as cloudinary } from "cloudinary";
import webpush from "web-push";

// middlewares
import mongodb from "./config/mongodb";
import error from "./middlewares/error";
import setupSocket from "./socket";

// Routers
import userRouter from "./routers/userRouter";
import messageRouter from "./routers/messageRouter";
import notificationRouter from "./routers/notificationRouter";
import chatRouter from "./routers/chatRouter";
import groupRouter from "./routers/groupRouter";

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
    origin: ["http://localhost:3000", process.env.HOST_URL || ""],
    credentials: true,
  })
);
app.use(morgan("dev"));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/group", groupRouter);
app.use("/api/v1/notifications", notificationRouter);

const port = process.env.PORT;

app.use(error);

setupSocket(http);

http.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
