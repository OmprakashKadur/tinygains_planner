import { PlannerHeader } from "@/components/planner-header";
import {
  Calendar,
  CalendarDays,
  CheckCircle2,
  LayoutDashboard,
  Maximize2,
  MoreVertical,
} from "lucide-react";

export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-12 pt-10">
      <PlannerHeader
        title="How to use FocusFlow Pro"
        subtitle="Master the art of intent-driven productivity."
        type="year" // Using yearly style for generic header
        date={new Date()}
        showNavigation={false}
      />

      <section className="space-y-6">
        <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/50">
          <h2 className="text-xl font-bold text-primary mb-4">
            The Philosophy
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            FocusFlow Pro operates on a simple principle:{" "}
            <strong className="text-on-surface">
              Zoom Out to Plan, Zoom In to Execute.
            </strong>
            <br />
            <br />
            Most to-do lists fail because they are just endless lists of tasks.
            Here, every task you do today is directly linked to a larger goal
            for the week, month, and year. This ensures you are always working
            on what matters.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-surface p-6 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-on-surface">
                1. The Hierarchy
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-on-surface-variant">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Yearly Goals:</strong> The big picture ideas.
                </span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Monthly Goals:</strong> Break yearly goals into
                  milestones.
                </span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Weekly Goals:</strong> Actionable chunks for the week.
                </span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Daily Tasks:</strong> The actual work, linked to
                  weekly goals.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-surface p-6 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-tertiary/10 rounded-lg text-tertiary">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-on-surface">
                2. The Dashboard
              </h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Your command center. It shows Today's Tasks, Active Weekly Goals,
              and Insights at a glance. Use this to start your day and check
              your progress.
            </p>
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant">
          <h2 className="text-xl font-bold text-on-surface mb-6">
            Key Features
          </h2>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="mt-1">
                <div className="p-2 bg-surface rounded-full border border-outline-variant">
                  <Maximize2 className="w-5 h-5 text-on-surface-variant" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-on-surface">Calendar Zoom</h4>
                <p className="text-sm text-on-surface-variant mt-1">
                  In the <strong>Calendar</strong> view, hover over any date to
                  see the Zoom icon. Click it to jump straight to that day's
                  detailed planner view.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1">
                <div className="p-2 bg-surface rounded-full border border-outline-variant">
                  <MoreVertical className="w-5 h-5 text-on-surface-variant" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-on-surface">Rescheduling</h4>
                <p className="text-sm text-on-surface-variant mt-1">
                  Life happens. If you miss a task, click the menu (three dots)
                  on any goal and select <strong>Reschedule</strong> to move it
                  to another date seamlessly.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1">
                <div className="p-2 bg-surface rounded-full border border-outline-variant">
                  <CalendarDays className="w-5 h-5 text-on-surface-variant" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-on-surface">Context Filtering</h4>
                <p className="text-sm text-on-surface-variant mt-1">
                  In the <strong>Day Planner</strong>, use the "Context Filter
                  Bar" at the top to filter daily tasks by their parent Weekly
                  Goal. This helps you focus on one project at a time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
