import Razorpay from "razorpay";

// Note: These should be in your .env file
// NEXT_PUBLIC_RAZORPAY_KEY_ID
// RAZORPAY_KEY_SECRET

if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
  console.error("NEXT_PUBLIC_RAZORPAY_KEY_ID is not defined");
}

if (!process.env.RAZORPAY_KEY_SECRET) {
  console.error("RAZORPAY_KEY_SECRET is not defined");
}

export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});
