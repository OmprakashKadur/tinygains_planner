import { createClient } from "@/lib/supabase/server";
import { getMonthlyDailyGoals } from "@/actions/daily-goals";
import { redirect } from "next/navigation";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { CalendarView } from "@/components/calendar-view";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { year: yearParam, month: monthParam } = await searchParams;

  const now = new Date();
  const year = yearParam ? parseInt(yearParam) : now.getFullYear();
  const month = monthParam ? parseInt(monthParam) : now.getMonth() + 1; // 1-indexed for query/logic

  // Calculate start and end dates for the fetching
  // Note: Month in JS Date is 0-indexed, so subtract 1
  const dateObj = new Date(year, month - 1);
  const startDate = format(startOfMonth(dateObj), "yyyy-MM-dd");
  const endDate = format(endOfMonth(dateObj), "yyyy-MM-dd");

  const goals = await getMonthlyDailyGoals(startDate, endDate);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-display-small font-bold text-on-surface">
          Calendar
        </h1>
        <p className="text-body-medium text-on-surface-variant">
          View your daily tasks in a monthly grid.
        </p>
      </div>

      <CalendarView currentYear={year} currentMonth={month} goals={goals} />
    </div>
  );
}
