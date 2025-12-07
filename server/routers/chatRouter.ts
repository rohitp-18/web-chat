import express from "express";
import {
  fetchChats,
  getChats,
  createGroup,
  renameGroup,
  addUser,
  removeUser,
  updateGroup,
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

export default router;
