"use client";

import {
  createSubscriptionAction,
  getPlans,
  getSubscription, // Added getSubscription
} from "@/actions/subscription";
import { useEffect, useState } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react"; // Added AlertCircle
import Script from "next/script";
import { useRouter } from "next/navigation";

// Razorpay types (simplified)
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage() {
  const router = useRouter();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null); // Added subscription state
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    // Fetch both plans and subscription status
    Promise.all([getPlans(), getSubscription()]).then(
      ([plansData, subData]) => {
        setPlans(plansData || []);
        setSubscription(subData);
        setIsFetching(false);
      }
    );
  }, []);

  const handleAction = async (plan: any) => {
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
        handler: function (response: any) {
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

      const rzp = new window.Razorpay(options);
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Trial Banner */}
      {isTrialActive && (
        <div className="max-w-5xl mx-auto mb-8 bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 px-6 py-4 rounded-xl flex items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="p-2 bg-green-500/20 rounded-full">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-lg">7-Day Free Trial Active</div>
            <div className="text-sm opacity-90">
              You have full Pro access. Your trial expires in{" "}
              <span className="font-bold underline">{getDaysLeft()} days</span>.
              Subscribe now to continue seamlessly.
            </div>
          </div>
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Simple Pricing
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Invest in your focus.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Monthly Plan */}
        <div className="bg-card border p-8 rounded-xl shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
            {monthly.offer_text}
          </div>
          <h3 className="text-2xl font-bold">{monthly.name}</h3>
          <div className="mt-4">
            <span className="text-xl text-muted-foreground line-through mr-2">
              ₹99
            </span>
            <span className="text-4xl font-bold">₹{monthly.price}</span>
            <span className="text-lg font-normal text-muted-foreground">
              /{monthly.interval === "month" ? "mo" : monthly.interval}
            </span>
          </div>
          <ul className="mt-8 space-y-4 flex-1">
            <li className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" /> Unlock all features
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" /> Cancel anytime
            </li>
          </ul>
          <button
            onClick={() => handleAction(monthly)}
            disabled={loadingPlanId !== null}
            className="mt-8 w-full py-3 rounded-lg border border-primary text-primary font-bold hover:bg-primary/5 transition-colors disabled:opacity-70"
          >
            {loadingPlanId === monthly.id
              ? "Processing..."
              : `Subscribe ${monthly.name}`}
          </button>
        </div>

        {/* Yearly Plan */}
        <div className="bg-primary text-primary-foreground p-8 rounded-xl shadow-lg flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
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
            <div className="text-sm font-medium text-yellow-300 mt-1">
              Only ₹{Math.round(yearly.price / 12)}/month
            </div>
          </div>
          <ul className="mt-8 space-y-4 flex-1">
            <li className="flex items-center gap-2">
              <Check className="w-5 h-5 text-yellow-400" /> Save 25% vs Monthly
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-5 h-5 text-yellow-400" /> All Pro features
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-5 h-5 text-yellow-400" /> Priority Support
            </li>
          </ul>
          <button
            onClick={() => handleAction(yearly)}
            disabled={loadingPlanId !== null}
            className="mt-8 w-full py-3 rounded-lg bg-background text-foreground font-bold hover:bg-background/90 transition-colors disabled:opacity-70"
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
