"use client";

import { cn } from "@/lib/cn";
import type { ChapterId } from "@/lib/narrative";
import {
  STAGE_MARKERS,
  markerState,
  type ChapterId as CId,
} from "@/lib/narrative";

interface ConsoleStageSpineProps {
  activeChapter: ChapterId;
  displayIndex: number;
  blocked: boolean;
  className?: string;
}

export function ConsoleStageSpine({
  activeChapter,
  displayIndex,
  blocked,
  className,
}: ConsoleStageSpineProps) {
  return (
    <div className={cn("px-5 py-3 sm:px-8 lg:px-10", className)}>
      <div className="relative flex items-center justify-between">
        <div className="absolute inset-x-0 top-[5px] h-px bg-white/[0.06]" aria-hidden />
        {STAGE_MARKERS.map((marker, i) => {
          const state = markerState(
            marker,
            activeChapter as CId,
            displayIndex,
            blocked,
          );
          return (
            <div key={marker.id} className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "h-2.5 w-2.5 rounded-full border-2 transition-all duration-500",
                  state === "done" &&
                    "border-[#10B981] bg-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.4)]",
                  state === "active" &&
                    "scale-125 border-[#10B981] bg-[#10B981] shadow-[0_0_14px_rgba(16,185,129,0.55)]",
                  state === "pending" && "border-white/15 bg-[#0A0B0D]",
                  state === "blocked" && "border-[#EF4444] bg-[#EF4444]",
                )}
              />
              <span
                className={cn(
                  "hidden font-mono text-[9px] uppercase tracking-[0.1em] sm:block",
                  state === "active" && "text-[#10B981]",
                  state === "done" && "text-white/45",
                  state === "pending" && "text-white/20",
                  state === "blocked" && "text-[#EF4444]",
                )}
              >
                {marker.label}
              </span>
              {i < STAGE_MARKERS.length - 1 && (
                <span className="sr-only">then</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
