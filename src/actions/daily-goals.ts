"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Database } from "@/types/supabase";
import { syncParentStatus } from "./goals";

type GoalStatus = Database["public"]["Enums"]["goal_status"];

export async function createDailyGoal(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const title = formData.get("title") as string;
  const weeklyGoalId = (formData.get("weekly_goal_id") as string) || null;
  const date = formData.get("date") as string;
  const priority = formData.get("priority") || "medium";

  if (!title || !date) {
    return;
  }

  const { error } = await supabase.from("daily_goals").insert({
    user_id: user.id,
    date,
    title,
    weekly_goal_id: weeklyGoalId === "null" ? null : weeklyGoalId,
    status: "not_started",
    priority: priority as "low" | "medium" | "high",
  });

  if (error) {
    console.error("Error creating daily goal:", error);
  }

  revalidatePath("/planner/day");
}

export async function getDailyGoals(date: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_goals")
    .select("*, weekly_goals(title)")
    .eq("date", date)
    .order("created_at", { ascending: true });

  if (!data) return [];
  return data;
}

export async function updateDailyGoalStatus(id: string, status: GoalStatus) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("daily_goals")
    .update({ status })
    .eq("id", id);
  if (error) {
    console.error("Error updating daily goal:", error);
  } else {
    try {
      await syncParentStatus("daily_goals", id);
    } catch (e) {
      console.error("Error syncing parent status:", e);
    }
  }
  revalidatePath("/planner/day");
}

export async function deleteDailyGoal(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("daily_goals").delete().eq("id", id);
  if (error) {
    console.error("Error deleting daily goal:", error);
  }
  revalidatePath("/planner/day");
  revalidatePath("/dashboard");
}

export async function updateDailyGoal(
  id: string,
  updates: {
    title?: string;
    priority?: "low" | "medium" | "high";
    date?: string;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("daily_goals")
    .update(updates)
    .eq("id", id);
  if (error) {
    console.error("Error updating daily goal:", error);
  }
  revalidatePath("/planner/day");
  revalidatePath("/dashboard");
}
// Fetch all daily goals within a date range (inclusive)
export async function getMonthlyDailyGoals(startDate: string, endDate: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_goals")
    .select("*, weekly_goals(title)")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })
    .order("created_at", { ascending: true });

  if (!data) return [];
  return data;
}
