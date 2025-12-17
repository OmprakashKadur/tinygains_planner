import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 py-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-2 font-bold text-xl">
          DoesItFlow
        </div>
        <nav className="flex gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:underline"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link href="/login" className="text-sm font-medium hover:underline">
              Sign In
            </Link>
          )}
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl">
          Convert Focus into{" "}
          <span className="text-primary">Measurable Outcomes</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          FocusFlow Pro is not just a to-do list. It helps you set daily
          intents, track energy, and engage in deep work sessions.
        </p>
        <div className="flex gap-4">
          <Link
            href={user ? "/dashboard" : "/login"}
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            {user ? "Start Session" : "Get Started"}
          </Link>
          <Link
            href="#features"
            className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Learn More
          </Link>
        </div>
        <section className="w-full max-w-4xl grid md:grid-cols-3 gap-8 text-left mt-16 pt-16 border-t">
          <div className="space-y-2">
            <h3 className="font-bold text-lg">1. Plan</h3>
            <p className="text-muted-foreground text-sm">
              Define your Yearly Goals. Break them down into Monthly Milestones
              and Weekly Outcomes.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-lg">2. Execute</h3>
            <p className="text-muted-foreground text-sm">
              Each day, set 3 core tasks aligned with your Weekly Outcomes.
              Focus on what moves the needle.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-lg">3. Reflect</h3>
            <p className="text-muted-foreground text-sm">
              Review your progress daily. Adapt to changes without losing sight
              of the big picture.
            </p>
          </div>
          <div className="col-span-full text-center mt-8">
            <Link
              href="/guide"
              className="text-primary hover:underline font-medium text-sm"
            >
              Read the Full Guide &rarr;
            </Link>
          </div>
        </section>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} FocusFlow Pro. All rights reserved.
      </footer>
    </div>
  );
}
