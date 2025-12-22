import { Router } from "express";
import {
  createGroup,
  updateGroup,
  leaveGroup,
  adminBlockUser,
  userBlockGroup,
  userUnblockGroup,
  adminUnblockUser,
  addUsersToGroup,
  removeUsersFromGroup,
  getGroupDetails,
  toggleAdminStatus,
} from "../controllers/groupController";
import auth from "../middlewares/auth";
import upload from "../config/multer";

const router = Router();

router.use(auth);

router.post("/", upload.single("avatar"), createGroup);
router.get("/:groupId", getGroupDetails);
router.put("/:groupId", upload.single("avatar"), updateGroup);
router.post("/:groupId/leave", leaveGroup);
router.post("/:groupId/admin/block-user", adminBlockUser);
router.post("/:groupId/user/block-group", userBlockGroup);
router.post("/:groupId/user/unblock-group", userUnblockGroup);
router.post("/:groupId/admin/unblock-user", adminUnblockUser);
router.post("/:groupId/add-users", addUsersToGroup);
router.post("/:groupId/remove-users", removeUsersFromGroup);
router.post("/:groupId/admin/toggle-admin", toggleAdminStatus);

export default router;
