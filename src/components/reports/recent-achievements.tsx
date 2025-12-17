"use client";

import { ReportData } from "@/actions/reports";
import { CheckCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";

export function RecentWins({ data }: { data: ReportData["recentWins"] }) {
  if (data.length === 0) {
    return (
      <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/50 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-3">
          <CheckCircle2 className="w-6 h-6 text-on-surface-variant/30" />
        </div>
        <p className="text-sm text-on-surface-variant font-medium">
          No completed goals yet.
        </p>
        <p className="text-xs text-on-surface-variant/70">
          Complete tasks to see your wins here!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container rounded-xl overflow-hidden border border-outline-variant/50 h-full">
      <div className="p-4 border-b border-outline-variant/30 bg-surface-container-high/30">
        <h3 className="font-bold text-on-surface flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-secondary" /> Recent Wins
        </h3>
      </div>
      <div className="divide-y divide-outline-variant/30">
        {data.map((win) => (
          <div
            key={win.id}
            className="p-4 hover:bg-surface-container-high/50 transition-colors flex items-start gap-3"
          >
            <div className="p-1 rounded-full bg-secondary/10 text-secondary shrink-0 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
            </div>
            <div>
              <div className="text-sm font-medium text-on-surface line-clamp-1">
                {win.title}
              </div>
              <div className="text-xs text-on-surface-variant">
                {format(parseISO(win.date), "MMM d")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
