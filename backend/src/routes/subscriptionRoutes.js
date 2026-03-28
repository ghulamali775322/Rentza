import express from "express";
import { getSubscriptionStatus, initPayment, paymentCallback } from "../controllers/subscriptionController.js";

const router = express.Router();

router.get("/status/:userId", getSubscriptionStatus);
router.post("/init-payment", initPayment);
router.all("/payment-callback", paymentCallback);

export default router;