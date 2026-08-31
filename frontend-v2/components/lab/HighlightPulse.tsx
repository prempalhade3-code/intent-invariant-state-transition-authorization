"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

type HighlightVariant = "green" | "red";

interface HighlightPulseProps {
  children: React.ReactNode;
  variant?: HighlightVariant;
  className?: string;
  rounded?: "lg" | "xl" | "full";
}

const accent = {
  green: {
    bar: "bg-[#10B981]",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.35)]",
    shimmer: "from-transparent via-[#10B981]/20 to-transparent",
    edge: "bg-gradient-to-r from-[#10B981]/50 to-transparent",
  },
  red: {
    bar: "bg-red-400",
    glow: "shadow-[0_0_20px_rgba(248,113,113,0.3)]",
    shimmer: "from-transparent via-red-400/20 to-transparent",
    edge: "bg-gradient-to-r from-red-400/50 to-transparent",
  },
};

export function HighlightPulse({
  children,
  variant = "green",
  className,
  rounded = "xl",
}: HighlightPulseProps) {
  const radius = rounded === "full" ? "rounded-full" : rounded === "lg" ? "rounded-lg" : "rounded-xl";
  const tone = accent[variant];

  return (
    <div className={cn("relative overflow-hidden", radius, className)}>
      <motion.span
        aria-hidden
        className={cn("absolute left-0 top-2 bottom-2 w-[3px] rounded-full", tone.bar, tone.glow)}
        animate={{ scaleY: [0.85, 1, 0.85], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.span
        aria-hidden
        className={cn("pointer-events-none absolute inset-x-0 top-0 h-px", tone.edge)}
        animate={{ opacity: [0.2, 0.8, 0.2], scaleX: [0.6, 1, 0.6] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "left center" }}
      />

      <motion.span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 w-[40%] bg-gradient-to-r",
          tone.shimmer,
        )}
        animate={{ x: ["-120%", "320%"] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: [0.4, 0, 0.2, 1], repeatDelay: 1.8 }}
      />

      <div className="relative pl-4">{children}</div>
    </div>
  );
}
