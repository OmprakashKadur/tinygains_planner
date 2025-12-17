import {
  getMonthlyGoals,
  createMonthlyGoal,
  getYearlyGoals,
} from "@/actions/goals";
import { GoalCard } from "@/components/goal-card";
import { PlannerHeader } from "@/components/planner-header";
import { Plus } from "lucide-react";
import { PeriodProgress } from "@/components/period-progress";
import Link from "next/link";

export default async function MonthPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const today = new Date();
  const year = params.year ? parseInt(params.year) : today.getFullYear();
  const month = params.month ? parseInt(params.month) : today.getMonth() + 1; // 1-12
  const filterId = params.filter || "all";

  const allGoals = await getMonthlyGoals(year, month);
  const yearlyGoals = await getYearlyGoals(year); // For selection

  // Filter based on selection
  const goals =
    filterId === "all"
      ? allGoals
      : allGoals.filter((g) => g.yearly_goal_id === filterId);

  const monthName = new Date(year, month - 1).toLocaleString("default", {
    month: "long",
  });
  const date = new Date(year, month - 1, 1);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col gap-4">
        <PlannerHeader
          type="month"
          date={date}
          title={`${monthName} ${year}`}
          subtitle="Break down your yearly vision into monthly milestones."
        />

        {/* Context Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-surface-container-low p-3 rounded-lg border border-outline-variant/30">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mr-2">
            Context:
          </span>
          <Link
            href={`?year=${year}&month=${month}&filter=all`}
            scroll={false}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              filterId === "all"
                ? "bg-primary text-on-primary border-primary"
                : "bg-surface border-outline-variant hover:bg-surface-variant"
            }`}
          >
            All Goals
          </Link>
          {yearlyGoals.map((yg) => (
            <Link
              key={yg.id}
              href={`?year=${year}&month=${month}&filter=${yg.id}`}
              scroll={false}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border max-w-[200px] truncate ${
                filterId === yg.id
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface border-outline-variant hover:bg-surface-variant"
              }`}
            >
              {yg.title}
            </Link>
          ))}
        </div>
      </div>

      <PeriodProgress
        goals={goals}
        periodName="Monthly"
        dateLabel={`${date.toLocaleString("default", {
          month: "long",
        })} ${year}`}
        type="monthly"
      />

      <section className="space-y-3">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            id={goal.id}
            title={goal.title}
            status={goal.status}
            type="monthly_goals"
            subtitle={
              goal.yearly_goals?.title
                ? `Aligns with: ${goal.yearly_goals.title}`
                : undefined
            }
          />
        ))}

        {/* Inline Create Form */}
        <div className="bg-surface-container p-4 rounded-xl flex items-center gap-4">
          <form
            action={createMonthlyGoal}
            className="flex-1 flex gap-4 items-center"
          >
            <input type="hidden" name="year" value={year} />
            <input type="hidden" name="month" value={month} />

            <select
              name="yearly_goal_id"
              defaultValue={filterId === "all" ? "null" : filterId} // Auto-select context
              className="bg-transparent border-b border-outline text-sm py-2 px-1 outline-none focus:border-primary max-w-[150px]"
            >
              <option value="null">No Alignment</option>
              {yearlyGoals.map((yg) => (
                <option key={yg.id} value={yg.id}>
                  {yg.title}
                </option>
              ))}
            </select>

            <input
              name="title"
              placeholder="Add a monthly goal..."
              className="flex-1 bg-transparent border-none outline-none text-on-surface placeholder:text-on-surface-variant"
              required
            />

            <button className="bg-primary text-on-primary p-2 rounded-full hover:shadow-md transition-all">
              <Plus className="w-5 h-5" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
