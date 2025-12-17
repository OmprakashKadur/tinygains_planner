import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getReportsData } from "@/actions/reports";
import { StatsCards } from "@/components/reports/stats-cards";
import { ActivityChart } from "@/components/reports/activity-chart";
import { RecentWins } from "@/components/reports/recent-achievements";
import { ProductivityHeatmap } from "@/components/reports/productivity-heatmap";
import { WeekdayChart } from "@/components/reports/weekday-chart";

export const metadata = {
  title: "Reports | FocusFlow Pro",
  description: "Productivity analytics and insights.",
};

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch report data
  const data = await getReportsData(30);

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">
            Productivity Dashboard
          </h1>
          <p className="text-on-surface-variant">
            Analyze your performance, focus, and consistency.
          </p>
        </div>
      </div>

      {/* 1. Summary Cards */}
      <StatsCards data={data.summary} />

      {/* 2. Consistency Heatmap (Full Width) */}
      <ProductivityHeatmap data={data.yearActivity} />

      {/* 3. Activity Trend (Full Width) */}
      <ActivityChart data={data.activity} />

      {/* 4. Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekday Analysis */}
        <div className="lg:col-span-1">
          <WeekdayChart data={data.weekdayStats} />
        </div>

        {/* Recent Wins */}
        <div className="lg:col-span-1">
          <RecentWins data={data.recentWins} />
        </div>
      </div>
    </div>
  );
}
