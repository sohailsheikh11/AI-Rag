import express from 'express'
import { getConversation, saveConversation } from '../controllers/conversation.controller.js';

const router = express.Router();

router.post("/", saveConversation);
router.get("/", getConversation)

export default router;