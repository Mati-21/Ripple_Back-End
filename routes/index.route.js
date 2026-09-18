import express from "express";
import authRoutes from "../routes/auth.route.js";
import chatRoutes from "../routes/chat.route.js";
import messageRoutues from "../routes/message.route.js";
import userRoutes from "../routes/user.route.js";
import uploadRoutes from "../routes/upload.route.js";

const router = express.Router();
router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
router.use("/message", messageRoutues);
router.use("/user", userRoutes);
router.use("/upload", uploadRoutes);

export default router;
