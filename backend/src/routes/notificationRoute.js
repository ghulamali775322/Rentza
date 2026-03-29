import express from "express";
import {  getMyNotifications } from "../controllers/notificationController.js";
import {markNotificationRead } from "../controllers/notificationController.js";
import {markAllNotificationsRead } from "../controllers/notificationController.js";

import { protect } from "../middlewares/authMiddleware.js";



const router = express.Router();

router.get("/", protect, getMyNotifications); 
router.patch("/read-all", protect, markAllNotificationsRead); 
router.patch("/:id/read", protect, markNotificationRead);


export default router;