import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {  getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";
import upload from "../lib/profile.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute,upload.single("attachment"), sendMessage);


export default router;
