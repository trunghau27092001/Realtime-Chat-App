import express from "express";
import {
  sendDirectMessage,
  sendGroupMessage,
} from "../controller/messageController.js";
import {
  checkFriendship,
  checkGroupMemberShip,
} from "../middleware/friendMiddleware.js";
const router = express.Router();

router.post("/direct", checkFriendship, sendDirectMessage);
router.post("/group", checkGroupMemberShip, sendGroupMessage);

export default router;
