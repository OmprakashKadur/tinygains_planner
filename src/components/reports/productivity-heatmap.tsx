"use client";

import { cn } from "@/lib/utils";
import {
  format,
  parseISO,
  eachDayOfInterval,
  startOfYear,
  endOfYear,
  getDay,
} from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeatmapProps {
  data: { date: string; count: number; level: number }[]; // Level 0-4
}

export function ProductivityHeatmap({ data }: HeatmapProps) {
  // We need a full year grid.
  const today = new Date();
  const start = startOfYear(today);
  const end = endOfYear(today);
  const days = eachDayOfInterval({ start, end });

  // Map data for fast lookup
  const dataMap = new Map(data.map((d) => [d.date, d]));

  // Helper to determine color based on level
  const getColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-emerald-200";
      case 2:
        return "bg-emerald-400";
      case 3:
        return "bg-emerald-600";
      case 4:
        return "bg-emerald-800";
      default:
        return "bg-surface-container-highest"; // Level 0
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-on-surface text-lg">Consistency Map</h3>
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-surface-container-highest" />
            <div className="w-3 h-3 rounded-sm bg-emerald-200" />
            <div className="w-3 h-3 rounded-sm bg-emerald-400" />
            <div className="w-3 h-3 rounded-sm bg-emerald-600" />
            <div className="w-3 h-3 rounded-sm bg-emerald-800" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="grid grid-rows-7 grid-flow-col gap-1 w-max min-w-full">
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const entry = dataMap.get(dateStr);
            const count = entry?.count || 0;
            const level = entry?.level || 0;
            const dayOfWeek = getDay(day); // 0 = Sun, 6 = Sat

            return (
              <TooltipProvider key={dateStr}>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "w-3 h-3 rounded-[2px] transition-colors hover:ring-2 hover:ring-offset-1 hover:ring-emerald-500/50",
                        getColor(level)
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs font-medium">
                      {format(day, "MMM d, yyyy")}: {count} goals
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
    </div>
  );
}
