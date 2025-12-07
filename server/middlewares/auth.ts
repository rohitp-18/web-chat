import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/userModel";
import ErrorHandler from "../utils/ErrorHandler";

declare module "express-serve-static-core" {
  interface Request {
    user?: any;
  }
}

const auth = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please Login First", 403));
  }

  try {
    var a = jwt.verify(token, process.env.JWT_SECRET || "") as jwt.JwtPayload;
  } catch (error) {
    return next(new ErrorHandler((error as Error).message, 402));
  }

  const user = await User.findById(a._id);

  if (!user) {
    return next(new ErrorHandler("Please Login First", 403));
  }

  req.user = user;
  next();
});

export default auth;
