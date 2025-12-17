import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User, Mail, Calendar, Crown, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { getSubscription } from "@/actions/subscription";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const subscription = await getSubscription();
  const isPro = subscription?.status === "active";

  return (
    <div className="container max-w-4xl mx-auto py-12 px-6 animate-fade-in-up">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-on-surface">My Profile</h1>
        <p className="text-on-surface-variant mt-2">
          Manage your account settings and subscription.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: User Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-primary/10" />
            <div className="relative pt-12">
              <div className="w-24 h-24 mx-auto bg-surface rounded-full p-2 shadow-sm border border-outline-variant">
                <div className="w-full h-full bg-primary/20 rounded-full flex items-center justify-center text-3xl font-bold text-primary">
                  {user.email?.[0].toUpperCase()}
                </div>
              </div>
              <h2 className="mt-4 text-xl font-bold text-on-surface">
                {user.user_metadata?.full_name || "User"}
              </h2>
              <div className="flex items-center justify-center gap-1 text-sm text-on-surface-variant mt-1">
                <Mail className="w-3 h-3" /> {user.email}
              </div>
              {isPro && (
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-bold border border-yellow-400/50">
                  <Crown className="w-3 h-3" /> PRO MEMBER
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Account Details */}
          <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30">
            <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Account Details
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface border border-outline-variant/50">
                  <label className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">
                    Email
                  </label>
                  <div
                    className="mt-1 font-semibold text-on-surface truncate"
                    title={user.email}
                  >
                    {user.email}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-outline-variant/50">
                  <label className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">
                    Joined
                  </label>
                  <div className="mt-1 font-semibold text-on-surface flex items-center gap-2">
                    <Calendar className="w-4 h-4 opacity-50" />
                    {format(new Date(user.created_at), "MMMM d, yyyy")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30">
            <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Subscription
            </h3>
            {isPro ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-primary text-lg">
                      FocusFlow Pro
                    </div>
                    <div className="text-sm text-on-surface-variant">
                      Active Plan
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">₹699</div>
                    <div className="text-xs text-on-surface-variant">
                      / year
                    </div>
                  </div>
                </div>
                <div className="text-sm text-on-surface-variant">
                  Your subscription is active. Thank you for supporting us!
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-on-surface-variant" />
                </div>
                <h4 className="text-lg font-bold text-on-surface">
                  You are on the Free Plan
                </h4>
                <p className="text-on-surface-variant text-sm max-w-md mx-auto mt-2 mb-6">
                  Upgrade to Pro to unlock unlimited focus blocks, advanced
                  analytics, and priority support.
                </p>
                <a
                  href="/pricing"
                  className="inline-flex items-center justify-center px-6 py-2 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 transition-all"
                >
                  Upgrade Now
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
