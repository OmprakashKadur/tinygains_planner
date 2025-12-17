"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { logSession } from "@/actions/session";
import { Play, Pause, Square, CheckCircle } from "lucide-react";

export function FocusTimer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const blockId = searchParams.get("blockId");

  // Timer State
  const [secondsLeft, setSecondsLeft] = useState(25 * 60); // Default 25m
  const [isActive, setIsActive] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0); // Actual tracked time

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 0) {
            clearInterval(intervalRef.current!);
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
        setSessionDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const toggleTimer = () => setIsActive(!isActive);

  const stopTimer = async () => {
    setIsActive(false);
    if (sessionDuration > 60) {
      // Only log if > 1 minute
      const confirmed = window.confirm("End session and save progress?");
      if (confirmed) {
        await logSession(blockId, sessionDuration);
        router.push("/dashboard");
      }
    } else {
      router.push("/dashboard");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="relative w-64 h-64 flex items-center justify-center rounded-full border-8 border-primary/20">
        <div className="text-6xl font-mono font-bold tracking-tighter">
          {formatTime(secondsLeft)}
        </div>
        {/* Simple circular progress could go here */}
      </div>

      <div className="flex gap-4">
        <button
          onClick={toggleTimer}
          className="p-4 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-105"
        >
          {isActive ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </button>
        <button
          onClick={stopTimer}
          className="p-4 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-transform hover:scale-105"
        >
          <Square className="w-8 h-8" />
        </button>
      </div>

      <div className="text-center text-muted-foreground">
        {isActive ? "Stay focused." : "Ready to start?"}
      </div>
    </div>
  );
}
