"use client";

import {
  createSubscriptionAction,
  getPlans,
  getSubscription, // Added getSubscription
} from "@/actions/subscription";
import { useEffect, useState } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react"; // Added AlertCircle
import Script from "next/script";

// Razorpay types (simplified)
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  modal: {
    ondismiss: () => void;
  };
  theme: {
    color: string;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface Plan {
  id: string;
  name: string;
  price: number;
  offer_text?: string;
  interval: string;
}

interface Subscription {
  status: string;
  trial_end?: string;
}

export default function PricingPage() {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null); // Added subscription state
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    // Fetch both plans and subscription status
    Promise.all([getPlans(), getSubscription()]).then(
      ([plansData, subData]) => {
        setPlans((plansData as unknown as Plan[]) || []);
        setSubscription(subData as Subscription);
        setIsFetching(false);
      }
    );
  }, []);

  const handleAction = async (plan: Plan) => {
    setLoadingPlanId(plan.id);

    // Direct Payment Logic (Trial is assumed to be auto-assigned on signup or not explicitly started via button)
    const result = await createSubscriptionAction(plan.id);

    if (result.error) {
      alert(result.error);
      setLoadingPlanId(null);
      return;
    }

    if (result.success && result.subscriptionId) {
      const options = {
        key: result.key,
        subscription_id: result.subscriptionId,
        name: "FocusFlow Pro",
        description: plan.name,
        handler: function (response: RazorpayResponse) {
          alert(
            "Subscription Successful! Payment ID: " +
              response.razorpay_payment_id
          );
          window.location.href = "/dashboard";
        },
        modal: {
          ondismiss: function () {
            setLoadingPlanId(null);
          },
        },
        theme: {
          color: "#000000",
        },
      };

      const rzp = new window.Razorpay(options as unknown as RazorpayOptions);
      rzp.open();
    } else {
      setLoadingPlanId(null);
    }
  };

  // Fallbacks if DB is empty or specific plans are not found
  const monthly = plans.find((p) => p.id === "monthly") || {
    id: "monthly",
    name: "Monthly",
    price: 79,
    offer_text: "Offer",
    interval: "month",
  };
  const yearly = plans.find((p) => p.id === "yearly") || {
    id: "yearly",
    name: "Yearly",
    price: 699,
    offer_text: "Best Value",
    interval: "year",
  };

  // Trial Check
  const isTrialActive =
    subscription?.status === "active" &&
    subscription.trial_end &&
    new Date(subscription.trial_end) > new Date();

  // Calculate days left for trial banner
  const getDaysLeft = () => {
    if (!subscription?.trial_end) return 0;
    const end = new Date(subscription.trial_end);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      {/* Trial Banner */}
      {isTrialActive && (
        <div className="animate-in fade-in slide-in-from-top-4 mx-auto mb-8 flex max-w-5xl items-center gap-4 rounded-xl border border-green-500/30 bg-green-500/10 px-6 py-4 text-green-700 shadow-sm dark:text-green-300">
          <div className="rounded-full bg-green-500/20 p-2">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-bold">7-Day Free Trial Active</div>
            <div className="text-sm opacity-90">
              You have full Pro access. Your trial expires in{" "}
              <span className="font-bold underline">{getDaysLeft()} days</span>.
              Subscribe now to continue seamlessly.
            </div>
          </div>
        </div>
      )}

      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Simple Pricing
        </h1>
        <p className="text-muted-foreground mt-4 text-xl">
          Invest in your focus.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
        {/* Monthly Plan */}
        <div className="bg-card relative flex flex-col overflow-hidden rounded-xl border p-8 shadow-sm">
          <div className="absolute top-0 left-0 rounded-br-lg bg-green-500 px-3 py-1 text-xs font-bold text-white">
            {monthly.offer_text}
          </div>
          <h3 className="text-2xl font-bold">{monthly.name}</h3>
          <div className="mt-4">
            <span className="text-muted-foreground mr-2 text-xl line-through">
              ₹99
            </span>
            <span className="text-4xl font-bold">₹{monthly.price}</span>
            <span className="text-muted-foreground text-lg font-normal">
              /{monthly.interval === "month" ? "mo" : monthly.interval}
            </span>
          </div>
          <ul className="mt-8 flex-1 space-y-4">
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" /> Unlock all features
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" /> Cancel anytime
            </li>
          </ul>
          <button
            onClick={() => handleAction(monthly)}
            disabled={loadingPlanId !== null}
            className="border-primary text-primary hover:bg-primary/5 mt-8 w-full rounded-lg border py-3 font-bold transition-colors disabled:opacity-70"
          >
            {loadingPlanId === monthly.id
              ? "Processing..."
              : `Subscribe ${monthly.name}`}
          </button>
        </div>

        {/* Yearly Plan */}
        <div className="bg-primary text-primary-foreground relative flex flex-col overflow-hidden rounded-xl p-8 shadow-lg">
          <div className="absolute top-0 right-0 rounded-bl-lg bg-yellow-400 px-3 py-1 text-xs font-bold text-black">
            ⭐ {yearly.offer_text}
          </div>
          <h3 className="text-2xl font-bold">{yearly.name}</h3>
          <div className="mt-4">
            <div className="text-4xl font-bold">
              ₹{yearly.price}
              <span className="text-lg font-normal opacity-80">
                /{yearly.interval === "year" ? "year" : yearly.interval}
              </span>
            </div>
            <div className="mt-1 text-sm font-medium text-yellow-300">
              Only ₹{Math.round(yearly.price / 12)}/month
            </div>
          </div>
          <ul className="mt-8 flex-1 space-y-4">
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-yellow-400" /> Save 25% vs Monthly
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-yellow-400" /> All Pro features
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-yellow-400" /> Priority Support
            </li>
          </ul>
          <button
            onClick={() => handleAction(yearly)}
            disabled={loadingPlanId !== null}
            className="bg-background text-foreground hover:bg-background/90 mt-8 w-full rounded-lg py-3 font-bold transition-colors disabled:opacity-70"
          >
            {loadingPlanId === yearly.id
              ? "Processing..."
              : `Subscribe ${yearly.name}`}{" "}
            {/* Changed button text */}
          </button>
        </div>
      </div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
    </div>
  );
}
