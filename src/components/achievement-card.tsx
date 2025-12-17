"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, Share2, Loader2, Trophy, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "./ui/toast-context";

interface AchievementCardProps {
  title: string;
  date: string;
  type: "yearly" | "monthly" | "weekly" | "daily";
  description?: string;
}

export function AchievementCard({
  title,
  date,
  type,
  description,
}: AchievementCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      // Small delay to ensure styles are ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(cardRef.current, {
        scale: 4,
        backgroundColor: null,
        useCORS: true,
        logging: false,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // 1. Unclip container & Force Auto Height
          const card = clonedDoc.querySelector(".w-72");
          if (card) {
            (card as HTMLElement).style.overflow = "visible";
            (card as HTMLElement).style.height = "auto";
            (card as HTMLElement).style.minHeight = "320px";
            (card as HTMLElement).style.paddingBottom = "30px";
          }

          // 2. Fix Title rendering
          const title = clonedDoc.querySelector("h3");
          if (title) {
            title.style.textShadow = "none";
            title.style.filter = "none";
            title.style.webkitLineClamp = "unset";
            title.style.overflow = "visible";
            title.style.display = "block";

            // Metrics fixes
            title.style.height = "auto";
            title.style.lineHeight = "1.4";
            title.style.padding = "10px 0";
            title.style.margin = "0 0 20px 0";
            title.style.fontFamily = "system-ui, -apple-system, sans-serif";
            title.style.whiteSpace = "normal";
          }
        },
      });

      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = image;
      link.download = `achievement-${type}-${date.replace(/\//g, "-")}.png`;
      link.click();
      toast("Ready to share! Image downloaded.", "success");
    } catch (err) {
      console.error("Export failed", err);
      toast("Failed to download achievement", "error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative group perspective-1000">
      {/* The visible card */}
      <div
        ref={cardRef}
        className={cn(
          "w-72 h-80 flex flex-col p-6 rounded-2xl border-2 shadow-2xl transition-transform duration-500 relative overflow-hidden"
        )}
        style={{
          background:
            type === "yearly"
              ? "linear-gradient(to bottom right, #6366f1, #9333ea)"
              : type === "monthly"
              ? "linear-gradient(to bottom right, #ec4899, #e11d48)"
              : type === "weekly"
              ? "linear-gradient(to bottom right, #f59e0b, #f97316)"
              : "linear-gradient(to bottom right, #10b981, #14b8a6)",
          borderColor: "rgba(255, 255, 255, 0.2)",
          color: "#ffffff",
        }}
      >
        {/* Background Texture/Pattern */}
        <div
          className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat pointer-events-none"
          style={{ opacity: 0.1 }}
        />
        <div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
        />
        <div
          className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full blur-2xl"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
        />

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
          <div
            className="mb-6 p-4 backdrop-blur-md rounded-full shadow-lg border"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            <Trophy className="w-8 h-8 drop-shadow-md" color="#fde047" />
          </div>

          <div
            className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2"
            style={{ opacity: 0.8 }}
          >
            {type} Goal Completed
          </div>

          <h3 className="text-xl font-bold leading-tight mb-4 drop-shadow-sm line-clamp-3">
            {title}
          </h3>

          <div
            className="mt-auto flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              opacity: 0.9,
            }}
          >
            <Calendar className="w-3 h-3" color="#ffffff" />
            {date}
          </div>
        </div>

        {/* Watermark */}
        <div
          className="absolute bottom-2 right-3 text-[8px] font-medium"
          style={{ color: "rgba(255, 255, 255, 0.4)" }}
        >
          NextBase Planner
        </div>
      </div>

      {/* Hover Overlay with Actions */}
      <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4 z-20 backdrop-blur-[2px]">
        <button
          onClick={handleDownload}
          disabled={isExporting}
          className="flex items-center gap-2 px-6 py-2 bg-white text-black font-semibold rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Download
        </button>
        <div className="text-white/80 text-xs font-medium">
          Click to save image
        </div>
      </div>
    </div>
  );
}
