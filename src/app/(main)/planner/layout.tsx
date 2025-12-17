"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { name: "Yearly", href: "/planner/year" },
    { name: "Monthly", href: "/planner/month" },
    { name: "Weekly", href: "/planner/week" },
    { name: "Daily", href: "/planner/day" },
  ];

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <div className="w-full bg-surface-container-low border-b border-outline-variant px-6 py-2 flex items-center justify-center md:justify-start gap-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-secondary-container text-on-secondary-container shadow-sm"
                  : "text-on-surface hover:bg-surface-container-high"
              )}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>
      <div className="flex-1 overflow-auto p-6">{children}</div>
    </div>
  );
}
