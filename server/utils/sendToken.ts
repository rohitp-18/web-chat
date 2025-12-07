import jwt from "jsonwebtoken";
import { Response } from "express";
import { IUser } from "../models/userModel";

const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || "", {
    expiresIn: process.env.JWT_EXPIRE
      ? parseInt(process.env.JWT_EXPIRE) * 24 * 60 * 60 * 1000
      : 2 * 24 * 60 * 60 * 1000,
  });

  res
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
      expires: new Date(
        Date.now() +
          (process.env.JWT_EXPIRE ? parseInt(process.env.JWT_EXPIRE) : 2) *
            24 *
            60 *
            60 *
            1000
      ),
    })
    .json({
      success: true,
      user,
    });
};

export default sendToken;
