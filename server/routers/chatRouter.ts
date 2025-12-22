import express from "express";
import {
  fetchChats,
  getChats,
  // blocks
  blockChat,
  unblockChat,
  blockedChats,
  readAllMessages,
} from "../controllers/chatController";
import auth from "../middlewares/auth";

const router = express.Router();

router.use(auth);
router.get("/", fetchChats);
router.post("/", getChats);
// blocks
router.put("/blockchat", blockChat);
router.put("/unblockchat", unblockChat);
router.get("/blockedchats", blockedChats);
router.get("/read-messages/:id", readAllMessages);

export default router;
