"use client";

import * as React from "react";
import { useState } from "react";
import {
  MoreVertical,
  Trash2,
  Pencil,
  CheckCircle2,
  Circle,
  ArrowRight,
  PauseCircle,
  Calendar,
} from "lucide-react";
import { getISOWeek, getYear } from "date-fns";
import { updateGoal, deleteGoal, updateGoalStatus } from "@/actions/goals";
import {
  updateDailyGoal,
  deleteDailyGoal,
  updateDailyGoalStatus,
} from "@/actions/daily-goals";
import { cn } from "@/lib/utils";
import { EditGoalDialog } from "./edit-goal-dialog";
import { useToast } from "./ui/toast-context";
import { Portal } from "./ui/portal";

interface GoalActionsMenuProps {
  id: string;
  type: "yearly_goals" | "monthly_goals" | "weekly_goals" | "daily_goals";
  currentTitle: string;
  currentStatus: string;
  onEditStart?: () => void; // If parent wants to handle inline edit mode
}

export function GoalActionsMenu({
  id,
  type,
  currentTitle,
  currentStatus,
  onEditStart,
}: GoalActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const { toast } = useToast();
  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    function handleScroll() {
      if (isOpen) setIsOpen(false);
    }
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isOpen]);

  // Handle click outside for Portal
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Position: Top-Right aligned with button bottom
      // Logic: Left = Right of button - Width of menu (12rem = 192px approx)
      // Actually let's just use left alignment if space permits, or right.
      // Let's align Right edge of menu with Right edge of button.
      // rect.right is the right edge.
      // width of menu is w-48 = 192px.
      setPosition({
        top: rect.bottom + 4,
        left: rect.left - 192 + rect.width, // Align right edges
      });
    }
    setIsOpen(!isOpen);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this goal? This cannot be undone."
      )
    )
      return;

    try {
      setIsLoading(true);
      if (type === "daily_goals") {
        await deleteDailyGoal(id);
      } else {
        await deleteGoal(type, id);
      }
      toast("Goal deleted successfully", "success");
    } catch (e) {
      toast("Failed to delete goal", "error");
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleStatusChange = async (
    newStatus: "not_started" | "in_progress" | "completed" | "postponed"
  ) => {
    try {
      setIsLoading(true);
      if (type === "daily_goals") {
        await updateDailyGoalStatus(id, newStatus);
      } else {
        await updateGoalStatus(type, id, newStatus);
      }
      toast("Status updated", "success");
    } catch (e) {
      toast("Failed to update status", "error");
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleSaveEdit = async (
    title: string,
    priority?: string,
    date?: string
  ) => {
    try {
      if (type === "daily_goals") {
        await updateDailyGoal(id, {
          title,
          priority: priority as any,
          date,
        });
      } else {
        const updates: any = { title };
        if (date) {
          const d = new Date(date);
          if (type === "weekly_goals") {
            updates.year = getYear(d);
            updates.week = getISOWeek(d);
          } else if (type === "monthly_goals") {
            updates.year = d.getFullYear();
            updates.month = d.getMonth() + 1;
          }
        }
        await updateGoal(type, id, updates);
      }
      toast("Goal updated successfully", "success");
    } catch (e) {
      toast("Failed to update goal", "error");
      throw e; // Rethrow to let dialog know
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        disabled={isLoading}
        className="p-1 text-on-surface-variant hover:bg-surface-variant/50 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <Portal>
          <div
            ref={menuRef}
            style={{
              top: position.top,
              left: position.left,
              position: "fixed",
              zIndex: 9999,
            }}
            className="w-48 bg-white dark:bg-slate-900 border border-outline-variant shadow-xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          >
            {/* Status Quick Actions */}
            <div className="p-1 border-b border-outline-variant/30">
              <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-2 py-1">
                Set Status
              </div>
              {[
                { value: "not_started", label: "Not Started", icon: Circle },
                {
                  value: "in_progress",
                  label: "In Progress",
                  icon: ArrowRight,
                },
                { value: "completed", label: "Completed", icon: CheckCircle2 },
                { value: "postponed", label: "Postponed", icon: PauseCircle },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(status.value as any);
                  }}
                  className={cn(
                    "flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs rounded hover:bg-surface-container-high transition-colors",
                    currentStatus === status.value
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-on-surface"
                  )}
                >
                  <status.icon className="w-3.5 h-3.5" />
                  {status.label}
                </button>
              ))}
            </div>

            {/* Reschedule for Daily, Weekly, Monthly Goals */}
            {["daily_goals", "weekly_goals", "monthly_goals"].includes(
              type
            ) && (
              <div className="p-1 border-b border-outline-variant/30">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    setShowEditDialog(true);
                    // Edit dialog handles showing date field
                  }}
                  className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs text-on-surface rounded hover:bg-surface-container-high transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 opacity-70" />
                  Reschedule
                </button>
              </div>
            )}

            {/* Edit / Delete */}
            <div className="p-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  setShowEditDialog(true);
                }}
                className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs text-on-surface rounded hover:bg-surface-container-high transition-colors"
              >
                <Pencil className="w-3.5 h-3.5 opacity-70" />
                Edit Title
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs text-error rounded hover:bg-error/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 opacity-70" />
                Delete
              </button>
            </div>
          </div>
        </Portal>
      )}

      {/* Edit Dialog */}
      <EditGoalDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSave={handleSaveEdit}
        initialTitle={currentTitle}
        type={type}
      />
    </>
  );
}
