import express from "express";
import {
  createMessage,
  deleteMessage,
  message,
} from "../controllers/messageController";
import auth from "../middlewares/auth";

const router = express.Router();

router.use(auth);
router.post("/", createMessage);
router.delete("/:messageId", deleteMessage);
router.get("/:chatId", message);

export default router;
