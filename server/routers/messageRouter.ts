import express from "express";
import { createMessage, message } from "../controllers/messageController";
import auth from "../middlewares/auth";

const router = express.Router();

router.use(auth);
router.post("/", createMessage);
router.get("/:chatId", message);

export default router;
