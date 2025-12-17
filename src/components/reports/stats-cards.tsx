"use client";

import { Trophy, Target, Zap } from "lucide-react";
import { ReportData } from "@/actions/reports";

export function StatsCards({ data }: { data: ReportData["summary"] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/50 relative overflow-hidden group">
        <div className="relative z-10">
          <div className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Completion Rate
          </div>
          <div className="text-4xl font-black text-on-surface">
            {data.completionRate}
            <span className="text-lg text-on-surface-variant/70">%</span>
          </div>
          <div className="text-xs text-on-surface-variant mt-2 font-medium">
            {data.completedGoals} / {data.totalGoals} Goals
          </div>
        </div>
        <div className="absolute right-0 bottom-0 w-24 h-24 bg-primary/5 rounded-tl-full transition-transform group-hover:scale-110" />
      </div>

      <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/50 relative overflow-hidden group">
        <div className="relative z-10">
          <div className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
            <Zap className="w-4 h-4 text-tertiary" /> Current Streak
          </div>
          <div className="text-4xl font-black text-on-surface">
            {data.currentStreak}
            <span className="text-lg text-on-surface-variant/70"> days</span>
          </div>
          <div className="text-xs text-on-surface-variant mt-2 font-medium">
            Keep the momentum going!
          </div>
        </div>
        <div className="absolute right-0 bottom-0 w-24 h-24 bg-tertiary/5 rounded-tl-full transition-transform group-hover:scale-110" />
      </div>

      <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/50 relative overflow-hidden group">
        <div className="relative z-10">
          <div className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-secondary" /> Total Wins
          </div>
          <div className="text-4xl font-black text-on-surface">
            {data.completedGoals}
          </div>
          <div className="text-xs text-on-surface-variant mt-2 font-medium">
            Goals crushed this period
          </div>
        </div>
        <div className="absolute right-0 bottom-0 w-24 h-24 bg-secondary/5 rounded-tl-full transition-transform group-hover:scale-110" />
      </div>
    </div>
  );
}
