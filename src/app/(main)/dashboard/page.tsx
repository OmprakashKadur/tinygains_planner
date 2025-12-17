import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/actions/dashboard";
import { DashboardClient } from "@/components/dashboard-client";
import { redirect } from "next/navigation";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { date } = await searchParams;

  // Fetch initial data (Last 30 days for daily, current year for others by default logic or all)
  // For the dashboard overview, we might want to be generous but reasonable.
  // Passing empty object uses defaults in getDashboardData
  // If date provided, use it for start/end or just general filtering.
  // Let's pass it as startDate/endDate to focus on that day?
  // Actually getDashboardData filters >= startDate.
  // If user wants specific date "focus", we should probably filter daily goals by EXACT date?
  // getDashboardData logic: if startDate && endDate provided, filters range.
  // So let's pass startDate=date, endDate=date
  const data = await getDashboardData(
    date ? { startDate: date, endDate: date } : {}
  );

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="container max-w-5xl mx-auto py-8 px-6 space-y-8 animate-fade-in-up">
      <div className="space-y-1">
        <h1 className="text-display-small font-bold text-on-surface tracking-tight">
          {greeting}, {user.user_metadata.full_name?.split(" ")[0] || "Planner"}
        </h1>
        <p className="text-body-large text-on-surface-variant">
          Here's what's on your plate today. You've got this!
        </p>
      </div>

      <DashboardClient initialData={data} date={date} />
    </div>
  );
}
