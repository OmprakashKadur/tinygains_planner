"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  addYears,
  addMonths,
  addWeeks,
  addDays,
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
} from "date-fns";

interface PlannerHeaderProps {
  type: "year" | "month" | "week" | "day";
  date: Date;
  title: string;
  subtitle?: string;
  showNavigation?: boolean;
}

export function PlannerHeader({
  type,
  date,
  title,
  subtitle,
  showNavigation = true,
}: PlannerHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleNavigate = (direction: "prev" | "next") => {
    const modifier = direction === "prev" ? -1 : 1;
    let newDate = new Date(date);
    let params = new URLSearchParams(searchParams.toString());

    switch (type) {
      case "year":
        newDate = addYears(date, modifier);
        params.set("year", newDate.getFullYear().toString());
        break;
      case "month":
        newDate = addMonths(date, modifier);
        params.set("year", newDate.getFullYear().toString());
        params.set("month", (newDate.getMonth() + 1).toString());
        break;
      case "week":
        newDate = addWeeks(date, modifier);
        // Week calculation is tricky, usually we store year + week number
        // Simpler to just store a reference date for the week
        // But our backend expects year + week number.
        // Let's stick to updating the search params derived from the new date
        // Actually best to pass year & week index, but date manipulation is easier
        // Re-calculating week index from date:
        // Note: This relies on the parent passing a valid date object representing the start of the week or similar
        params.set("year", newDate.getFullYear().toString());
        // We'll need a way to get ISO week, but for now let's rely on backend logic or date-fns 'getWeek' in parent
        // Easier approach: Just redirect to a helper URL or let parent handle 'week' param calculation?
        // Let's keep it simple: We need to know the next week number.
        // If we use 'date' param everywhere it's easier, but we used split params.
        // Let's try to update params directly if possible.
        // Getting week number client side:
        const { getWeek, getISOWeek } = require("date-fns"); // Dynamic require to avoid build issues if missing? No, should be fine.
        params.set("week", getISOWeek(newDate).toString());
        break;
      case "day":
        newDate = addDays(date, modifier);
        params.set("date", format(newDate, "yyyy-MM-dd"));
        break;
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-display-small font-bold text-on-surface">
          {title}
        </h1>
        {subtitle && (
          <p className="text-body-large text-on-surface-variant">{subtitle}</p>
        )}
      </div>
      {showNavigation && (
        <div className="flex items-center gap-1 bg-surface-container-high rounded-full p-1">
          <button
            onClick={() => handleNavigate("prev")}
            className="p-2 hover:bg-surface-container-highest rounded-full transition-colors text-on-surface"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push(pathname)}
            className="px-3 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => handleNavigate("next")}
            className="p-2 hover:bg-surface-container-highest rounded-full transition-colors text-on-surface"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
