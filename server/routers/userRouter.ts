import express from "express";
import {
  getUser,
  registerUser,
  loginUser,
  logoutUser,
  findUsers,
} from "../controllers/userController";
import auth from "../middlewares/auth";

const router = express.Router();

router.get("/getuser", auth, getUser);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", auth, logoutUser);
router.get("/find", auth, findUsers);

export default router;
