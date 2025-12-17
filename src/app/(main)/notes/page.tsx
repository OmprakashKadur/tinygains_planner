import { createClient } from "@/lib/supabase/server";
import { getNotes } from "@/actions/notes";
import { NotesBoard } from "@/components/notes-board";
import { PlannerHeader } from "@/components/planner-header";
import { redirect } from "next/navigation";

export default async function NotesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const notes = await getNotes();

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up p-6">
      <PlannerHeader
        type="year"
        date={new Date()} // Dummy date
        title="Sticky Notes"
        subtitle="Capture thoughts, ideas, and reminders."
        showNavigation={false}
      />

      <NotesBoard initialNotes={notes} />
    </div>
  );
}
