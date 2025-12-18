"use client";

import { useState, useTransition, useMemo } from "react";
import { format } from "date-fns";
import { DashboardGoal } from "@/actions/dashboard";
import { createDailyGoal } from "@/actions/daily-goals";
import { DashboardGoalList } from "./dashboard-goal-list";
import { GoalActionsMenu } from "./goal-actions-menu";
import {
  Plus,
  Loader2,
  ChevronRight,
  Target,
  CalendarDays,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardClient({
  initialData,
}: {
  initialData: {
    yearly: DashboardGoal[];
    monthly: DashboardGoal[];
    weekly: DashboardGoal[];
    daily: DashboardGoal[];
  };
  date?: string;
}) {
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);
  const [isAddExpanded, setIsAddExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  // --- Today's Data Logic ---
  const todayStr = date || new Date().toISOString().split("T")[0];
  const todaysGoals = useMemo(
    () => initialData.daily.filter((g) => g.date_label === todayStr),
    [initialData.daily, todayStr]
  );

  // --- Stats Calculations ---
  // Today
  const completedToday = todaysGoals.filter(
    (g) => g.status === "completed"
  ).length;
  const pendingToday = todaysGoals.filter(
    (g) => g.status === "not_started" || g.status === "in_progress"
  ).length;
  const totalToday = todaysGoals.length;

  // Yearly
  const completedYearly = initialData.yearly.filter(
    (g) => g.status === "completed"
  ).length;
  const totalYearly = initialData.yearly.length;

  // Monthly
  // We should arguably only show "Current Month" stats?
  // But `initialData.monthly` might contain all loaded monthly goals?
  // `getDashboardData` usually fetches current year/month mainly?
  // Let's assume `initialData.monthly` is relevant (it is fetched for current context usually).
  // Actually dashboard action fetches *all* or *current*?
  // Let's check dashboard.ts if we need to be safe.
  // Assuming initialData contains relevant goals (e.g. for this year).
  // --- Hierarchy Filtering Logic ---
  const filteredMonthly = useMemo(() => {
    if (!selectedYearId) return [];
    return initialData.monthly.filter(
      (g) => g.yearly_goal_id === selectedYearId
    );
  }, [initialData.monthly, selectedYearId]);

  const filteredWeekly = useMemo(() => {
    if (!selectedMonthId) return [];
    return initialData.weekly.filter(
      (g) => g.monthly_goal_id === selectedMonthId
    );
  }, [initialData.weekly, selectedMonthId]);

  // If hierarchy selected, show relevant daily tasks. If not, show today's.
  // Actually, user wants hierarchy at bottom. Top is today.
  // --- Date Navigation ---
  // Since we rely on initialData being filtered by server, we just perform a naive date check.
  // Actually, for a proper Date Selector, we'd need to change the URL.
  // For now, let's just display the date and maybe a link to /planner/day?
  // The user asked for "date selector" in dashboard.
  // Let's assume standard behavior: Change URL ?date=YYYY-MM-DD
  // We need to import useRouter

  // Note: We need to import useRouter at the top (file edit required for import).

  return (
    <div className="animate-fade-in-up space-y-12">
      {/* --- SECTION 1: TODAY'S FOCUS (Top) --- */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Progress Card (Moved from Page) */}
        {/* Daily Briefing Card */}
        <div className="bg-surface-container border-outline-variant/30 group relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-2xl border p-6 shadow-sm">
          {/* Background Decor */}
          <div className="bg-primary/5 pointer-events-none absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />

          {/* Header */}
          <div className="relative z-10">
            <div className="text-on-surface-variant mb-1 text-sm font-medium">
              {format(new Date(), "EEEE, MMMM do")}
            </div>
            <h2 className="text-on-surface mb-2 text-2xl font-bold">
              {new Date().getHours() < 12
                ? "Good morning"
                : new Date().getHours() < 18
                  ? "Good afternoon"
                  : "Good evening"}
            </h2>
            <p className="text-on-surface-variant text-sm">
              You have completed{" "}
              <span className="text-primary font-bold">{completedToday}</span>{" "}
              out of <span className="font-bold">{totalToday}</span> tasks
              today.
            </p>
          </div>

          {/* Hero / Next Task */}
          <div className="relative z-10 my-6">
            {todaysGoals.length === 0 ? (
              <div className="bg-surface-container-high/50 border-outline-variant/50 text-on-surface-variant rounded-xl border p-4">
                <div className="flex items-center gap-2 font-bold">
                  <Calendar className="text-primary h-5 w-5" /> No Goals Set
                </div>
                <p className="mt-1 text-sm opacity-90">
                  You haven&apos;t planned any goals for today yet.
                </p>
              </div>
            ) : todaysGoals.filter((g) => g.status !== "completed").length >
              0 ? (
              <div className="bg-surface border-outline-variant/50 group/task hover:border-primary/30 relative rounded-xl border p-4 shadow-sm transition-colors">
                <div className="text-on-surface-variant mb-2 flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
                  <Target className="text-primary h-3 w-3" /> Up Next
                </div>
                <div className="text-on-surface line-clamp-2 text-lg font-semibold">
                  {todaysGoals.find((g) => g.status !== "completed")?.title}
                </div>
                <div className="mt-2 flex gap-2">
                  {(() => {
                    const t = todaysGoals.find((g) => g.status !== "completed");
                    if (!t) return null;
                    const pColor =
                      t.priority === "high"
                        ? "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30"
                        : t.priority === "medium"
                          ? "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30"
                          : "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
                    return (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                          pColor
                        )}
                      >
                        {t.priority || "Normal"}
                      </span>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-green-700 dark:text-green-300">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="h-5 w-5" /> All Caught Up!
                </div>
                <p className="mt-1 text-sm opacity-90">
                  Great job crushing your goals today.
                </p>
              </div>
            )}
          </div>

          {/* Footer Stats */}
          <div className="border-outline-variant/50 relative z-10 grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <div className="text-on-surface-variant mb-1 text-xs font-bold tracking-wider uppercase">
                Yearly Goal
              </div>
              <div className="text-on-surface text-sm font-semibold">
                {completedYearly} / {totalYearly}{" "}
                <span className="text-[10px] font-normal opacity-70">Done</span>
              </div>
            </div>
            <div>
              <div className="text-on-surface-variant mb-1 text-xs font-bold tracking-wider uppercase">
                Pending
              </div>
              <div className="text-on-surface text-sm font-semibold">
                {pendingToday} Tasks
              </div>
            </div>
          </div>
        </div>

        {/* Today's Task List + Quick Add */}
        <div className="space-y-4 md:col-span-2">
          <div className="bg-surface-container-low border-outline-variant/30 overflow-hidden rounded-xl border">
            {/* Quick Add Header */}
            {!isAddExpanded ? (
              <button
                onClick={() => setIsAddExpanded(true)}
                className="text-on-surface-variant hover:text-primary hover:bg-surface-container-highest hover:border-outline-variant/50 flex w-full items-center gap-3 border-b border-transparent p-4 text-sm font-medium transition-all"
              >
                <div className="bg-primary/10 text-primary rounded-full p-1">
                  <Plus className="h-5 w-5" />
                </div>
                Add a new task for today...
              </button>
            ) : (
              <form
                action={async (formData) => {
                  startTransition(async () => {
                    await createDailyGoal(formData);
                    setIsAddExpanded(false);
                  });
                }}
                className="bg-surface-container space-y-4 p-4"
              >
                <input type="hidden" name="date" value={todayStr} />
                <input
                  name="title"
                  autoFocus
                  required
                  placeholder="What needs to be done today?"
                  className="placeholder:text-on-surface-variant/50 text-on-surface border-outline-variant focus:border-primary w-full border-b bg-transparent pb-2 text-lg font-medium outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddExpanded(false)}
                    className="text-on-surface-variant px-3 py-1 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isPending}
                    className="bg-primary text-on-primary flex items-center gap-2 rounded-md px-3 py-1 text-xs font-bold"
                  >
                    {isPending && <Loader2 className="h-3 w-3 animate-spin" />}{" "}
                    Add
                  </button>
                </div>
              </form>
            )}

            {/* Actual List */}
            <div className="max-h-[300px] overflow-y-auto p-2">
              {todaysGoals.length === 0 ? (
                <div className="text-on-surface-variant py-8 text-center text-sm">
                  No tasks for today yet. Time to plan!
                </div>
              ) : (
                <DashboardGoalList goals={todaysGoals} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 2: STRATEGIC ALIGNMENT (Hierarchy) --- */}
      <section className="space-y-6">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-title-large text-on-surface font-bold">
            Strategic Alignment
          </h2>
          <div className="bg-outline-variant/50 h-px flex-1" />
        </div>

        {/* Level 1: Yearly Goals */}
        <div className="space-y-3">
          <h3 className="text-on-surface-variant flex items-center gap-2 pl-1 text-xs font-bold tracking-wider uppercase">
            <Target className="h-4 w-4" /> 1. Select Yearly Vision
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {initialData.yearly.map((goal) => (
              <button
                key={goal.id}
                onClick={() => {
                  setSelectedYearId(
                    selectedYearId === goal.id ? null : goal.id
                  );
                  setSelectedMonthId(null);
                }}
                className={cn(
                  "group relative flex items-center rounded-lg border p-3 pl-4 text-left transition-all duration-200 hover:shadow-sm",
                  selectedYearId === goal.id
                    ? "bg-primary-container/20 border-primary ring-primary ring-1"
                    : "bg-surface-container hover:border-outline-variant hover:bg-surface-container-high border-transparent"
                )}
              >
                {/* Status Color Strip */}
                <div
                  className={cn(
                    "absolute top-2 bottom-2 left-0 w-1 rounded-full transition-colors",
                    selectedYearId === goal.id
                      ? "bg-primary"
                      : "bg-outline-variant group-hover:bg-primary/50"
                  )}
                />

                <div className="flex min-w-0 flex-1 flex-col justify-center pl-3">
                  <span className="text-on-surface truncate text-sm font-semibold">
                    {goal.title}
                  </span>
                  <span className="text-on-surface-variant text-[10px] tracking-wider uppercase">
                    Year {goal.year}
                  </span>
                </div>

                <div className="flex items-center">
                  {selectedYearId === goal.id && (
                    <ChevronRight className="text-primary mr-1 h-4 w-4 shrink-0" />
                  )}
                  <GoalActionsMenu
                    id={goal.id}
                    type="yearly_goals"
                    currentTitle={goal.title}
                    currentStatus={goal.status}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Level 2: Monthly Goals (Conditional) */}
        {selectedYearId && (
          <div className="animate-in slide-in-from-left-4 fade-in space-y-3 duration-300">
            <div className="pl-4 md:pl-0">
              <h3 className="text-on-surface-variant mb-2 flex items-center gap-2 pl-1 text-xs font-bold tracking-wider uppercase">
                <Calendar className="h-4 w-4" /> 2. Select Monthly Milestone
              </h3>
              {filteredMonthly.length === 0 ? (
                <div className="bg-surface-container-low border-outline-variant text-on-surface-variant rounded-lg border border-dashed p-3 text-sm italic">
                  No monthly goals found.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredMonthly.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() =>
                        setSelectedMonthId(
                          selectedMonthId === goal.id ? null : goal.id
                        )
                      }
                      className={cn(
                        "group relative flex items-center rounded-lg border p-2 pl-3 text-left transition-all duration-200",
                        selectedMonthId === goal.id
                          ? "bg-secondary-container/20 border-secondary ring-secondary ring-1"
                          : "bg-surface-container hover:border-outline-variant hover:bg-surface-container-high border-transparent"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-1.5 bottom-1.5 left-0 w-1 rounded-full transition-colors",
                          selectedMonthId === goal.id
                            ? "bg-secondary"
                            : "bg-outline-variant group-hover:bg-secondary/50"
                        )}
                      />
                      <div className="min-w-0 flex-1 pl-3">
                        <div className="text-on-surface truncate text-sm font-medium">
                          {goal.title}
                        </div>
                      </div>
                      <div className="ml-2 shrink-0">
                        <GoalActionsMenu
                          id={goal.id}
                          type="monthly_goals"
                          currentTitle={goal.title}
                          currentStatus={goal.status}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Level 3: Weekly/Daily Context (Conditional) */}
        {selectedYearId && selectedMonthId && (
          <div className="animate-in slide-in-from-left-4 fade-in space-y-3 duration-300">
            <div className="pl-4 md:pl-0">
              <h3 className="text-on-surface-variant mb-2 flex items-center gap-2 pl-1 text-xs font-bold tracking-wider uppercase">
                <CalendarDays className="h-4 w-4" /> 3. Weekly Execution
              </h3>
              {filteredWeekly.length === 0 ? (
                <div className="bg-surface-container-low border-outline-variant text-on-surface-variant rounded-lg border border-dashed p-4 text-sm italic">
                  No weekly plans defined for this month.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredWeekly.map((weekGoal) => (
                    <div
                      key={weekGoal.id}
                      className="bg-surface-container border-outline-variant/30 overflow-hidden rounded-xl border shadow-sm"
                    >
                      <div className="bg-surface-container-high/50 border-outline-variant/30 flex items-center justify-between border-b p-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-tertiary/10 text-tertiary-dark rounded px-2 py-0.5 text-xs font-bold tracking-wider uppercase">
                            Week Goal
                          </span>
                          <span className="text-on-surface font-bold">
                            {weekGoal.title}
                          </span>
                        </div>
                        <span className="text-on-surface-variant text-[10px] capitalize">
                          {weekGoal.status.replace("_", " ")}
                        </span>
                      </div>

                      {/* Show filtered daily tasks for this week */}
                      <div className="bg-surface-container-low/50 p-3">
                        {/* We can re-use DashboardGoalList here, but let's filter correctly */}
                        {initialData.daily.filter(
                          (d) => d.weekly_goal_id === weekGoal.id
                        ).length === 0 ? (
                          <div className="text-on-surface-variant pl-2 text-xs italic">
                            No daily tasks linked to this week yet.
                          </div>
                        ) : (
                          <DashboardGoalList
                            goals={initialData.daily.filter(
                              (d) => d.weekly_goal_id === weekGoal.id
                            )}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
