"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

interface NarrativeChapterProps {
  summary: string;
  state: "done" | "active" | "upcoming";
  children?: React.ReactNode;
}

export function NarrativeChapter({ summary, state, children }: NarrativeChapterProps) {
  if (state === "upcoming") return null;

  if (state === "done") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 py-2"
      >
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10B981]/15">
          <Check className="h-3 w-3 text-[#10B981]" />
        </div>
        <p className="text-[13px] text-white/40">{summary}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="py-8 sm:py-10"
    >
      {children}
    </motion.div>
  );
}

export function NarrativeHero({
  headline,
  sub,
  accent,
  className,
}: {
  headline: string;
  sub?: string;
  accent?: "neutral" | "emerald" | "danger";
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <h2
        className={cn(
          "text-[clamp(26px,5vw,36px)] font-medium leading-[1.12] tracking-[-0.03em]",
          accent === "emerald" && "text-[#10B981]",
          accent === "danger" && "text-[#EF4444]",
          accent === "neutral" && "text-[#F4F5F7]",
          !accent && "text-[#F4F5F7]",
        )}
      >
        {headline}
      </h2>
      {sub && (
        <p className="max-w-lg text-[15px] leading-relaxed text-white/50 sm:text-[16px]">
          {sub}
        </p>
      )}
    </div>
  );
}

export function MarketplaceTag({ runId }: { runId: string }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/30">
        Operating in · Northbridge Cloud
      </span>
      <a
        href={`/store/?run=${encodeURIComponent(runId)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-[10px] uppercase tracking-wider text-[#10B981]/80 transition-colors hover:text-[#10B981]"
      >
        Open store ↗
      </a>
    </div>
  );
}
