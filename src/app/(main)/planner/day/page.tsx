import { createClient } from "@/lib/supabase/server";
import { getDailyGoals, createDailyGoal } from "@/actions/daily-goals";
import { getWeeklyGoals } from "@/actions/goals";
import { GoalCard } from "@/components/goal-card";
import { PlannerHeader } from "@/components/planner-header";
import { redirect } from "next/navigation";
import { getISOWeek, format } from "date-fns";
import { Plus } from "lucide-react";
import { PeriodProgress } from "@/components/period-progress";
import Link from "next/link";

export default async function DayPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; filter?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const todayStr = new Date().toISOString().split("T")[0];
  const dateStr = params.date || todayStr;
  const filterId = params.filter || "all";
  const displayDate = new Date(dateStr);

  // Fetch Goals
  const allGoals = await getDailyGoals(dateStr);

  // Fetch relevant Weekly Goals for the dropdown
  const currentWeek = getISOWeek(displayDate);
  const currentYear = displayDate.getFullYear();
  const weeklyGoals = await getWeeklyGoals(currentYear, currentWeek);

  // Filter Goals
  const goals =
    filterId === "all"
      ? allGoals
      : allGoals.filter((g) => g.weekly_goal_id === filterId);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col gap-4">
        <PlannerHeader
          type="day"
          date={displayDate}
          title="Daily Plan"
          subtitle={displayDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        />

        {/* Context Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-surface-container-low p-3 rounded-lg border border-outline-variant/30">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mr-2">
            Context:
          </span>
          <Link
            href={`?date=${dateStr}&filter=all`}
            scroll={false}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              filterId === "all"
                ? "bg-primary text-on-primary border-primary"
                : "bg-surface border-outline-variant hover:bg-surface-variant"
            }`}
          >
            All Goals
          </Link>
          {weeklyGoals.map((wg) => (
            <Link
              key={wg.id}
              href={`?date=${dateStr}&filter=${wg.id}`}
              scroll={false}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border max-w-[200px] truncate ${
                filterId === wg.id
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface border-outline-variant hover:bg-surface-variant"
              }`}
            >
              {wg.title}
            </Link>
          ))}
        </div>
      </div>

      <PeriodProgress
        goals={allGoals}
        periodName="Daily"
        dateLabel={format(displayDate, "MMMM d, yyyy")}
        type="daily"
      />

      <div className="space-y-6">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            id={goal.id}
            title={goal.title}
            status={goal.status}
            type="daily_goals"
            subtitle={
              goal.weekly_goals?.title
                ? `Aligns with: ${goal.weekly_goals.title}`
                : undefined
            }
          />
        ))}

        {/* Inline Create Form */}
        <div className="bg-surface-container p-4 rounded-xl">
          <form action={createDailyGoal} className="flex flex-col gap-3">
            <input type="hidden" name="date" value={dateStr} />

            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant">
                Aligns with Week {currentWeek}:
              </span>
              <select
                name="weekly_goal_id"
                defaultValue={filterId === "all" ? "null" : filterId} // Auto-select context
                className="bg-transparent text-sm font-medium text-primary outline-none"
              >
                <option value="null">None</option>
                {weeklyGoals.map((wg) => (
                  <option key={wg.id} value={wg.id}>
                    {wg.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                name="title"
                placeholder="What needs to happen today?"
                className="flex-1 bg-transparent text-lg border-b border-transparent focus:border-primary outline-none"
                required
                autoFocus
              />
              <button className="text-primary font-medium text-sm px-3 py-1 bg-primary/10 rounded-full hover:bg-primary/20 flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
