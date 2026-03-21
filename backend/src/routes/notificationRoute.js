import express from "express";
import {  getMyNotifications } from "../controllers/notificationController.js";
import {markNotificationRead } from "../controllers/notificationController.js";


// IMPORTANT: Import your specific authentication middleware here!
// Replace this line with your actual auth middleware file path.
// import { verifyToken } from "../middleware/auth.js"; 

const router = express.Router();

router.get("/", getMyNotifications); 

router.patch("/:id/read", markNotificationRead);


export default router;