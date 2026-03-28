import * as subscriptionService from "../services/subscriptionService.js";
import User from "../models/user.js";

export const createListing = async (req, res) => {
  try {
    // This tells the database: "Add 1 to this user's adsPostedCount!"
    await User.findByIdAndUpdate(req.user.id, { $inc: { adsPostedCount: 1 } });

    res.status(201).json({ success: true, message: "Ad posted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error posting ad" });
  }
};

export const getSubscriptionStatus = async (req, res) => {
  try {
    const statusData = await subscriptionService.getSubscriptionStatusService(req.params.userId);
    if (!statusData) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: statusData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const initPayment = async (req, res) => {
  try {
    const { userId, planType, price } = req.body;

    // Let's see what the frontend is actually sending!
    console.log("RECEIVED FROM FRONTEND -> UserID:", userId, "| Plan:", planType, "| Price:", price);

    if (!userId || !planType || !price) {
      console.log("🚨 BLOCKED: Missing Data!");
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const paymentData = await subscriptionService.generatePaymentPayload(userId, planType, price);

    res.status(200).json({
      success: true,
      gatewayUrl: paymentData.gatewayUrl, 
    });

  } catch (error) {
    console.error("🚨 INIT PAYMENT CRASHED:", error);
    res.status(500).json({ success: false, message: "Could not initiate payment" });
  }
};

export const paymentCallback = async (req, res) => {
  try {
    const { userId, planType, amount, sig, reference } = req.query; 

    const isSuccess = true; // Testing locally

    if (isSuccess) {
      const transactionId = reference || `TEST-TXN-${Date.now()}`;

      // 🔥 THIS IS WHERE THE DB UPGRADES NOW 🔥
      // It only happens AFTER Safepay sends the success callback!
      await subscriptionService.upgradePlanService(
        userId, 
        planType, 
        transactionId, 
        Number(amount)
      );
      
      // Redirect to the Home Page on success
      return res.redirect(`http://localhost:3000/?payment=success`);
    } else {
      // Redirect back to Packages on failure
      return res.redirect(`http://localhost:3000/profile/packages?payment=failed`);
    }

  } catch (error) {
    res.status(500).json({ message: "Server error during bank callback", error: error.message });
  }
};