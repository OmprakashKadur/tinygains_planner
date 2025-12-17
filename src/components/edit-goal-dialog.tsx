"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, priority?: string, date?: string) => Promise<void>; // Async save
  initialTitle: string;
  initialPriority?: string; // Optional, mainly for daily goals
  initialDate?: string; // Optional date (YYYY-MM-DD)
  type?: "yearly_goals" | "monthly_goals" | "weekly_goals" | "daily_goals";
}

export function EditGoalDialog({
  isOpen,
  onClose,
  onSave,
  initialTitle,
  initialPriority,
  initialDate,
  type = "daily_goals",
}: EditGoalDialogProps) {
  const [title, setTitle] = useState(initialTitle);
  const [priority, setPriority] = useState(initialPriority || "medium");
  const [date, setDate] = useState(initialDate || "");
  const [isSaving, setIsSaving] = useState(false);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setPriority(initialPriority || "medium");
      setDate(initialDate || "");
    }
  }, [isOpen, initialTitle, initialPriority, initialDate]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      await onSave(
        title,
        type === "daily_goals" ? priority : undefined,
        // For weekly/monthly, we pass the selected date string, and parent usually calculates the week/month
        // Actually, onSave signature accepts `date` string.
        // For daily goals, it's the exact date.
        // For weekly/monthly, it's a reference date in that period.
        // We will pass the date string if it's set and type allows rescheduling.
        ["daily_goals", "weekly_goals", "monthly_goals"].includes(type)
          ? date
          : undefined
      );
      onClose();
    } catch (error) {
      console.error("Failed to save", error);
    } finally {
      setIsSaving(false);
    }
  };

  const isReschedulable = [
    "daily_goals",
    "weekly_goals",
    "monthly_goals",
  ].includes(type);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface border border-outline-variant shadow-xl rounded-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant bg-surface-container-low">
          <h3 className="text-lg font-bold text-on-surface">Edit Goal</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface-variant">
              Goal Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
            />
          </div>

          {type === "daily_goals" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface-variant">
                Priority
              </label>
              <div className="flex gap-2">
                {(["low", "medium", "high"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-medium rounded-md border transition-all capitalize",
                      priority === p
                        ? p === "high"
                          ? "bg-red-100 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300"
                          : p === "medium"
                          ? "bg-yellow-100 border-yellow-200 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300"
                          : "bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300"
                        : "bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-variant"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isReschedulable && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface-variant">
                {type === "daily_goals"
                  ? "Date"
                  : type === "weekly_goals"
                  ? "Move to Week of"
                  : "Move to Month of"}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface"
              />
              {type !== "daily_goals" && (
                <p className="text-[10px] text-on-surface-variant opacity-70">
                  Select any date within the target{" "}
                  {type === "weekly_goals" ? "week" : "month"}.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-outline-variant bg-surface-container-low flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-primary text-on-primary rounded-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
