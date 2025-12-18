"use server";

import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";

type GoalStatus = Database["public"]["Enums"]["goal_status"];

export type DashboardGoal = {
  id: string;
  title: string;
  status: GoalStatus;
  type: "yearly" | "monthly" | "weekly" | "daily";
  date_label: string;
  created_at: string;
  priority?: string; // For daily
  yearly_goal_id?: string | null;
  monthly_goal_id?: string | null;
  weekly_goal_id?: string | null;
  year?: number;
  month?: number;
  week?: number;
  metadata?: Record<string, unknown> | null;
};

interface DashboardFilters {
  status?: GoalStatus | "all";
  startDate?: string;
  endDate?: string;
  search?: string;
}

export async function getDashboardData(filters: DashboardFilters = {}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { yearly: [], monthly: [], weekly: [], daily: [] };

  // 1. Yearly
  let yearlyQuery = supabase
    .from("yearly_goals")
    .select("*")
    .eq("user_id", user.id)
    .order("year", { ascending: false });
  if (filters.status && filters.status !== "all")
    yearlyQuery = yearlyQuery.eq("status", filters.status);
  if (filters.search)
    yearlyQuery = yearlyQuery.ilike("title", `%${filters.search}%`);
  if (filters.startDate) {
    const startYear = new Date(filters.startDate).getFullYear();
    yearlyQuery = yearlyQuery.gte("year", startYear);
  }
  const { data: yearlyData } = await yearlyQuery;

  // 2. Monthly
  let monthlyQuery = supabase
    .from("monthly_goals")
    .select("*")
    .eq("user_id", user.id)
    .order("year", { ascending: false })
    .order("month", { ascending: false });
  if (filters.status && filters.status !== "all")
    monthlyQuery = monthlyQuery.eq("status", filters.status);
  if (filters.search)
    monthlyQuery = monthlyQuery.ilike("title", `%${filters.search}%`);
  if (filters.startDate) {
    const d = new Date(filters.startDate);
    monthlyQuery = monthlyQuery.gte("year", d.getFullYear());
  }
  const { data: monthlyData } = await monthlyQuery;

  // 3. Weekly
  // 3. Weekly
  let weeklyQuery = supabase
    .from("weekly_goals")
    .select("*")
    .eq("user_id", user.id)
    .order("year", { ascending: false })
    .order("week", { ascending: false });
  if (filters.status && filters.status !== "all")
    weeklyQuery = weeklyQuery.eq("status", filters.status);
  if (filters.search)
    weeklyQuery = weeklyQuery.ilike("title", `%${filters.search}%`);
  if (filters.startDate) {
    const d = new Date(filters.startDate);
    weeklyQuery = weeklyQuery.gte("year", d.getFullYear());
  }
  const { data: weeklyData } = await weeklyQuery;

  // 4. Daily
  let dailyQuery = supabase
    .from("daily_goals")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });
  if (filters.status && filters.status !== "all")
    dailyQuery = dailyQuery.eq("status", filters.status);
  if (filters.search)
    dailyQuery = dailyQuery.ilike("title", `%${filters.search}%`);
  if (filters.startDate) dailyQuery = dailyQuery.gte("date", filters.startDate);
  if (filters.endDate) dailyQuery = dailyQuery.lte("date", filters.endDate);

  if (!filters.startDate && !filters.endDate) {
    dailyQuery = dailyQuery.limit(50);
  }
  const { data: dailyData } = await dailyQuery;
  // Normalize
  const yearly = (yearlyData || []).map((g) => ({
    ...g,
    type: "yearly" as const,
    date_label: `${g.year}`,
  }));

  const monthly = (monthlyData || []).map((g) => ({
    ...g,
    type: "monthly" as const,
    date_label: `${g.year} - ${new Date(0, g.month - 1).toLocaleString(
      "default",
      { month: "long" }
    )}`,
  }));

  const weekly = (weeklyData || []).map((g) => ({
    ...g,
    type: "weekly" as const,
    date_label: `${g.year} W${g.week}`,
  }));

  const daily = (dailyData || []).map((g) => ({
    ...g,
    type: "daily" as const,
    date_label: g.date,
  }));

  return {
    yearly,
    monthly,
    weekly,
    daily,
  };
}
