import { createClient } from "@/lib/supabase/server";
import { getYearlyGoals, createYearlyGoal } from "@/actions/goals";
import { GoalCard } from "@/components/goal-card";
import { PlannerHeader } from "@/components/planner-header";
import { Plus } from "lucide-react";

export default async function YearPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const params = await searchParams;
  const currentYear = params.year
    ? parseInt(params.year)
    : new Date().getFullYear();
  const goals = await getYearlyGoals(currentYear);
  const date = new Date(currentYear, 0, 1);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <PlannerHeader
        type="year"
        date={date}
        title={`${currentYear} Vision`}
        subtitle="Define your high-level objectives for the year."
      />

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            id={goal.id}
            title={goal.title}
            status={goal.status}
            type="yearly_goals"
            color={goal.color}
          />
        ))}

        {/* Add New Card */}
        <form
          action={createYearlyGoal}
          className="flex flex-col justify-center items-center p-6 border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors cursor-pointer min-h-[140px]"
        >
          <input type="hidden" name="year" value={currentYear} />
          <input
            type="text"
            name="title"
            placeholder="New Yearly Goal..."
            className="bg-transparent text-center outline-none w-full placeholder:text-on-surface-variant/50 font-medium"
            required
          />
          <button className="mt-2 flex items-center gap-2 text-sm font-medium">
            <Plus className="w-5 h-5" /> Add Goal
          </button>
        </form>
      </section>

      <div className="border-t border-outline-variant my-8" />

      <h2 className="text-title-large font-semibold text-on-surface mb-4">
        Months Overview
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <a
            href={`/planner/month?year=${currentYear}&month=${i + 1}`}
            key={i}
            className="block p-4 bg-surface-container rounded-lg border border-transparent hover:border-primary cursor-pointer transition-all hover:shadow-md"
          >
            <div className="font-bold text-lg text-primary">
              {new Date(0, i).toLocaleString("default", { month: "short" })}
            </div>
            <div className="text-xs text-on-surface-variant mt-1">
              View Plan &rarr;
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
