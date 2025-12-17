"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useState, useEffect } from "react";
import { Note, reorderNotes, createNote, deleteNote } from "@/actions/notes";
import { NoteCard } from "./note-card";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotesBoardProps {
  initialNotes: Note[];
}

export function NotesBoard({ initialNotes }: NotesBoardProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [isCreating, setIsCreating] = useState(false);

  // Sync with server state when it updates (e.g. initial load or revalidation)
  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setNotes((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Optimistic update done, trigger server
        // Prepare updates: we need to send { id, position } for all affected or just the new order
        // Simplest: send new order with index as position
        const updates = newItems.map((note, index) => ({
          id: note.id,
          position: index,
        }));
        reorderNotes(updates); // Fire and forget

        return newItems;
      });
    }
  };

  const handleCreate = async (color: string) => {
    setIsCreating(true);
    // Optimistic UI
    const tempId = `temp-${Date.now()}`;
    const tempNote: Note = {
      id: tempId,
      user_id: "loading",
      content: "",
      color,
      position: notes.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setNotes((prev) => [...prev, tempNote]);

    try {
      const newNote = await createNote("", color);
      // Replace temp with real
      setNotes((prev) => prev.map((n) => (n.id === tempId ? newNote : n)));
    } catch (e) {
      console.error(e);
      // Remove temp if failed
      setNotes((prev) => prev.filter((n) => n.id !== tempId));
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Optimistic Delete
    const previousNotes = notes;
    setNotes((prev) => prev.filter((n) => n.id !== id));

    try {
      await deleteNote(id);
    } catch (e) {
      console.error("Failed to delete", e);
      setNotes(previousNotes);
      alert("Failed to delete note. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center gap-4 py-4 overflow-x-auto">
        <span className="text-sm font-medium text-on-surface-variant whitespace-nowrap">
          New Note:
        </span>
        <div className="flex gap-2">
          {["yellow", "blue", "pink", "green", "purple"].map((color) => (
            <button
              key={color}
              onClick={() => handleCreate(color)}
              disabled={isCreating}
              className={cn(
                "w-8 h-8 rounded-full border-2 border-transparent hover:scale-110 active:scale-95 transition-all shadow-sm",
                color === "yellow" && "bg-yellow-200 hover:border-yellow-400",
                color === "blue" && "bg-blue-200 hover:border-blue-400",
                color === "pink" && "bg-pink-200 hover:border-pink-400",
                color === "green" && "bg-emerald-200 hover:border-emerald-400",
                color === "purple" && "bg-purple-200 hover:border-purple-400"
              )}
            />
          ))}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={notes} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={() => handleDelete(note.id)}
              />
            ))}

            {/* Empty State / Quick Add Placeholder */}
            {notes.length === 0 && (
              <button
                onClick={() => handleCreate("yellow")}
                className="h-64 rounded-xl border-2 border-dashed border-outline-variant hover:border-primary/50 flex flex-col items-center justify-center gap-4 text-on-surface-variant hover:text-primary transition-colors group"
              >
                <div className="p-4 rounded-full bg-surface-container group-hover:bg-primary/10 transition-colors">
                  <Plus className="w-8 h-8" />
                </div>
                <span className="font-medium">Create your first note</span>
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
