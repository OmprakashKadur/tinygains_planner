import { getAllAchievements } from "@/actions/achievements";
import { AchievementsClient } from "@/components/achievements-client";
import { PlannerHeader } from "@/components/planner-header";

export default async function AchievementsPage() {
  const data = await getAllAchievements();

  return (
    <div className="flex flex-col min-h-screen ">
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        <PlannerHeader
          title="Achievements"
          showNavigation={false}
          type="day"
          date={new Date()}
          subtitle="Celebrate your progress and perfect periods."
        />
        <AchievementsClient data={data} />
      </main>
    </div>
  );
}
