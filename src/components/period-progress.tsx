"use client";

import { useMemo } from "react";
import { AchievementCard } from "./achievement-card";
import { cn } from "@/lib/utils";

interface Goal {
  status: "not_started" | "in_progress" | "completed" | "postponed";
}

interface PeriodProgressProps {
  goals: Goal[];
  periodName: string; // e.g., "Daily", "Weekly", "Monthly"
  dateLabel: string; // e.g., "Oct 24, 2023" or "Week 43"
  type: "daily" | "weekly" | "monthly" | "yearly";
}

export function PeriodProgress({
  goals,
  periodName,
  dateLabel,
  type,
}: PeriodProgressProps) {
  const stats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter((g) => g.status === "completed").length;
    return {
      total,
      completed,
      percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }, [goals]);

  if (stats.total === 0) return null;

  // If 100% complete, show Achievement Card
  if (stats.percentage === 100) {
    return (
      <div className="mb-8 flex flex-col items-center animate-in fade-in zoom-in-50 duration-500">
        <div className="mb-4 text-center">
          <h3 className="text-xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
            Perfect {periodName}!
          </h3>
          <p className="text-sm text-on-surface-variant">
            You completed all {stats.total} goals.
          </p>
        </div>
        <AchievementCard
          title={`Perfect ${periodName} Completion`}
          date={dateLabel}
          type={type}
          description={`Successfully completed all ${
            stats.total
          } goals for this ${periodName.toLowerCase()}.`}
        />
      </div>
    );
  }

  // Otherwise, show Progress Bar
  return (
    <div className="mb-8 p-6 bg-surface-container rounded-2xl border border-outline-variant/50">
      <div className="flex items-end justify-between mb-2">
        <div>
          <h3 className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">
            {periodName} Progress
          </h3>
          <div className="text-2xl font-bold text-on-surface">
            {stats.percentage}%
            <span className="text-sm font-normal text-on-surface-variant ml-2">
              ({stats.completed}/{stats.total} completed)
            </span>
          </div>
        </div>
      </div>

      <div className="h-3 w-full bg-surface-variant/30 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            type === "daily" && "bg-emerald-500",
            type === "weekly" && "bg-amber-500",
            type === "monthly" && "bg-pink-500",
            type === "yearly" && "bg-indigo-500"
          )}
          style={{ width: `${stats.percentage}%` }}
        />
      </div>
    </div>
  );
}
