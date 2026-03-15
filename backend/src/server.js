import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import connectDB from "./config/db.js";
import { protect } from "./middlewares/authMiddleware.js";

dotenv.config();

connectDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

// Rate limiter (security)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use(limiter);

app.use("/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Rentza backend is running...");
});

app.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server successfully running on port ${PORT}`),
);
