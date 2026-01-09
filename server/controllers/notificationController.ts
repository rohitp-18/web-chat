import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel";
import ErrorHandler from "../utils/ErrorHandler";
import { sendNotification } from "web-push";

const subscribeUser = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { subscription } = req.body;

    if (!subscription) {
      return next(new ErrorHandler("Subscription object is required", 400));
    }

    if (req.cookies.testPush) {
      return next(
        res.status(200).json({
          success: true,
        })
      );
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    if (!Array.isArray(user.pushSubscription)) {
      user.pushSubscription = [];
    }
    user.pushSubscription.push(subscription);

    if (user.pushSubscription.find((sub: any) => (sub.endpoint || "") === subscription.endpoint)) {
      return next(
        res.status(200).json({
          success: true,
        })
      );
    }

    sendNotification(
      subscription,
      JSON.stringify({
        title: "Test",
        body: "This is a test push",
        data: { url: "/chat" },
      })
    )
      .then(() => { })
      .catch((err: any) => {
        console.error(err);
      });

    await user.save();

    res
      .status(200)
      .json({
        success: true,
        message: "User subscribed to notifications successfully",
      })
      .cookie("testPush", JSON.stringify(subscription), { httpOnly: true });
  }
);

const unsubscribeUser = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { subscription } = req.body;

    if (!subscription) {
      return next(new ErrorHandler("Subscription object is required", 400));
    }

    if (!req.cookies.testPush) {
      return next(
        res.status(200).json({
          success: true,
        })
      );
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    user.pushSubscription = user.pushSubscription.filter(
      (sub: any) => (sub.endpoint || "") !== subscription.endpoint
    );

    await user.save();

    res
      .status(200)
      .json({
        success: true,
        message: "User unsubscribed to notifications successfully",
      })
      .cookie("testPush", null, {
        httpOnly: true,
        expires: new Date(Date.now()),
      });
  }
);

const getKey = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const publicVapidKey = process.env.VAPID_PUBLIC_KEY;

    if (!publicVapidKey) {
      return next(new ErrorHandler("VAPID public key not found", 500));
    }
    res.status(200).json({
      success: true,
      key: publicVapidKey,
      message: "Public VAPID key fetched successfully",
    });
  }
);

export { subscribeUser, unsubscribeUser, getKey };
