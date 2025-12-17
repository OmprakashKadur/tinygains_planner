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
  date,
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
  const todayStr = new Date().toISOString().split("T")[0];
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
  const postponedToday = todaysGoals.filter(
    (g) => g.status === "postponed"
  ).length;
  const totalToday = todaysGoals.length;

  const progressPercentage =
    totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

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
  const completedMonthly = initialData.monthly.filter(
    (g) => g.status === "completed"
  ).length;
  const totalMonthly = initialData.monthly.length;

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
  const filteredHierarchyDaily = useMemo(() => {
    // Find weekly goals in the selected filter
    const activeWeeklyIds = new Set(filteredWeekly.map((w) => w.id));
    return initialData.daily.filter(
      (d) => d.weekly_goal_id && activeWeeklyIds.has(d.weekly_goal_id)
    );
  }, [initialData.daily, filteredWeekly]);

  // --- Date Navigation ---
  // Since we rely on initialData being filtered by server, we just perform a naive date check.
  // Actually, for a proper Date Selector, we'd need to change the URL.
  // For now, let's just display the date and maybe a link to /planner/day?
  // The user asked for "date selector" in dashboard.
  // Let's assume standard behavior: Change URL ?date=YYYY-MM-DD
  // We need to import useRouter

  // Note: We need to import useRouter at the top (file edit required for import).

  return (
    <div className="space-y-12 animate-fade-in-up">
      {/* --- SECTION 1: TODAY'S FOCUS (Top) --- */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress Card (Moved from Page) */}
        {/* Daily Briefing Card */}
        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 flex flex-col justify-between relative overflow-hidden group min-h-[320px] shadow-sm">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          {/* Header */}
          <div className="z-10 relative">
            <div className="text-on-surface-variant text-sm font-medium mb-1">
              {format(new Date(), "EEEE, MMMM do")}
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-2">
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
          <div className="z-10 relative my-6">
            {todaysGoals.filter((g) => g.status !== "completed").length > 0 ? (
              <div className="bg-surface rounded-xl p-4 border border-outline-variant/50 shadow-sm relative group/task hover:border-primary/30 transition-colors">
                <div className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Target className="w-3 h-3 text-primary" /> Up Next
                </div>
                <div className="font-semibold text-lg text-on-surface line-clamp-2">
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
                          "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
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
              <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20 text-green-700 dark:text-green-300">
                <div className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> All Caught Up!
                </div>
                <p className="text-sm mt-1 opacity-90">
                  Great job crushing your goals today.
                </p>
              </div>
            )}
          </div>

          {/* Footer Stats */}
          <div className="z-10 relative grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/50">
            <div>
              <div className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider font-bold">
                Yearly Goal
              </div>
              <div className="text-sm font-semibold text-on-surface">
                {completedYearly} / {totalYearly}{" "}
                <span className="text-[10px] font-normal opacity-70">Done</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider font-bold">
                Pending
              </div>
              <div className="text-sm font-semibold text-on-surface">
                {pendingToday} Tasks
              </div>
            </div>
          </div>
        </div>

        {/* Today's Task List + Quick Add */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-surface-container-low rounded-xl border border-outline-variant/30 overflow-hidden">
            {/* Quick Add Header */}
            {!isAddExpanded ? (
              <button
                onClick={() => setIsAddExpanded(true)}
                className="w-full p-4 flex items-center gap-3 text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-all text-sm font-medium border-b border-transparent hover:border-outline-variant/50"
              >
                <div className="p-1 rounded-full bg-primary/10 text-primary">
                  <Plus className="w-5 h-5" />
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
                className="p-4 space-y-4 bg-surface-container"
              >
                <input type="hidden" name="date" value={todayStr} />
                <input
                  name="title"
                  autoFocus
                  required
                  placeholder="What needs to be done today?"
                  className="w-full bg-transparent text-lg font-medium outline-none placeholder:text-on-surface-variant/50 text-on-surface border-b border-outline-variant focus:border-primary pb-2"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddExpanded(false)}
                    className="px-3 py-1 text-xs font-bold text-on-surface-variant"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isPending}
                    className="px-3 py-1 bg-primary text-on-primary rounded-md text-xs font-bold flex items-center gap-2"
                  >
                    {isPending && <Loader2 className="w-3 h-3 animate-spin" />}{" "}
                    Add
                  </button>
                </div>
              </form>
            )}

            {/* Actual List */}
            <div className="max-h-[300px] overflow-y-auto p-2">
              {todaysGoals.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant text-sm">
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
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-title-large font-bold text-on-surface">
            Strategic Alignment
          </h2>
          <div className="h-px flex-1 bg-outline-variant/50" />
        </div>

        {/* Level 1: Yearly Goals */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-2 pl-1">
            <Target className="w-4 h-4" /> 1. Select Yearly Vision
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                  "group relative flex items-center text-left p-3 pl-4 rounded-lg border transition-all duration-200 hover:shadow-sm",
                  selectedYearId === goal.id
                    ? "bg-primary-container/20 border-primary ring-1 ring-primary"
                    : "bg-surface-container border-transparent hover:border-outline-variant hover:bg-surface-container-high"
                )}
              >
                {/* Status Color Strip */}
                <div
                  className={cn(
                    "absolute left-0 top-2 bottom-2 w-1 rounded-full transition-colors",
                    selectedYearId === goal.id
                      ? "bg-primary"
                      : "bg-outline-variant group-hover:bg-primary/50"
                  )}
                />

                <div className="flex flex-col justify-center flex-1 min-w-0 pl-3">
                  <span className="font-semibold text-sm text-on-surface truncate">
                    {goal.title}
                  </span>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                    Year {(goal as any).year}
                  </span>
                </div>

                <div className="flex items-center">
                  {selectedYearId === goal.id && (
                    <ChevronRight className="w-4 h-4 text-primary shrink-0 mr-1" />
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
          <div className="space-y-3 animate-in slide-in-from-left-4 fade-in duration-300">
            <div className="pl-4 md:pl-0">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-2 pl-1 mb-2">
                <Calendar className="w-4 h-4" /> 2. Select Monthly Milestone
              </h3>
              {filteredMonthly.length === 0 ? (
                <div className="bg-surface-container-low p-3 rounded-lg border border-dashed border-outline-variant text-sm text-on-surface-variant italic">
                  No monthly goals found.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {filteredMonthly.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() =>
                        setSelectedMonthId(
                          selectedMonthId === goal.id ? null : goal.id
                        )
                      }
                      className={cn(
                        "group relative flex items-center text-left p-2 pl-3 rounded-lg border transition-all duration-200",
                        selectedMonthId === goal.id
                          ? "bg-secondary-container/20 border-secondary ring-1 ring-secondary"
                          : "bg-surface-container border-transparent hover:border-outline-variant hover:bg-surface-container-high"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full transition-colors",
                          selectedMonthId === goal.id
                            ? "bg-secondary"
                            : "bg-outline-variant group-hover:bg-secondary/50"
                        )}
                      />
                      <div className="pl-3 flex-1 min-w-0">
                        <div className="font-medium text-sm text-on-surface truncate">
                          {goal.title}
                        </div>
                      </div>
                      <div className="shrink-0 ml-2">
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
          <div className="space-y-3 animate-in slide-in-from-left-4 fade-in duration-300">
            <div className="pl-4 md:pl-0">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-2 pl-1 mb-2">
                <CalendarDays className="w-4 h-4" /> 3. Weekly Execution
              </h3>
              {filteredWeekly.length === 0 ? (
                <div className="bg-surface-container-low p-4 rounded-lg border border-dashed border-outline-variant text-sm text-on-surface-variant italic">
                  No weekly plans defined for this month.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredWeekly.map((weekGoal) => (
                    <div
                      key={weekGoal.id}
                      className="bg-surface-container rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm"
                    >
                      <div className="p-3 bg-surface-container-high/50 border-b border-outline-variant/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-tertiary/10 text-tertiary-dark px-2 py-0.5 rounded uppercase tracking-wider">
                            Week Goal
                          </span>
                          <span className="font-bold text-on-surface">
                            {weekGoal.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-on-surface-variant capitalize">
                          {weekGoal.status.replace("_", " ")}
                        </span>
                      </div>

                      {/* Show filtered daily tasks for this week */}
                      <div className="p-3 bg-surface-container-low/50">
                        {/* We can re-use DashboardGoalList here, but let's filter correctly */}
                        {initialData.daily.filter(
                          (d) => d.weekly_goal_id === weekGoal.id
                        ).length === 0 ? (
                          <div className="text-xs text-on-surface-variant italic pl-2">
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
