import User from "../models/user.js";

export const checkAdLimit = async (req, res, next) => {
  try {
    // 1. Get the User ID (works with your authMiddleware or normal body requests)
    const userId = req.user?.id || req.user?._id || req.body.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: User ID missing" });
    }

    // 2. Find the user in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let currentPlan = user.planType || "free";
    const now = new Date();

    // 3. Downgrade to 'free' if their Gold/Premium plan has expired
    if (currentPlan !== "free" && user.planExpiresAt && now > user.planExpiresAt) {
      currentPlan = "free";
      await User.findByIdAndUpdate(userId, { planType: "free", planExpiresAt: null });
    }

    // 4. Determine max ads allowed based on their current active plan
    let maxAdsAllowed = 1; // Free users
    if (currentPlan === "gold") maxAdsAllowed = 2; // Gold users
    if (currentPlan === "premium") maxAdsAllowed = 3; // Premium users

    const postedCount = user.adsPostedCount || 0;

    // 5. Block the request if they have reached their limit
    if (postedCount >= maxAdsAllowed) {
      return res.status(403).json({
        success: false,
        message: `Limit Reached! Your ${currentPlan.toUpperCase()} plan allows a maximum of ${maxAdsAllowed} ad(s).`,
        requiresUpgrade: true 
      });
    }

    // 6. If they haven't reached the limit, let them create the ad!
    next();
  } catch (error) {
    console.error("❌ Subscription Middleware Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};