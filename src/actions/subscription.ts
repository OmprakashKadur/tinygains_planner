"use server";

import { createClient } from "@/lib/supabase/server";
import { razorpay } from "@/lib/razorpay";
import { redirect } from "next/navigation";
import { addDays } from "date-fns";

// Helper to get typed client with Any for custom tables
const createTypedClient = async () => {
  const supabase = await createClient();
  return supabase;
};

export async function getPlans() {
  const supabase = await createTypedClient();
  // @ts-ignore: plans table not in generated types
  const { data } = await supabase
    .from("plans")
    .select("*")
    .eq("active", true)
    .order("price");
  return data || [];
}

export async function startTrialAction(planId: string) {
  const supabase = await createTypedClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check if user already has an active subscription or previously active
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (existing && (existing.status === "active" || existing.trial_end)) {
    // If checking for "ever used trial", we might need a flag. For now, block if anything exists.
    // In dev we might delete rows to test.
    return { error: "You already have an active subscription or trial." };
  }

  // Fetch plan
  // @ts-ignore
  const { data: plan } = await supabase
    .from("plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (!plan) return { error: "Invalid plan." };
  // @ts-ignore
  if (!plan.trial_days || plan.trial_days <= 0) {
    return { error: "This plan does not offer a free trial." };
  }

  // @ts-ignore
  const trialEnd = addDays(new Date(), plan.trial_days);

  const { error } = await supabase.from("subscriptions").insert({
    user_id: user.id,
    plan_id: planId,
    status: "active", // Active access during trial
    trial_start: new Date().toISOString(),
    trial_end: trialEnd.toISOString(),
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function createSubscriptionAction(planId: string) {
  const supabase = await createTypedClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 1. Fetch Plan details
  // @ts-ignore
  const { data: plan } = await supabase
    .from("plans")
    .select("*")
    .eq("id", planId)
    .single();

  // @ts-ignore
  if (!plan || !plan.razorpay_plan_id) {
    return { error: "Plan configuration missing." };
  }

  // @ts-ignore
  if (plan.razorpay_plan_id.includes("placeholder")) {
    return {
      error:
        "Configuration Error: Please update the database with valid Razorpay Plan IDs.",
    };
  }

  // 2. Check existing
  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (
    existingSub &&
    existingSub.status === "active" &&
    !existingSub.trial_end
  ) {
    // Already fully paid active (not just trial)
    return { error: "You are already subscribed to Pro." };
  }

  try {
    // 3. Create a Razorpay Subscription
    const subscription = await razorpay.subscriptions.create({
      // @ts-ignore
      plan_id: plan.razorpay_plan_id,
      customer_notify: 1,
      total_count: 120, // 10 years monthly
      quantity: 1,
      notes: {
        user_id: user.id, // Pass user_id to webhook via notes
        plan_id: planId,
      },
    });

    // 4. Return the subscription_id to the client to open Checkout
    return {
      success: true,
      subscriptionId: subscription.id,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    };
  } catch (error: any) {
    console.error("Error creating subscription:", error);
    return {
      error:
        error?.error?.description ||
        error?.message ||
        "Failed to create subscription",
    };
  }
}

export async function getSubscription() {
  const supabase = await createTypedClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // @ts-ignore
  const { data } = await supabase
    .from("subscriptions")
    .select("*, plans(*)")
    .eq("user_id", user.id)
    .single();

  return data;
}
