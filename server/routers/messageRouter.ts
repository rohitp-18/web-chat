import express from "express";
import {
  createInfoMessage,
  createMessage,
  deleteMessage,
  message,
} from "../controllers/messageController";
import auth from "../middlewares/auth";

const router = express.Router();

router.use(auth);
router.post("/", createMessage);
router.post("/info", createInfoMessage);
router.delete("/:messageId", deleteMessage);
router.get("/:chatId", message);

export default router;
