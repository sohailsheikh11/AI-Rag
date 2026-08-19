import "dotenv/config";
import express from "express";
import cors from "cors";
import dotenv from 'dotenv'
import chatRoutes from "./routes/chat.routes.js";
import documentRoutes from "./routes/document.routes.js";
import { loadStore } from "./services/vectorStore.service.js";
import { connectDB } from "./config/db.js";
import conversationRoute from './routes/conversation.route.js'

dotenv.config();
 connectDB();


loadStore();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors()); // dev: allow all origins; restrict in production
app.use(express.json());

app.use("/api/chat", chatRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/conversations", conversationRoute);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
