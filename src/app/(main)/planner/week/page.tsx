import {
  getWeeklyGoals,
  createWeeklyGoal,
  getMonthlyGoals,
} from "@/actions/goals";
import { GoalCard } from "@/components/goal-card";
import { PlannerHeader } from "@/components/planner-header";
import {
  getISOWeek,
  setISOWeek,
  setYear,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { PeriodProgress } from "@/components/period-progress";
import Link from "next/link";

export default async function WeekPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; year?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const today = new Date();
  const displayYear = params.year ? parseInt(params.year) : today.getFullYear();

  // Robust week handling
  const week = params.week ? parseInt(params.week) : getISOWeek(today);
  const filterId = params.filter || "all";

  // Construct a date object representing this week
  const date = setISOWeek(setYear(new Date(), displayYear), week);

  const allGoals = await getWeeklyGoals(displayYear, week);

  // Filter Goals
  const goals =
    filterId === "all"
      ? allGoals
      : allGoals.filter((g) => g.monthly_goal_id === filterId);

  // Approximate month for monthly goals linking... using the start of the week
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const month = weekStart.getMonth() + 1;
  const monthlyGoals = await getMonthlyGoals(displayYear, month);

  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  const dateRange = `${weekStart.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} - ${weekEnd.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`;

  return (
    <div className="animate-fade-in-up mx-auto max-w-3xl space-y-8">
      <div className="flex flex-col gap-4">
        <PlannerHeader
          type="week"
          date={date}
          title={`Week ${week}, ${displayYear}`}
          subtitle={dateRange}
        />

        {/* Context Filter Bar */}
        <div className="bg-surface-container-low border-outline-variant/30 flex flex-wrap items-center gap-2 rounded-lg border p-3">
          <span className="text-on-surface-variant mr-2 text-xs font-bold tracking-wider uppercase">
            Context:
          </span>
          <Link
            href={`?year=${displayYear}&week=${week}&filter=all`}
            scroll={false}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filterId === "all"
                ? "bg-primary text-on-primary border-primary"
                : "bg-surface border-outline-variant hover:bg-surface-variant"
            }`}
          >
            All Goals
          </Link>
          {monthlyGoals.map((mg) => (
            <Link
              key={mg.id}
              href={`?year=${displayYear}&week=${week}&filter=${mg.id}`}
              scroll={false}
              className={`max-w-[200px] truncate rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filterId === mg.id
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface border-outline-variant hover:bg-surface-variant"
              }`}
            >
              {mg.title}
            </Link>
          ))}
        </div>
      </div>

      <PeriodProgress
        goals={goals}
        periodName="Weekly"
        dateLabel={`Week ${week}, ${displayYear}`}
        type="weekly"
      />

      <section className="space-y-3">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            id={goal.id}
            title={goal.title}
            status={goal.status}
            type="weekly_goals"
            subtitle={
              goal.monthly_goals?.title
                ? `Aligns with: ${goal.monthly_goals.title}`
                : undefined
            }
          />
        ))}

        <div className="bg-surface-container rounded-xl p-4">
          <form action={createWeeklyGoal} className="flex flex-col gap-3">
            <input type="hidden" name="year" value={displayYear} />
            <input type="hidden" name="week" value={week} />

            <div className="flex items-center gap-2">
              <span className="text-on-surface-variant text-xs">
                Aligns with Month (
                {new Date(displayYear, month - 1).toLocaleString("default", {
                  month: "short",
                })}
                ):
              </span>
              <select
                name="monthly_goal_id"
                defaultValue={filterId === "all" ? "null" : filterId} // Auto-select context
                className="text-primary bg-transparent text-sm font-medium outline-none"
              >
                <option value="null">None</option>
                {monthlyGoals.map((mg) => (
                  <option key={mg.id} value={mg.id}>
                    {mg.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                name="title"
                placeholder="What needs to happen this week?"
                className="focus:border-primary flex-1 border-b border-transparent bg-transparent text-lg outline-none"
                required
                autoFocus
              />
              <button className="text-primary bg-primary/10 hover:bg-primary/20 rounded-full px-3 py-1 text-sm font-medium">
                Add
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Link to Daily Plan */}
      <div className="bg-secondary-container text-on-secondary-container mt-12 rounded-2xl p-6">
        <h3 className="text-title-medium mb-2 font-bold">Ready to execute?</h3>
        <p className="text-body-medium mb-4 opacity-80">
          Break these goals down into daily focus blocks.
        </p>
        <a
          href="/planner/day"
          className="bg-on-secondary-container text-secondary-container inline-flex rounded-full px-6 py-2 text-sm font-bold transition-opacity hover:opacity-90"
        >
          Go to Today&apos;s Plan
        </a>
      </div>
    </div>
  );
}
