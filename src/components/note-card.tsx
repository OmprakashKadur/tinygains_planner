"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Note, updateNote } from "@/actions/notes";
import { X, GripHorizontal } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// Simple debounce hook if not exists
function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  return (...args: Parameters<T>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  };
}

interface NoteCardProps {
  note: Note;
  onDelete: () => void;
}

const COLORS = {
  yellow: "bg-yellow-100 border-yellow-200 text-yellow-900",
  blue: "bg-blue-100 border-blue-200 text-blue-900",
  pink: "bg-pink-100 border-pink-200 text-pink-900",
  green: "bg-emerald-100 border-emerald-200 text-emerald-900",
  purple: "bg-purple-100 border-purple-200 text-purple-900",
} as const;

export function NoteCard({ note, onDelete }: NoteCardProps) {
  const [content, setContent] = useState(note.content);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const debouncedUpdate = useDebouncedCallback(async (newContent: string) => {
    await updateNote(note.id, { content: newContent });
  }, 1000);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setContent(newVal);
    debouncedUpdate(newVal);
  };

  const handleDelete = () => {
    if (confirm("Delete this note?")) {
      onDelete();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group w-full h-64 p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow flex flex-col",
        COLORS[note.color as keyof typeof COLORS] || COLORS.yellow,
        isDragging && "opacity-50 ring-2 ring-primary rotate-2"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing hover:bg-black/5 rounded-md transition-opacity"
      >
        <GripHorizontal className="w-4 h-4 opacity-50" />
      </div>

      {/* Delete Button */}
      <div className="absolute top-2 left-2 p-1.5 opacity-0 group-hover:opacity-100 cursor-pointer hover:bg-red-500/10 hover:text-red-600 rounded-md transition-opacity">
        <button onClick={handleDelete}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area */}
      <textarea
        className="flex-1 w-full bg-transparent resize-none outline-none mt-6 text-sm/relaxed font-medium placeholder:text-black/30 font-handwriting"
        placeholder="Type a note..."
        value={content}
        onChange={handleChange}
        spellCheck={false}
      />

      <div className="text-[10px] opacity-40 mt-2 text-right font-mono">
        {new Date(note.updated_at).toLocaleDateString()}
      </div>
    </div>
  );
}
