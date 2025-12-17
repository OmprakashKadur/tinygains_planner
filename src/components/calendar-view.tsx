"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Maximize2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Database } from "@/types/supabase";
import { GoalActionsMenu } from "./goal-actions-menu";

type DailyGoal = Database["public"]["Tables"]["daily_goals"]["Row"];

interface CalendarViewProps {
  currentYear: number;
  currentMonth: number; // 1-indexed
  goals: DailyGoal[];
}

export function CalendarView({
  currentYear,
  currentMonth,
  goals,
}: CalendarViewProps) {
  const router = useRouter();

  // Create date object for current view
  const viewDate = new Date(currentYear, currentMonth - 1);

  const prevMonth = subMonths(viewDate, 1);
  const nextMonth = addMonths(viewDate, 1);

  const handlePrev = () => {
    router.push(
      `/calendar?year=${prevMonth.getFullYear()}&month=${
        prevMonth.getMonth() + 1
      }`
    );
  };

  const handleNext = () => {
    router.push(
      `/calendar?year=${nextMonth.getFullYear()}&month=${
        nextMonth.getMonth() + 1
      }`
    );
  };

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-outline-variant bg-surface-container-low">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-on-surface capitalize">
            {format(viewDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center rounded-lg border border-outline-variant bg-surface p-0.5">
            <button
              onClick={handlePrev}
              className="p-1 hover:bg-surface-variant rounded-md transition-colors text-on-surface-variant"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-px h-4 bg-outline-variant/50 mx-1" />
            <button
              onClick={handleNext}
              className="p-1 hover:bg-surface-variant rounded-md transition-colors text-on-surface-variant"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <Link
          href="/planner/day"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-primary text-on-primary rounded-lg shadow hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Task
        </Link>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-outline-variant bg-surface-container-low/50">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-semibold text-on-surface-variant uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)] divide-x divide-outline-variant/30 border-b border-outline-variant/30">
        {days.map((day, dayIdx) => {
          const dayGoals = goals.filter((g) =>
            isSameDay(new Date(g.date), day)
          );
          const isCurrentMonth = isSameMonth(day, viewDate);

          return (
            <div
              key={day.toString()}
              className={cn(
                "relative p-2 transition-colors hover:bg-surface-container-high/30 flex flex-col group min-h-[120px]",
                !isCurrentMonth &&
                  "bg-surface-variant/5 text-on-surface-variant/40",
                isToday(day) && "bg-primary/5"
              )}
            >
              {/* Date Header */}
              <div className="flex justify-between items-start mb-2">
                <span
                  className={cn(
                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                    isToday(day)
                      ? "bg-primary text-on-primary shadow-sm"
                      : isCurrentMonth
                      ? "text-on-surface"
                      : "text-on-surface-variant/60"
                  )}
                >
                  {format(day, "d")}
                </span>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/planner/day?date=${format(day, "yyyy-MM-dd")}`}
                    className="p-1 text-on-surface-variant hover:bg-surface-variant/50 rounded-full"
                    title="View Day"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/planner/day?date=${format(day, "yyyy-MM-dd")}`}
                    className="p-1 text-on-surface-variant hover:bg-surface-variant/50 rounded-full"
                    title="Add Goal"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Goals List */}
              <div className="flex-1 space-y-1">
                {dayGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="group/task relative flex items-center bg-surface-container border border-transparent hover:border-outline-variant rounded px-1.5 py-1 shadow-sm hover:shadow transition-all"
                  >
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full mr-2 shrink-0",
                        goal.status === "completed"
                          ? "bg-green-500"
                          : goal.status === "in_progress"
                          ? "bg-tertiary"
                          : goal.status === "postponed"
                          ? "bg-orange-400"
                          : "bg-on-surface-variant/30"
                      )}
                    />
                    <span
                      className={cn(
                        "text-[10px] font-medium truncate flex-1",
                        goal.status === "completed"
                          ? "text-on-surface-variant line-through opacity-70"
                          : "text-on-surface"
                      )}
                    >
                      {goal.title}
                    </span>
                    {/* Mini Menu */}
                    <div className="absolute right-0 top-0 bottom-0 px-1 bg-linear-to-l from-surface-container to-transparent hidden group-hover/task:flex items-center">
                      <GoalActionsMenu
                        id={goal.id}
                        type="daily_goals"
                        currentTitle={goal.title}
                        currentStatus={goal.status}
                      />
                    </div>
                  </div>
                ))}
                {dayGoals.length > 3 && (
                  <div className="text-[10px] text-center text-on-surface-variant font-medium pt-1">
                    + {dayGoals.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
