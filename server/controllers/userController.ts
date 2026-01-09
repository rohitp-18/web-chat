import asyncHandler from "express-async-handler";
import User from "../models/userModel";
import ErrorHandler from "../utils/ErrorHandler";
import sendToken from "../utils/sendToken";
import { v2 as cloudinary } from "cloudinary";
import { NextFunction, Request, Response } from "express";
import Chat from "../models/chatModel";

const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const usernameBase = name.trim().toLowerCase().replace(/\s+/g, "");
  const emailBase = email.split("@")[0];
  let username = `${usernameBase}_${emailBase}`;

  // Ensure username is unique - keep looping while username exists
  let existingUser = await User.findOne({ username });
  while (existingUser) {
    username = `${usernameBase}_${emailBase}${Math.floor(
      Math.random() * 1000
    )}`;
    existingUser = await User.findOne({ username });
  }

  if (!name || !email || !password) {
    return next(new ErrorHandler("Please fill all required fields", 400));
  }

  const user = await User.create({ name, email, password, username });

  if (!user) {
    return next(new ErrorHandler("User registration failed", 500));
  }

  sendToken(user, 201, res);
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("please fill all the required fields", 400));
  }

  const user = await User.findOne({ email }).select("password");

  if (!user) {
    return next(new ErrorHandler("Invalid Email and Password", 402));
  }

  const comparePassword = await user.comparePassword(password);

  if (!comparePassword) {
    return next(new ErrorHandler("Invalid Email and Password", 402));
  }

  sendToken(user, 200, res);
});

const getUser = asyncHandler(async (req, res, next) => {
  const user = req.user;

  sendToken(user, 200, res);
});

const logoutUser = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please Login again", 400));
  }

  res.clearCookie("token").json({
    success: true,
    user: req.user,
  });
});

const getUserProfile = asyncHandler(async (req, res, next) => {
  const { username } = req.query;
  const user = await User.findOne({ username: username as string }).select(
    "-password"
  );

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json({ user });
});

const findUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({
    ...(req.query.search
      ? { name: { $regex: req.query.search as string, $options: "i" } }
      : {}),
    _id: { $ne: req.user._id },
  });

  res.status(200).json(users);
});

const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const { name, username, about } = req.body;

  if (user.username !== username && (await User.findOne({ username }))) {
    return next(new ErrorHandler("Username is already taken", 403));
  }

  user.name = name || user.name;
  user.username = username;
  user.about = about;

  if (req.file) {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    try {
      if (user.avatar && user.avatar.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      }
      const data = await cloudinary.uploader.upload(dataURI, {
        folder: `social/user/${name}`,
        crop: "pad",
      });
      user.avatar = { public_id: data.public_id, url: data.secure_url };
    } catch (error) {
      return next(new ErrorHandler("Image upload failed", 500));
    }
  }
  await user.save();

  res.status(200).json({
    success: true,
    user,
  });
});

const checkUsernameStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.query;
    if (!username || typeof username !== "string") {
      return next(new ErrorHandler("Username is required", 400));
    }

    const user = await User.findOne({ username: username as string });
    const chat = await Chat.findOne({ chatUsername: username as string });

    res.status(200).json({
      available: !user && !chat,
    });
  }
);

export {
  registerUser,
  logoutUser,
  loginUser,
  getUser,
  findUsers,
  getUserProfile,
  updateUser,
  checkUsernameStatus,
};
