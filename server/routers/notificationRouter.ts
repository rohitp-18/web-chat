import { Router } from "express";
import {
  subscribeUser,
  unsubscribeUser,
  getKey,
} from "../controllers/notificationController";
import auth from "../middlewares/auth";

const router = Router();

router.use(auth);

router.post("/subscribe", subscribeUser);
router.post("/unsubscribe", unsubscribeUser);
router.get("/key", getKey);

export default router;
