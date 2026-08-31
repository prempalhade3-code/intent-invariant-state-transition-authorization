"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { IncidentPlayer } from "./IncidentPlayer";
import type { IncidentDef } from "@/lib/incidents";
import type { IncidentPhase } from "@/hooks/useIncidentRun";
import type { ViewModel } from "@/lib/reduce";

const layoutSpring = { type: "spring" as const, stiffness: 320, damping: 32, mass: 0.85 };

interface IncidentStageProps {
  incident: IncidentDef;
  layoutId: string;
  phase: IncidentPhase;
  view: ViewModel;
  onReplay: () => void;
  onClose: () => void;
}

export function IncidentStage({
  incident,
  layoutId,
  phase,
  view,
  onReplay,
  onClose,
}: IncidentStageProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase !== "running") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, phase]);

  const busy = phase === "running";

  return (
    <motion.div
      layoutId={layoutId}
      layout
      transition={{ layout: layoutSpring }}
      className={cn(
        "fixed inset-x-3 top-[max(4.5rem,env(safe-area-inset-top,0px)+3.5rem)] bottom-[max(3.5rem,env(safe-area-inset-bottom,0px)+1rem)] z-50 mx-auto flex w-auto max-w-[720px] flex-col overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#12141a] shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:inset-x-5 sm:top-[88px] sm:bottom-16 sm:rounded-[24px]",
      )}
    >
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.06] px-4 py-4 sm:gap-4 sm:px-7 sm:py-5">
        <div className="min-w-0">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
            {incident.attackSurfaceLabel}
          </span>
          <h2 className="text-[18px] font-medium tracking-[-0.03em] text-[#F4F5F7] sm:text-[24px]">
            {incident.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          aria-label="Close"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] text-white/50 transition-all hover:text-white/80",
            busy && "pointer-events-none opacity-40",
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-4 sm:overflow-hidden sm:px-7 sm:py-5">
        <IncidentPlayer incident={incident} phase={phase} view={view} onReplay={onReplay} />
      </div>
    </motion.div>
  );
}
