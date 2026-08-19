import { Router } from "express";
import { generalChat, documentChat } from "../controllers/chat.controller.js";

const router = Router();

router.post("/general", generalChat);
router.post("/document", documentChat);

export default router;
