"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { IncidentDef } from "@/lib/incidents";

const runBtn =
  "rounded-full bg-[#10B981] px-4 py-2 text-[13px] font-medium text-[#0A0B0D] transition-all hover:bg-[#0ea472] active:scale-[0.97]";

const layoutSpring = { type: "spring" as const, stiffness: 320, damping: 32, mass: 0.85 };

interface IncidentCardProps {
  incident: IncidentDef;
  layoutId: string;
  onRun: () => void;
  disabled?: boolean;
  result?: "blocked" | null;
  index?: number;
}

export function IncidentCard({
  incident,
  layoutId,
  onRun,
  disabled,
  result,
  index = 0,
}: IncidentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
      className="h-full"
    >
      <motion.div
        layoutId={layoutId}
        layout
        transition={{ layout: layoutSpring }}
        className={cn(
          "group flex h-full min-h-[280px] w-full flex-col rounded-[20px] border border-white/[0.08] bg-[#12141a] p-5 transition-colors duration-300 sm:min-h-[300px] sm:rounded-[24px] sm:p-8",
          "hover:border-[#10B981]/35 hover:shadow-[0_8px_32px_rgba(0,0,0,0.25)]",
          disabled && "pointer-events-none opacity-40",
          result === "blocked" && "border-white/[0.12]",
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <span className="mb-2.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
              {incident.attackSurfaceLabel}
            </span>
            <h3 className="text-[20px] font-medium tracking-[-0.03em] text-[#F4F5F7] sm:text-[22px]">
              {incident.title}
            </h3>
          </div>
          {result === "blocked" && (
            <span className="shrink-0 rounded-full border border-white/[0.08] px-2.5 py-1 font-mono text-[9px] uppercase tracking-wide text-white/45">
              Blocked
            </span>
          )}
        </div>

        <p className="mb-8 flex-1 text-[15px] font-normal leading-[1.65] tracking-[-0.01em] text-white/45 sm:text-[16px]">
          {incident.hook}
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRun();
          }}
          disabled={disabled}
          className={cn(runBtn, "w-fit")}
        >
          Run incident
        </button>
      </motion.div>
    </motion.div>
  );
}
