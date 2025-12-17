"use client";

import { DashboardGoal } from "@/actions/dashboard";
import { cn } from "@/lib/utils";
import {
  Calendar,
  MoreVertical,
  PlayCircle,
  Circle,
  CheckCircle2,
  PauseCircle,
  Check,
} from "lucide-react";
import { updateDailyGoalStatus, deleteDailyGoal } from "@/actions/daily-goals";
import { updateGoalStatus, deleteGoal } from "@/actions/goals";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GoalActionsMenu } from "./goal-actions-menu";

export function DashboardGoalList({ goals }: { goals: DashboardGoal[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (goals.length === 0) {
    return (
      <div className="text-center py-12 text-on-surface-variant border-2 border-dashed border-outline-variant rounded-xl">
        No goals found matching your filters.
      </div>
    );
  }

  const handleChangeStatus = async (
    goal: DashboardGoal,
    newStatus: DashboardGoal["status"]
  ) => {
    if (goal.type === "daily") {
      await updateDailyGoalStatus(goal.id, newStatus);
    } else {
      await updateGoalStatus(`${goal.type}_goals` as any, goal.id, newStatus);
    }
  };

  const handleDelete = async (goal: DashboardGoal) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;

    setPendingId(goal.id);
    startTransition(async () => {
      if (goal.type === "daily") {
        await deleteDailyGoal(goal.id);
      } else {
        await deleteGoal(`${goal.type}_goals` as any, goal.id);
      }
      setPendingId(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      {goals.map((goal) => (
        <div
          key={goal.id}
          className={cn(
            "group relative flex items-center gap-4 p-4 bg-surface-container rounded-xl border border-transparent hover:border-outline-variant/50 transition-all hover:shadow-md hover:-translate-y-0.5 duration-300 hover:z-50",
            pendingId === goal.id && "opacity-50 pointer-events-none"
          )}
        >
          {/* Status Selector */}
          <div className="relative group/status shrink-0">
            <button
              className={cn(
                "transition-all rounded-full p-1 hover:bg-surface-variant/50",
                goal.status === "completed"
                  ? "" // Handled by inner element
                  : goal.status === "in_progress"
                  ? "text-tertiary animate-pulse-soft"
                  : "text-on-surface-variant"
              )}
            >
              {goal.status === "completed" ? (
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-sm">
                  <Check className="w-4 h-4 text-on-primary" strokeWidth={3} />
                </div>
              ) : goal.status === "in_progress" ? (
                <PlayCircle className="w-6 h-6" />
              ) : (
                <Circle className="w-6 h-6" />
              )}
            </button>

            {/* Hover Menu for Quick Cycle */}
            <div className="absolute left-0 top-6 pt-2 opacity-0 group-hover/status:opacity-100 pointer-events-none group-hover/status:pointer-events-auto transition-opacity z-50 w-40">
              <div className="bg-surface-container-high rounded-lg shadow-lg border border-outline-variant p-1 flex flex-col gap-1">
                <button
                  onClick={() => handleChangeStatus(goal, "not_started")}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-variant rounded-md w-full text-left"
                >
                  <Circle className="w-4 h-4" /> Not Started
                </button>
                <button
                  onClick={() => handleChangeStatus(goal, "in_progress")}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-tertiary hover:bg-surface-variant rounded-md w-full text-left"
                >
                  <PlayCircle className="w-4 h-4" /> In Progress
                </button>
                <button
                  onClick={() => handleChangeStatus(goal, "completed")}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-primary hover:bg-surface-variant rounded-md w-full text-left"
                >
                  <CheckCircle2 className="w-4 h-4" /> Completed
                </button>
                <button
                  onClick={() => handleChangeStatus(goal, "postponed")}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-on-surface-variant hover:bg-surface-variant rounded-md w-full text-left"
                >
                  <PauseCircle className="w-4 h-4" /> Postpone
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md tracking-wider",
                  goal.type === "yearly" &&
                    "bg-primary-container text-on-primary-container",
                  goal.type === "monthly" &&
                    "bg-secondary-container text-on-secondary-container",
                  goal.type === "weekly" &&
                    "bg-tertiary-container text-on-tertiary-container",
                  goal.type === "daily" &&
                    "bg-surface-variant text-on-surface-variant"
                )}
              >
                {goal.type}
              </span>
              <span className="text-xs text-on-surface-variant flex items-center gap-1 font-medium">
                <Calendar className="w-3 h-3" />
                {goal.date_label}
              </span>
            </div>
            <h3
              className={cn(
                "text-body-medium font-medium transition-all line-clamp-1",
                goal.status === "completed"
                  ? "text-on-surface-variant line-through decoration-primary/50"
                  : "text-on-surface"
              )}
            >
              {goal.title}
            </h3>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <div
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border hidden sm:block",
                goal.status === "completed"
                  ? "bg-green-100 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300"
                  : goal.status === "in_progress"
                  ? "bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300"
                  : goal.status === "postponed"
                  ? "bg-orange-100 border-orange-200 text-orange-700 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-300"
                  : "bg-surface-container-high border-outline-variant text-on-surface-variant"
              )}
            >
              {goal.status.replace("_", " ")}
            </div>

            <div className="ml-1">
              <GoalActionsMenu
                id={goal.id}
                type={
                  goal.type === "daily"
                    ? "daily_goals"
                    : (`${goal.type}_goals` as any)
                }
                currentTitle={goal.title}
                currentStatus={goal.status}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
