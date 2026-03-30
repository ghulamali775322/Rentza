import User from "../models/user.js";
import Subscription from "../models/subscription.js"; 
import Payment from "../models/payment.js"; 

export const upgradePlanService = async (userId, planType, transactionId, amount) => {
  let totalListing = 1;
  if (planType === "gold") totalListing = 2;
  else if (planType === "premium") totalListing = 3;

  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 30); 

  const newSubscription = await Subscription.create({
    userId: userId,
    subscriptionType: planType, 
    totalListing: totalListing,
    paymentAmount: amount,
    transactionId: transactionId || `TXN-${Date.now()}`,
    createdAt: new Date(),
  });

  await Payment.create({
    userId: userId,
    subscriptionId: newSubscription._id, 
    paymentAmount: amount,
    transactionId: transactionId || `TXN-${Date.now()}`,
    createdAt: new Date(),
  });

  return await User.findByIdAndUpdate(
    userId,
    { 
      $set: { 
        planType: planType, 
        planExpiresAt: expirationDate,
        adsPostedCount: 0 
      } 
    },
    { new: true }
  );
};

export const getSubscriptionStatusService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const now = new Date();
  let currentPlan = user.planType || "free";
  
  if (currentPlan !== "free" && user.planExpiresAt && now > user.planExpiresAt) {
    currentPlan = "free"; 
    await User.findByIdAndUpdate(userId, { planType: "free", planExpiresAt: null });
  }

  return { planType: currentPlan, adsPostedCount: user.adsPostedCount || 0, planExpiresAt: user.planExpiresAt || null };
};

export const generatePaymentPayload = async (userId, planType, price) => {
  const SAFEPAY_API_KEY = "sec_709a04fc-cc02-4022-9b80-c087be874c1c"; 
  
  // 🔥 THE FIX: A completely clean URL that Safepay cannot destroy
  const FRONTEND_CALLBACK = `http://localhost:3000/profile/packages?safepay=success`;
  const CANCEL_URL = `http://localhost:3000/profile/packages?safepay=failed`;

  try {
    const response = await fetch("https://sandbox.api.getsafepay.com/order/v1/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client: SAFEPAY_API_KEY,
        amount: Number(price) * 1, 
        currency: "PKR",
        environment: "sandbox"
      })
    });

    const data = await response.json();
    
    if (!data || !data.data || !data.data.token) {
      return { gatewayUrl: CANCEL_URL }; 
    }

    const trackerToken = data.data.token; 
    
    // 🔥 Send Safepay the clean success_url
    const checkoutUrl = `https://sandbox.api.getsafepay.com/checkout/pay?env=sandbox&beacon=${trackerToken}&source=custom&order_id=TXN-${Date.now()}&success_url=${encodeURIComponent(FRONTEND_CALLBACK)}&cancel_url=${encodeURIComponent(CANCEL_URL)}`;

    return { gatewayUrl: checkoutUrl };

  } catch (error) {
    console.error("Safepay Fetch Error:", error);
    return { gatewayUrl: CANCEL_URL };
  }
};