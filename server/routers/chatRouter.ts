import express from "express";
import {
  fetchChats,
  getChats,
  createGroup,
  renameGroup,
  addUser,
  removeUser,
  updateGroup,
  // blocks
  blockChat,
  unblockChat,
  blockUserInChat,
  unblockUserInChat,
  blockedChats,
  blockGroup,
  unblockGroup,
} from "../controllers/chatController";
import auth from "../middlewares/auth";

const router = express.Router();

router.use(auth);
router.get("/", fetchChats);
router.post("/", getChats);
router.post("/create", createGroup);
router.put("/rename", renameGroup);
router.put("/adduser", addUser);
router.get("/removeuser", removeUser);
router.get("/update", updateGroup);
// blocks
router.put("/blockchat", blockChat);
router.put("/unblockchat", unblockChat);
router.put("/blockuserinchat", blockUserInChat);
router.put("/unblockuserinchat", unblockUserInChat);
router.get("/blockedchats", blockedChats);
router.put("/blockgroup", blockGroup);
router.put("/unblockgroup", unblockGroup);

export default router;
