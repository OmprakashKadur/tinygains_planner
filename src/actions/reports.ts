"use server";

import { createClient } from "@/lib/supabase/server";
import {
  addDays,
  differenceInDays,
  format,
  subDays,
  isSameDay,
  parseISO,
} from "date-fns";

export type ReportData = {
  summary: {
    totalGoals: number;
    completedGoals: number;
    completionRate: number;
    currentStreak: number;
  };
  activity: {
    date: string; // YYYY-MM-DD
    total: number;
    completed: number;
  }[];
  recentWins: {
    id: string;
    title: string;
    date: string;
  }[];
  yearActivity: { date: string; count: number; level: number }[];
  priorityDistribution: { subject: string; A: number; fullMark: number }[];
  weekdayStats: { day: string; count: number }[];
};

export async function getReportsData(
  rangeDays: number = 30
): Promise<ReportData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const today = new Date();
  const startDate = subDays(today, rangeDays);
  const startDateStr = format(startDate, "yyyy-MM-dd");
  const todayStr = format(today, "yyyy-MM-dd");
  const startOfYearStr = format(
    new Date(today.getFullYear(), 0, 1),
    "yyyy-MM-dd"
  );

  // Fetch 30-day goals for charts
  const { data: goals, error } = await supabase
    .from("daily_goals")
    .select("id, title, status, date, priority")
    .gte("date", startDateStr)
    .lte("date", todayStr)
    .order("date", { ascending: true });

  if (error) throw new Error(error.message);

  // Fetch Full Year Data for Heatmap & Weekday stats
  // Using a separate lighter query
  const { data: yearGoals } = await supabase
    .from("daily_goals")
    .select("date, status, priority")
    .eq("user_id", user.id)
    .gte("date", startOfYearStr)
    .lte("date", todayStr);

  // --- 1. Activity Data (Chart) & Summary ---
  // (Reusing existing logic for 'goals' / 30 days)
  const activityMap = new Map<string, { total: number; completed: number }>();
  for (let i = 0; i <= rangeDays; i++) {
    const d = addDays(startDate, i);
    const dStr = format(d, "yyyy-MM-dd");
    activityMap.set(dStr, { total: 0, completed: 0 });
  }

  goals?.forEach((g) => {
    const entry = activityMap.get(g.date);
    if (entry) {
      entry.total += 1;
      if (g.status === "completed") entry.completed += 1;
    }
  });

  const activity = Array.from(activityMap.entries()).map(([date, stats]) => ({
    date,
    ...stats,
  }));

  const totalGoals = goals?.length || 0;
  const completedGoals =
    goals?.filter((g) => g.status === "completed").length || 0;
  const completionRate =
    totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // Streak (using 30 day data is approx, but safer to stick to it or use yearGoals for accuracy)
  // Let's use yearGoals for better streak calculation if available, or fallback.
  // Actually, standard streak is enough on 30 days for now to match UI context.
  let currentStreak = 0;
  for (let i = 0; i < rangeDays; i++) {
    const d = subDays(today, i);
    const dStr = format(d, "yyyy-MM-dd");
    const dayGoals = goals?.filter((g) => g.date === dStr) || [];
    if (dayGoals.some((g) => g.status === "completed")) {
      currentStreak++;
    } else {
      if (i === 0) continue;
      break;
    }
  }

  // --- New Analytics ---

  // A. Year Activity (Heatmap)
  const yearMap = new Map<string, number>();
  yearGoals?.forEach((g) => {
    if (g.status === "completed") {
      yearMap.set(g.date, (yearMap.get(g.date) || 0) + 1);
    }
  });

  const yearActivity = [];
  for (const [date, count] of yearMap.entries()) {
    let level = 0;
    if (count > 0) level = 1;
    if (count > 2) level = 2; // Thresholds for colors
    if (count > 4) level = 3;
    if (count >= 6) level = 4;
    yearActivity.push({ date, count, level });
  }

  // B. Priority Distribution (Last 30 Days)
  const prioCounts = { high: 0, medium: 0, low: 0 };
  goals?.forEach((g) => {
    if (g.status === "completed" && g.priority) {
      const p = g.priority as keyof typeof prioCounts;
      if (prioCounts[p] !== undefined) prioCounts[p]++;
    }
  });
  const maxPrio = Math.max(
    prioCounts.high,
    prioCounts.medium,
    prioCounts.low,
    1
  );
  const priorityDistribution = [
    { subject: "High", A: prioCounts.high, fullMark: maxPrio },
    { subject: "Medium", A: prioCounts.medium, fullMark: maxPrio },
    { subject: "Low", A: prioCounts.low, fullMark: maxPrio },
  ];

  // C. Weekday Stats (Year Data)
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  yearGoals?.forEach((g) => {
    if (g.status === "completed") {
      const d = parseISO(g.date);
      if (!isNaN(d.getTime())) {
        dayCounts[d.getDay()]++;
      }
    }
  });
  const weekdayStats = days.map((day, i) => ({ day, count: dayCounts[i] }));

  // --- Recent Wins ---
  const recentWins =
    goals
      ?.filter((g) => g.status === "completed")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((g) => ({ id: g.id, title: g.title, date: g.date })) || [];

  return {
    summary: {
      totalGoals,
      completedGoals,
      completionRate,
      currentStreak,
    },
    activity,
    recentWins,
    yearActivity,
    priorityDistribution,
    weekdayStats,
  };
}
