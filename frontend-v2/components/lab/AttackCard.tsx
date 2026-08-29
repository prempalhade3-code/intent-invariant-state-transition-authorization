"use client";
import { motion } from "framer-motion";
import {
  Zap, Clock, GitFork, Shield, Key, Lock,
  ArrowRight, CheckCircle, ShieldX,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/primitives/Badge";
import type { Attack } from "@/lib/types";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap, Clock, GitFork, Shield, Key, Lock,
};

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
  const Icon = ICONS[attack.icon] ?? Zap;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: index * 0.07 }}
      className={cn(
        "bg-paper p-6 flex flex-col gap-5 transition-all duration-300 hover:bg-surface",
        active && "border-accent bg-accent-light",
        result === "blocked" && "border-blocked-border bg-danger-light",
        result === "authorized" && "border-authorized-border bg-success-light",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
              active ? "bg-accent text-paper" :
              result === "blocked" ? "bg-danger text-paper" :
              result === "authorized" ? "bg-success text-paper" :
              "bg-surface border border-border text-ink-muted",
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-[-.035em] text-ink">{attack.title}</h3>
            <p className="mt-0.5 text-xs text-ink-faint">{attack.subtitle}</p>
          </div>
        </div>

        {result === "blocked" && (
          <Badge variant="danger" size="sm" dot>Blocked</Badge>
        )}
        {result === "authorized" && (
          <Badge variant="success" size="sm" dot>Authorized</Badge>
        )}
        {active && !result && (
          <Badge variant="accent" size="sm" dot>Running</Badge>
        )}
      </div>

      {/* What breaks */}
      <p className="min-h-[64px] text-[13px] leading-relaxed text-ink-muted">{attack.whatBreaks}</p>

      {/* Narrative */}
      <p className="border-l border-border pl-3 text-[11px] leading-relaxed text-ink-faint">{attack.narrative}</p>

      {/* CTA */}
      <button
        onClick={() => !disabled && onRun(attack)}
        disabled={!!disabled}
        className={cn(
          "mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium",
          "transition-all duration-150 active:scale-[0.98]",
          active
            ? "bg-accent text-paper"
            : result === "blocked"
              ? "bg-danger text-paper"
              : result === "authorized"
                ? "bg-success text-paper"
                : "bg-ink text-paper hover:bg-ink/90",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        {active ? (
          <>Running…</>
        ) : result === "blocked" ? (
          <><ShieldX className="w-4 h-4" /> Blocked — run again</>
        ) : result === "authorized" ? (
          <><CheckCircle className="w-4 h-4" /> Authorized — run again</>
        ) : (
          <>Run scenario <ArrowRight className="w-4 h-4" /></>
        )}
      </button>
    </motion.div>
  );
}
