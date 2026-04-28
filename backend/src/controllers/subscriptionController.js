import * as subscriptionService from "../services/subscriptionService.js";
import User from "../models/user.js";
import nodemailer from "nodemailer";
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
    // 1. CATCH THE SAFEPAY REDIRECT
    console.log("🔥 SAFEPAY CALLBACK HIT! Data received:", req.query);
    const { userId, planType, amount, reference } = req.query;

    if (!userId || !planType) {
      console.log("🚨 ERROR: Missing userId or planType from Safepay!");
      return res.redirect(`http://localhost:3000/profile/packages?payment=failed`);
    }

    const transactionId = reference || `TXN-${Date.now()}`;

    // 2. 🔥 UPDATE MONGODB
    console.log(`⬆️ Upgrading User ${userId} to ${planType.toUpperCase()}...`);
    await subscriptionService.upgradePlanService(
      userId, 
      planType, 
      transactionId, 
      Number(amount || 0)
    );
    console.log("✅ DATABASE UPDATED SUCCESSFULLY!");

    // 3. ✉️ SEND THE ADMIN EMAIL NOTIFICATION
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
       auth: {
          user: process.env.ADMIN_GMAIL_USER, // It is looking for ADMIN_GMAIL_USER!
          pass: process.env.ADMIN_GMAIL_PASS  
        }
      });

      const mailOptions = {
        from: process.env.ADMIN_GMAIL_USER,
        to: process.env.ADMIN_GMAIL_USER,     // 🔥 Sending TO your email
        subject: "💰 New Payment Received on Rentza!",
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #0077ff;">New Subscription Purchased! 🚀</h2>
            <p>A user just completed a payment via Safepay.</p>
            <hr />
            <p><strong>Plan Purchased:</strong> ${planType.toUpperCase()}</p>
            <p><strong>Amount:</strong> PKR ${amount || 'N/A'}</p>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>User ID:</strong> ${userId}</p>
            <p><strong>Status:</strong> <span style="color: green;">Paid</span></p>
            <p><strong>Environment:</strong> SANDBOX</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log("✉️ Admin receipt sent successfully!");
    } catch (emailError) {
      console.error("⚠️ Failed to send admin receipt:", emailError.message);
    }

    // 4. REDIRECT USER BACK TO THE HOME PAGE
    return res.redirect(`http://localhost:3000/?payment=success`);

  } catch (error) {
    console.error("🚨 CALLBACK CRASHED:", error);
    return res.redirect(`http://localhost:3000/profile/packages?payment=failed`);
  }
};
export const checkPaymentStatus = async (req, res) => {
  const { trackerToken, userId, planType } = req.query;

  try {
    const response = await fetch(`https://sandbox.api.getsafepay.com/order/v1/${trackerToken}`);
    const data = await response.json();

    if (data.data && (data.data.state === "TRACKER_ENDED" || data.data.state === "PAID")) {
      
      // 1. Determine the exact amount for the database record
      let amount = 0;
      if (planType === 'gold') amount = 1500;
      if (planType === 'premium') amount = 3000;

      const transactionId = data.data.reference || `TXN-${Date.now()}`;

      // 2. 🔥 THE FIX: Call your official service instead of the shortcut!
      // This will update the User AND create the Subscription receipt.
      await subscriptionService.upgradePlanService(
        userId, 
        planType, 
        transactionId, 
        amount
      );

      console.log(`✅ POLLING SUCCESS: ${planType.toUpperCase()} Subscription record created!`);
      return res.json({ status: "SUCCESS" });
    }

    return res.json({ status: "PENDING" });

  } catch (error) {
    console.error("🚨 Polling Error:", error);
    return res.status(500).json({ error: "Check failed" });
  }
};