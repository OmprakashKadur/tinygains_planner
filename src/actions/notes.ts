"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Note = {
  id: string;
  user_id: string;
  content: string;
  color: string;
  position: number;
  created_at: string;
  updated_at: string;
};

export async function getNotes(): Promise<Note[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("notes" as any)
    .select("*")
    .eq("user_id", user.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notes:", error);
    return [];
  }

  return (data as unknown as Note[]) || [];
}

export async function createNote(
  content: string = "",
  color: string = "yellow"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Get max position to append to end
  const { data: maxPosData } = await supabase
    .from("notes" as any)
    .select("position")
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const newPosition = ((maxPosData as any)?.position ?? 0) + 1;

  const { data, error } = await supabase
    .from("notes" as any)
    .insert({
      user_id: user.id,
      content,
      color,
      position: newPosition,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/notes");
  return data as unknown as Note;
}

export async function updateNote(
  id: string,
  updates: { content?: string; color?: string }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notes" as any)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/notes");
}

export async function deleteNote(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notes" as any)
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/notes");
}

export async function reorderNotes(items: { id: string; position: number }[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // Utilize Supabase RPC or batch update if possible, but basic loop is fine for small sets
  // For better performance with many notes, an SQL function `upsert_positions` would be ideal.
  // BUT for < 50 items, Promise.all is acceptable.

  // Optimistic UI handles the view, this just persists it.
  const updates = items.map((item) =>
    supabase
      .from("notes" as any)
      .update({ position: item.position })
      .eq("id", item.id)
      .eq("user_id", user.id)
  );

  await Promise.all(updates);
  revalidatePath("/notes");
}
