import express from "express";
import { getSubscriptionStatus, initPayment, paymentCallback, checkPaymentStatus } from "../controllers/subscriptionController.js";

const router = express.Router();

router.get("/status/:userId", getSubscriptionStatus);
router.post("/init-payment", initPayment);
router.all("/payment-callback", paymentCallback);
router.get("/check-status", checkPaymentStatus);

export default router;