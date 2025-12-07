import ErrorHandler from "../utils/ErrorHandler";
import { Request, Response, NextFunction } from "express";

const errorMiddleware = (
  err: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const message = err.message;
  const status = err.statusCode || 500;
  console.log("red");

  if (message === "invalid signature" || message === "jwt malformed") {
    return next(
      res.status(status).clearCookie("token").json({
        success: false,
        message: "Internal Error",
        stack: err.stack,
      })
    );
  }

  res.status(status).json({
    message,
    stackTrace: err.stack,
  });
};

export default errorMiddleware;
