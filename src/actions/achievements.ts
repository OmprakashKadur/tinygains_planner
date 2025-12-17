"use server";

import { createClient } from "@/lib/supabase/server";
import { getISOWeek } from "date-fns";

export async function getAllAchievements() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return {
      yearlyGoals: [],
      monthlyGoals: [],
      perfectMonths: [],
      perfectWeeks: [],
      perfectDays: [],
    };

  // Fetch ALL goals to calculate perfect periods
  // Limit daily to recent history to avoid performance hit (e.g., last 1000 goals or just all if user base is small)
  // For this MVP, we fetch all.
  const [yearly, monthly, weekly, daily] = await Promise.all([
    supabase
      .from("yearly_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("monthly_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("weekly_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("daily_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(1000),
  ]);

  const yearlyData = yearly.data || [];
  const monthlyData = monthly.data || [];
  const weeklyData = weekly.data || [];
  const dailyData = daily.data || [];

  // Helper to find perfect periods
  // Returns list of { id, title, date }
  const findPerfectGroups = (
    items: any[],
    keyFn: (item: any) => string,
    titleFn: (key: string) => string
  ) => {
    const groups: Record<string, any[]> = {};
    items.forEach((item) => {
      const key = keyFn(item);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    const perfect: any[] = [];
    Object.entries(groups).forEach(([key, groupItems]) => {
      const allCompleted = groupItems.every((i) => i.status === "completed");
      if (allCompleted && groupItems.length > 0) {
        // Use the date of the first item as reference
        perfect.push({
          id: key,
          title: titleFn(key),
          date: key, // Or a formatted date string
          originalDate: groupItems[0].created_at || groupItems[0].date,
        });
      }
    });
    // Sort by date descending
    return perfect.sort(
      (a, b) =>
        new Date(b.originalDate).getTime() - new Date(a.originalDate).getTime()
    );
  };

  const perfectMonths = findPerfectGroups(
    monthlyData,
    (i) => `${i.year}-${i.month}`,
    (key) => {
      const [y, m] = key.split("-");
      const date = new Date(parseInt(y), parseInt(m) - 1);
      return `Perfect Month: ${date.toLocaleString("default", {
        month: "long",
      })} ${y}`;
    }
  );

  const perfectWeeks = findPerfectGroups(
    weeklyData,
    (i) => `${i.year}-W${i.week}`,
    (key) => {
      const [y, w] = key.split("-W");
      return `Perfect Week ${w}, ${y}`;
    }
  );

  const perfectDays = findPerfectGroups(
    dailyData,
    (i) => i.date,
    (key) => {
      const date = new Date(key);
      return `Perfect Day: ${date.toLocaleDateString("default", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }
  );

  return {
    yearlyGoals: yearlyData.filter((g) => g.status === "completed"),
    monthlyGoals: monthlyData.filter((g) => g.status === "completed"),
    perfectMonths,
    perfectWeeks,
    perfectDays,
  };
}
