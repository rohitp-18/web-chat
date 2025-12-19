import express from "express";
import {
  getUser,
  registerUser,
  loginUser,
  logoutUser,
  findUsers,
  getUserProfile,
  updateUser,
  checkUsernameStatus,
} from "../controllers/userController";
import auth from "../middlewares/auth";
import upload from "../config/multer";

const router = express.Router();

router.get("/getuser", auth, getUser);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", auth, logoutUser);
router.get("/profile", getUserProfile);
router.get("/find", auth, findUsers);
router.put("/update", auth, upload.single("avatar"), updateUser);
router.get("/username-status", auth, checkUsernameStatus);

export default router;
