"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-10 text-center">
      <div className="rounded-full bg-error-container p-4 text-on-error-container">
        <AlertCircle className="h-10 w-10" />
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-xl font-bold text-on-surface">
          Something went wrong!
        </h2>
        <p className="text-on-surface-variant">
          We encountered an unexpected error. Please try again.
        </p>
        <p className="text-xs font-mono text-error bg-error/10 p-2 rounded">
          {error.message || "Unknown error"}
        </p>
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary hover:bg-primary/90 transition-colors"
      >
        <RotateCcw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
