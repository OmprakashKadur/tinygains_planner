import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const signature = headerList.get("x-razorpay-signature");

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    console.error("RAZORPAY_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Configuration error" }, { status: 500 });
  }

  // Verify Signature
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);
  const supabase = await createClient();

  console.log("Received Razorpay Webhook:", event.event);

  try {
    if (
      event.event === "subscription.activated" ||
      event.event === "subscription.charged"
    ) {
      const subscription = event.payload.subscription.entity;
      const userId = subscription.notes.user_id;
      // Note: If notes.user_id isn't reliable, you might need to look up via razorpay_subscription_id if it exists,
      // but for 'activated' it might be the first time we see it.
      // Ideally we ensure user_id is passed in notes during creation.

      if (userId) {
        // Upsert subscription
        await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            razorpay_subscription_id: subscription.id,
            plan: "pro",
            status: "active",
            current_period_end: new Date(
              subscription.current_end * 1000
            ).toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        ); // Assuming 1 sub per user for now, or match by razorpay_subscription_id

        // Actually, we should probably match by razorpay_subscription_id if updating,
        // but since we want to enforce 1 active sub per user, upserting by user_id is safer for this MVP logic.
        // A more robust system would handle multiple rows but strictly key off the sub id.

        // Let's try to upsert by razorpay_subscription_id if possible, but we need user_id for insert.
        // If we upsert by user_id, we overwrite their generic "free" row if it exists or their old sub.
      }
    } else if (
      event.event === "subscription.cancelled" ||
      event.event === "subscription.pending" ||
      event.event === "subscription.halted"
    ) {
      const subscription = event.payload.subscription.entity;
      // Find the subscription by razorpay_id
      await supabase
        .from("subscriptions")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("razorpay_subscription_id", subscription.id);
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" });
}
