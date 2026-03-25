import Pusher from "pusher";
import dotenv from "dotenv";

dotenv.config(); // Load the environment variables

// Create a new Pusher instance using the keys from your .env file
export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true, // Secure encrypted connection
});