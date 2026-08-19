import { Router } from "express";
import multer from "multer";
import {
  uploadDocument,
  listDocuments,
  deleteDocument,
} from "../controllers/document.controller.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const router = Router();

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/", listDocuments);
router.delete("/:id", deleteDocument);

export default router;
