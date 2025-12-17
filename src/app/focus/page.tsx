import { FocusTimer } from "@/components/focus-timer";
import { Suspense } from "react";

export default function FocusPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Focus Mode</h1>
        <p className="text-muted-foreground">No distractions. Just flow.</p>
      </div>
      <Suspense fallback={<div>Loading timer...</div>}>
        <FocusTimer />
      </Suspense>
    </div>
  );
}
