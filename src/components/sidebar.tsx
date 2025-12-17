"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart2,
  CreditCard,
  LogOut,
  Calendar,
  CalendarDays,
  BookOpen,
  Trophy,
  StickyNote,
  User,
} from "lucide-react";

export function Sidebar({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/calendar", label: "Calendar", icon: CalendarDays },
    { href: "/guide", label: "Guide", icon: BookOpen },
    { href: "/planner", label: "Planner", icon: Calendar },
    { href: "/achievements", label: "Achievements", icon: Trophy },
    { href: "/notes", label: "Notes", icon: StickyNote },
    { href: "/reports", label: "Reports", icon: BarChart2 },
    { href: "/pricing", label: "Pricing", icon: CreditCard },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <aside className="w-64 border-r border-outline-variant bg-surface-container-low hidden md:flex flex-col">
      <div className="p-6 text-xl font-bold border-b border-outline-variant text-on-surface">
        FocusFlow Pro
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              )}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </aside>
  );
}
