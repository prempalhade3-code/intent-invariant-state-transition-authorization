"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bot } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AgentStep } from "@/lib/types";

interface AgentNarrationProps {
  steps: AgentStep[];
  className?: string;
}

export function AgentNarration({ steps, className }: AgentNarrationProps) {
  const visible = steps.filter((s) => s.status !== "pending" || s.id === "intent");
  const active = steps.find((s) => s.status === "active");

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06]">
          <Bot className="h-4 w-4 text-white/60" />
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
            Agent
          </p>
          <p className="text-[14px] font-medium text-white/80">Autonomous shopper</p>
        </div>
        {active && (
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-[#10B981]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#10B981]" />
            Working
          </span>
        )}
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {visible.map((step) => (
            <motion.div
              key={step.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-baseline justify-between gap-3 rounded-lg px-3 py-2",
                step.status === "active" && "bg-[#10B981]/[0.08]",
                step.status === "blocked" && "bg-[#EF4444]/[0.08]",
              )}
            >
              <span
                className={cn(
                  "text-[13px]",
                  step.status === "done" && "text-white/55",
                  step.status === "active" && "text-white/90 font-medium",
                  step.status === "blocked" && "text-[#EF4444]",
                  step.status === "pending" && "text-white/25",
                )}
              >
                {step.label}
              </span>
              {step.detail && (
                <span className="shrink-0 font-mono text-[10px] text-white/35">{step.detail}</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
