"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Attack } from "@/lib/types";

interface AttackCardProps {
  attack: Attack;
  onRun: (attack: Attack) => void;
  active?: boolean;
  result?: "authorized" | "blocked" | null;
  disabled?: boolean;
  index?: number;
}

export function AttackCard({
  attack,
  onRun,
  active,
  result,
  disabled,
  index = 0,
}: AttackCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
      className={cn(
        "flex flex-col gap-4 rounded-[20px] border border-border bg-paper p-6 transition-all duration-300",
        "hover:border-ink/20 hover:shadow-[0_4px_20px_rgba(10,10,10,0.05)]",
        active && "border-ink/30 bg-[#FAFAF9] shadow-md",
        result === "blocked" && "border-ink/25",
        result === "authorized" && "border-ink/25",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="mb-2 inline-block font-mono text-[10px] tracking-wide text-ink-faint">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-[17px] font-semibold tracking-[-0.03em] text-ink">{attack.title}</h3>
          <p className="mt-1 text-[12px] font-normal text-ink-faint">{attack.subtitle}</p>
        </div>

        {result === "blocked" && (
          <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[9px] font-medium uppercase tracking-wide text-ink">
            Blocked
          </span>
        )}
        {result === "authorized" && (
          <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[9px] font-medium uppercase tracking-wide text-ink-muted">
            Authorized
          </span>
        )}
        {active && !result && (
          <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wide text-ink-faint">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink" />
            Running
          </span>
        )}
      </div>

      <p className="min-h-[56px] flex-1 text-[13px] font-normal leading-[1.6] text-ink-muted">
        {attack.whatBreaks}
      </p>

      <p className="border-l-2 border-border pl-3 text-[11px] font-normal leading-relaxed text-ink-faint">
        {attack.narrative}
      </p>

      <button
        onClick={() => !disabled && onRun(attack)}
        disabled={!!disabled}
        className={cn(
          "mt-auto flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-medium transition-all duration-200 active:scale-[0.98]",
          active
            ? "bg-ink text-paper"
            : "bg-ink text-paper hover:bg-ink/90",
          disabled && "cursor-not-allowed opacity-40",
        )}
      >
        {active ? (
          "Running…"
        ) : result ? (
          <>Run again <ArrowRight className="h-3.5 w-3.5" /></>
        ) : (
          <>Run scenario <ArrowRight className="h-3.5 w-3.5" /></>
        )}
      </button>
    </motion.div>
  );
}
