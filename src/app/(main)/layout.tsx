import { Sidebar } from "@/components/sidebar";
import { LogOut } from "lucide-react";
import { signout } from "@/app/auth/actions";
import Link from "next/link";
import {
  LayoutDashboard,
  BarChart2,
  CreditCard,
  Calendar,
  CalendarDays,
  BookOpen,
  Trophy,
  StickyNote,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar>
        <div className="p-4 border-t border-outline-variant">
          <form action={signout}>
            <button className="flex items-center gap-3 px-4 py-3 w-full rounded-full hover:bg-error-container hover:text-on-error-container text-sm font-medium transition-colors text-on-surface-variant">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </form>
        </div>
      </Sidebar>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-surface text-on-surface">
        {children}
      </main>

      {/* Mobile Nav Bottom (Visible only on small screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container border-t border-outline-variant p-4 flex justify-around">
        <Link href="/dashboard" className="text-on-surface-variant">
          <LayoutDashboard />
        </Link>
        <Link href="/calendar" className="text-on-surface-variant">
          <CalendarDays />
        </Link>
        <Link href="/guide" className="text-on-surface-variant">
          <BookOpen />
        </Link>
        <Link href="/planner" className="text-on-surface-variant">
          <Calendar />
        </Link>
        <Link href="/achievements" className="text-on-surface-variant">
          <Trophy />
        </Link>
        <Link href="/notes" className="text-on-surface-variant">
          <StickyNote />
        </Link>
        <Link href="/reports" className="text-on-surface-variant">
          <BarChart2 />
        </Link>
        <Link href="/pricing" className="text-on-surface-variant">
          <CreditCard />
        </Link>
      </div>
    </div>
  );
}
