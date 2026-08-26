import express from 'express'
import { deleteConversation, getAllConversation, getConversation, saveConversation } from '../controllers/conversation.controller.js';

const router = express.Router();

router.post("/", saveConversation);
router.get("/:id", getConversation)
router.get("/", getAllConversation);
router.delete("/:conversationId", deleteConversation);

export default router;