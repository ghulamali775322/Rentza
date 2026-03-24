import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. STANDARD LOGIN: Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request (Keeping your -passwordHash exact)
      req.user = await User.findById(decoded.id).select("-passwordHash");

      return next();
    }

    // 2. GOOGLE LOGIN: Check for the VIP Pass
    if (req.headers["x-google-email"]) {
      const userEmail = req.headers["x-google-email"];

      // Find the user by their Google email
      req.user = await User.findOne({ email: userEmail }).select(
        "-passwordHash",
      );

      if (req.user) {
        return next();
      } else {
        return res
          .status(401)
          .json({ message: "Not authorized, Google user not found" });
      }
    }

    // 3. If they have neither, reject them
    return res.status(401).json({ message: "Not authorized, token missing" });
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};
