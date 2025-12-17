import {
  getWeeklyGoals,
  createWeeklyGoal,
  getMonthlyGoals,
} from "@/actions/goals";
import { GoalCard } from "@/components/goal-card";
import { PlannerHeader } from "@/components/planner-header";
import { Plus } from "lucide-react";
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
  let week = params.week ? parseInt(params.week) : getISOWeek(today);
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
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col gap-4">
        <PlannerHeader
          type="week"
          date={date}
          title={`Week ${week}, ${displayYear}`}
          subtitle={dateRange}
        />

        {/* Context Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-surface-container-low p-3 rounded-lg border border-outline-variant/30">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mr-2">
            Context:
          </span>
          <Link
            href={`?year=${displayYear}&week=${week}&filter=all`}
            scroll={false}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
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
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border max-w-[200px] truncate ${
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

        <div className="bg-surface-container p-4 rounded-xl">
          <form action={createWeeklyGoal} className="flex flex-col gap-3">
            <input type="hidden" name="year" value={displayYear} />
            <input type="hidden" name="week" value={week} />

            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant">
                Aligns with Month (
                {new Date(displayYear, month - 1).toLocaleString("default", {
                  month: "short",
                })}
                ):
              </span>
              <select
                name="monthly_goal_id"
                defaultValue={filterId === "all" ? "null" : filterId} // Auto-select context
                className="bg-transparent text-sm font-medium text-primary outline-none"
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
                className="flex-1 bg-transparent text-lg border-b border-transparent focus:border-primary outline-none"
                required
                autoFocus
              />
              <button className="text-primary font-medium text-sm px-3 py-1 bg-primary/10 rounded-full hover:bg-primary/20">
                Add
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Link to Daily Plan */}
      <div className="mt-12 p-6 bg-secondary-container rounded-2xl text-on-secondary-container">
        <h3 className="text-title-medium font-bold mb-2">Ready to execute?</h3>
        <p className="mb-4 text-body-medium opacity-80">
          Break these goals down into daily focus blocks.
        </p>
        <a
          href="/planner/day"
          className="inline-flex px-6 py-2 bg-on-secondary-container text-secondary-container rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
        >
          Go to Today's Plan
        </a>
      </div>
    </div>
  );
}
