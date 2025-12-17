"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Database } from "@/types/supabase";

type GoalStatus = Database["public"]["Enums"]["goal_status"];

// --- YEARLY GOALS ---

export async function createYearlyGoal(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = formData.get("title") as string;
  const year =
    parseInt(formData.get("year") as string) || new Date().getFullYear();
  const description = formData.get("description") as string;
  const color = formData.get("color") as string;

  const { error } = await supabase.from("yearly_goals").insert({
    user_id: user.id,
    year,
    title,
    description,
    color,
    status: "not_started",
  });

  if (error) {
    console.error("Error creating yearly goal:", error);
  }
  revalidatePath("/planner");
}

export async function getYearlyGoals(year: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("yearly_goals")
    .select("*")
    .eq("year", year)
    .order("created_at", { ascending: true });

  if (!data) return [];
  return data;
}

const PARENT_MAPPING = {
  daily_goals: {
    parentTable: "weekly_goals" as const,
    foreignKey: "weekly_goal_id",
  },
  weekly_goals: {
    parentTable: "monthly_goals" as const,
    foreignKey: "monthly_goal_id",
  },
  monthly_goals: {
    parentTable: "yearly_goals" as const,
    foreignKey: "yearly_goal_id",
  },
  yearly_goals: null,
};

export async function syncParentStatus(
  childTable: keyof typeof PARENT_MAPPING,
  goalId: string
) {
  const supabase = await createClient();
  const mapping = PARENT_MAPPING[childTable];

  if (!mapping) return; // Top level or no parent

  // 1. Get the child goal to find its parent ID
  const { data: childGoal } = await supabase
    .from(childTable)
    .select(mapping.foreignKey)
    .eq("id", goalId)
    .single();

  if (!childGoal) return;
  const parentId = (childGoal as any)[mapping.foreignKey];
  if (!parentId) return; // Orphan goal

  // 2. Fetch all siblings (including this one)
  const { data: siblings } = await supabase
    .from(childTable)
    .select("status")
    .eq(mapping.foreignKey, parentId);

  if (!siblings || siblings.length === 0) return;

  // 3. Determine new parent status
  const allCompleted = siblings.every((s) => s.status === "completed");
  const anyStarted = siblings.some(
    (s) =>
      s.status === "in_progress" ||
      s.status === "completed" ||
      s.status === "postponed"
  );

  let newParentStatus: GoalStatus = "not_started";
  if (allCompleted) {
    newParentStatus = "completed";
  } else if (anyStarted) {
    newParentStatus = "in_progress";
  }

  // 4. Update parent if different
  // First fetch current status to avoid unnecessary writes/recursion
  const { data: parent } = await supabase
    .from(mapping.parentTable)
    .select("status")
    .eq("id", parentId)
    .single();

  if (parent && parent.status !== newParentStatus) {
    await supabase
      .from(mapping.parentTable)
      .update({ status: newParentStatus })
      .eq("id", parentId);

    // 5. Recurse up the chain
    await syncParentStatus(mapping.parentTable, parentId);
  }
}

export async function updateGoalStatus(
  table: "yearly_goals" | "monthly_goals" | "weekly_goals" | "daily_goals",
  id: string,
  status: GoalStatus
) {
  const supabase = await createClient();
  const { error } = await supabase.from(table).update({ status }).eq("id", id);
  if (error) {
    console.error("Error updating goal:", error);
  } else {
    // Attempt to sync parent status
    await syncParentStatus(table, id);
  }
  revalidatePath("/planner");
}

// --- MONTHLY GOALS ---

export async function createMonthlyGoal(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = formData.get("title") as string;
  const year = parseInt(formData.get("year") as string);
  const month = parseInt(formData.get("month") as string);
  const yearlyGoalId = (formData.get("yearly_goal_id") as string) || null;

  const { error } = await supabase.from("monthly_goals").insert({
    user_id: user.id,
    year,
    month,
    yearly_goal_id: yearlyGoalId === "null" ? null : yearlyGoalId,
    title,
    status: "not_started",
  });

  if (error) {
    console.error("Error creating monthly goal:", error);
  }
  revalidatePath("/planner");
}

export async function getMonthlyGoals(year: number, month: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("monthly_goals")
    .select("*, yearly_goals(title, color)")
    .eq("year", year)
    .eq("month", month)
    .order("created_at", { ascending: true });

  if (!data) return [];
  return data;
}

// --- WEEKLY GOALS ---

export async function createWeeklyGoal(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = formData.get("title") as string;
  const year = parseInt(formData.get("year") as string);
  const week = parseInt(formData.get("week") as string);
  const monthlyGoalId = (formData.get("monthly_goal_id") as string) || null;

  const { error } = await supabase.from("weekly_goals").insert({
    user_id: user.id,
    year,
    week,
    monthly_goal_id: monthlyGoalId === "null" ? null : monthlyGoalId,
    title,
    status: "not_started",
  });

  if (error) {
    console.error("Error creating weekly goal:", error);
  }
  revalidatePath("/planner");
}

export async function getWeeklyGoals(year: number, week: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("weekly_goals")
    .select("*, monthly_goals(title)")
    .eq("year", year)
    .eq("week", week)
    .order("created_at", { ascending: true });

  if (!data) return [];
  return data;
}

export async function deleteGoal(
  table: "yearly_goals" | "monthly_goals" | "weekly_goals" | "daily_goals",
  id: string
) {
  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) {
    console.error(`Error deleting ${table}:`, error);
  }
  revalidatePath("/planner");
}

export async function updateGoal(
  table: "yearly_goals" | "monthly_goals" | "weekly_goals" | "daily_goals",
  id: string,
  updates: {
    title?: string;
    description?: string;
    color?: string;
    priority?: string;
    year?: number;
    month?: number;
    week?: number;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase.from(table).update(updates).eq("id", id);
  if (error) {
    console.error(`Error updating ${table}:`, error);
  }
  revalidatePath("/planner");
}
