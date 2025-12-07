import asyncHandler from "express-async-handler";
import User from "../models/userModel";
import ErrorHandler from "../utils/ErrorHandler";
import sendToken from "../utils/sendToken";

const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler("Please fill all required fields", 400));
  }

  const user = await User.create({ name, email, password });
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("please fill all the required fields", 400));
  }

  const user = await User.findOne({ email });

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

  res.json({
    success: true,
    user,
  });
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

const findUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({
    ...(req.query.search
      ? { name: { $regex: req.query.search as string, $options: "i" } }
      : {}),
    _id: { $ne: req.user._id },
  });

  res.status(200).json(users);
});

export { registerUser, logoutUser, loginUser, getUser, findUsers };
