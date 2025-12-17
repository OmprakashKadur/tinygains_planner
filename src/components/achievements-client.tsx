"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Award } from "lucide-react";
import { type Database } from "@/types/supabase";
import { AchievementCard } from "./achievement-card";
import { cn } from "@/lib/utils";

interface AchievementItem {
  id: string;
  title: string;
  date: string;
  type?: "yearly" | "monthly" | "weekly" | "daily";
}

interface AchievementsClientProps {
  data: {
    yearlyGoals: any[];
    monthlyGoals: any[];
    perfectMonths: any[];
    perfectWeeks: any[];
    perfectDays: any[];
  };
}

function ScrollableSection({
  title,
  items,
  type,
  icon,
}: {
  title: string;
  items: any[];
  type: "yearly" | "monthly" | "weekly" | "daily";
  icon?: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 300;
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold bg-linear-to-r from-primary to-tertiary bg-clip-text text-transparent flex items-center gap-2">
          {icon || <Award className="w-5 h-5 text-primary" />}
          {title}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 rounded-full bg-surface-container hover:bg-surface-variant text-on-surface-variant transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 rounded-full bg-surface-container hover:bg-surface-variant text-on-surface-variant transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-8 px-2 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => (
          <div key={item.id} className="snap-center shrink-0">
            <AchievementCard
              title={item.title}
              date={
                item.date
                  ? new Date(item.date).toLocaleDateString() === "Invalid Date"
                    ? item.date // Already formatted
                    : new Date(item.date).toLocaleDateString()
                  : new Date(item.created_at).toLocaleDateString()
              }
              type={type}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AchievementsClient({ data }: AchievementsClientProps) {
  const hasGoals =
    data.yearlyGoals.length > 0 ||
    data.monthlyGoals.length > 0 ||
    data.perfectMonths.length > 0 ||
    data.perfectWeeks.length > 0 ||
    data.perfectDays.length > 0;

  if (!hasGoals) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <div className="p-6 rounded-full bg-surface-container-high animate-pulse">
          <Award className="w-12 h-12 text-on-surface-variant/50" />
        </div>
        <h3 className="text-xl font-semibold text-on-surface">
          No Achievements Yet
        </h3>
        <p className="text-on-surface-variant max-w-sm">
          Complete your goals to unlock generic achievements. Keep pushing
          forward!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      <ScrollableSection
        title="Yearly Masterpieces"
        items={data.yearlyGoals}
        type="yearly"
      />
      <ScrollableSection
        title="Monthly Wins"
        items={data.monthlyGoals}
        type="monthly"
      />

      {/* Aggregate Achievements */}
      <ScrollableSection
        title="Perfect Months"
        items={data.perfectMonths}
        type="monthly"
      />
      <ScrollableSection
        title="Perfect Weeks"
        items={data.perfectWeeks}
        type="weekly"
      />
      <ScrollableSection
        title="Perfect Days"
        items={data.perfectDays}
        type="daily"
      />
    </div>
  );
}
