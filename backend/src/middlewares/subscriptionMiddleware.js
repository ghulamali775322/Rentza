import User from "../models/user.js";

export const checkAdLimit = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id || req.body.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: User ID missing" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const now = new Date();

    // 1. THE EXPIRATION CHECK (Placed FIRST just like you suggested!)
    // If they have an expiration date AND today is past that date...
    if (user.planExpiresAt && now > user.planExpiresAt) {
      // The 30 days are over! Reset their account completely.
      user.planType = "free";      // Paid users drop to free, Free users stay free
      user.adsPostedCount = 0;     // Reset their posted ads to 0
      user.planExpiresAt = null;   // Clear the old date
      await user.save();           // Save the reset state to database!
    }

    // 2. GET CURRENT STATS (These might have just been reset to 0 in step 1!)
    const currentPlan = user.planType || "free";
    const postedCount = user.adsPostedCount || 0;

    // 3. SET MAX LIMITS
    let maxAdsAllowed = 1; // Free users get 1
    if (currentPlan === "gold") maxAdsAllowed = 2; // Gold gets 2
    if (currentPlan === "premium") maxAdsAllowed = 3; // Premium gets 3

    // 4. BLOCK IF THEY HIT THE LIMIT
    if (postedCount >= maxAdsAllowed) {
      
      // If they are a Free user, tell them exactly what day they can post again
      if (currentPlan === "free" && user.planExpiresAt) {
        const availableDate = new Date(user.planExpiresAt).toLocaleDateString('en-GB'); // Formats to DD/MM/YYYY
        return res.status(403).json({
          success: false,
          message: `Free limit reached. Your next free ad is available on ${availableDate}, or upgrade your package!`,
          requiresUpgrade: true
        });
      } 
      
      // If they are a Paid user, tell them to renew
      return res.status(403).json({
        success: false,
        message: `Limit Reached! Your ${currentPlan.toUpperCase()} plan allows a maximum of ${maxAdsAllowed} ad(s). Please renew or upgrade.`,
        requiresUpgrade: true 
      });
    }

    // 5. SUCCESS! Pass the user to the controller so it can save the ad.
    req.userDoc = user;
    next();
    
  } catch (error) {
    console.error("❌ Subscription Middleware Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};