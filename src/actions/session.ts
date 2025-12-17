"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function logSession(blockId: string | null, duration: number) {
  // Focus features are currently being refactored/deprecated in favor of Daily Goals.
  // This action is kept to prevent build errors in legacy components.

  if (duration < 60) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // Placeholder for future implementation if Focus Mode is truly revived
  // console.log(`[Focus] User ${user.id} logged ${duration}s for block ${blockId}`);

  revalidatePath("/focus");
}
