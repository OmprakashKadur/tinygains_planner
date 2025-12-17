"use client";

import { updateGoalStatus } from "@/actions/goals";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Check } from "lucide-react";
import { useState } from "react";
import { GoalActionsMenu } from "./goal-actions-menu";

interface GoalProps {
  id: string;
  title: string;
  status: "not_started" | "in_progress" | "completed" | "postponed";
  color?: string | null;
  type: "yearly_goals" | "monthly_goals" | "weekly_goals" | "daily_goals";
  subtitle?: string;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export function GoalCard({
  id,
  title,
  status,
  color,
  type,
  subtitle,
  className,
  onClick,
  selected,
}: GoalProps) {
  const [loading, setLoading] = useState(false);

  const handleStatusToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click if used for selection
    setLoading(true);
    const newStatus = status === "completed" ? "in_progress" : "completed";
    await updateGoalStatus(type, id, newStatus);
    setLoading(false);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex items-center bg-surface-container rounded-lg transition-all duration-200 border border-transparent hover:border-outline-variant hover:shadow-sm py-2 px-3",
        status === "completed" ? "opacity-60 bg-surface-container-low" : "",
        selected ? "ring-1 ring-primary bg-primary-container/10" : "",
        className
      )}
    >
      {/* Status color indicator - Thin left strip */}
      <div
        className={cn(
          "absolute left-0 top-2 bottom-2 w-1 rounded-full transition-colors",
          status === "completed"
            ? "bg-secondary"
            : status === "in_progress"
            ? "bg-primary"
            : "bg-outline-variant"
        )}
      />

      <div className="flex items-center gap-3 w-full pl-3">
        {/* Checkbox */}
        <button
          disabled={loading}
          onClick={handleStatusToggle}
          className="text-on-surface-variant hover:text-primary transition-colors shrink-0"
        >
          {status === "completed" ? (
            <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center shadow-sm">
              <Check
                className="w-3.5 h-3.5 text-on-secondary"
                strokeWidth={3}
              />
            </div>
          ) : (
            <Circle className="w-5 h-5 text-outline hover:text-primary" />
          )}
        </button>

        {/* Content - Horizontal Layout */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-baseline gap-2">
            <h3
              className={cn(
                "text-sm font-semibold text-on-surface leading-tight truncate",
                status === "completed" &&
                  "line-through text-on-surface-variant decoration-secondary/50"
              )}
            >
              {title}
            </h3>
            {subtitle && (
              <span className="text-[10px] font-medium text-on-surface-variant opacity-70 truncate max-w-[120px]">
                • {subtitle}
              </span>
            )}
          </div>

          {/* Optional: Show status text only if needed, mostly redundant with icon/color but good for clarity */}
          {/* Keeping it very minimal */}
          {(status === "postponed" || status === "in_progress") && (
            <div className="text-[10px] text-tertiary font-medium -mt-0.5">
              {status.replace("_", " ")}
            </div>
          )}
        </div>

        {/* Menu */}
        <div className="shrink-0 ml-1">
          <GoalActionsMenu
            id={id}
            type={type}
            currentTitle={title}
            currentStatus={status}
          />
        </div>
      </div>

      {/* Selection Indicator for logic use (e.g. coloring based on category) */}
      {color && !selected && (
        <div
          className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
    </div>
  );
}
