import {
  createConversation,
  getConversation,
  getMessages,
} from "../controller/conversationController.js";
import express from "express";
import { checkFriendship } from "../middleware/friendMiddleware.js";

const router = express.Router();

router.post("/", checkFriendship, createConversation);
router.get("/", getConversation);
router.get("/:conversationId/messages", getMessages);

export default router;
