"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { HighlightPulse } from "./HighlightPulse";
import type { VerificationCheck } from "@/lib/types";

interface IncidentLedgerProps {
  checks: VerificationCheck[];
  highlightId?: string;
  className?: string;
  spread?: boolean;
  animated?: boolean;
}

function CheckIcon({ state }: { state: VerificationCheck["state"] }) {
  if (state === "ok") {
    return (
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#10B981]/30 bg-[#10B981]/10">
        <Check className="h-3 w-3 text-[#10B981]" />
      </div>
    );
  }
  if (state === "bad") {
    return (
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
        <X className="h-3 w-3 text-red-400" />
      </div>
    );
  }
  return (
    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-[#161820]">
      <Clock className="h-3 w-3 text-white/35" />
    </div>
  );
}

export function IncidentLedger({
  checks,
  highlightId,
  className,
  spread,
  animated,
}: IncidentLedgerProps) {
  return (
    <div className={cn("flex flex-col sm:h-full sm:min-h-0", className)}>
      <p className="mb-2 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
        Sworn verification
      </p>
      <p className="mb-3 shrink-0 text-[13px] leading-relaxed text-white/40">
        Sworn re-checks the full path at commit time. One failure blocks settlement.
      </p>
      <div className={cn("flex flex-col", spread ? "sm:min-h-0 sm:flex-1 sm:justify-between" : "")}>
        <AnimatePresence initial={false}>
          {checks.map((check, i) => {
            const isFail = highlightId === check.id && check.state === "bad";
            const row = (
              <motion.div
                initial={animated ? { opacity: 0, x: -8 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className={cn(
                  "flex items-start gap-3 border-b border-white/[0.06] py-3 last:border-0",
                  spread && "sm:flex-1 sm:py-4",
                  isFail && !animated && "rounded-lg bg-red-500/5 -mx-2 px-2",
                )}
              >
                <CheckIcon state={check.state} />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-[14px] font-medium leading-tight",
                      check.state === "ok" && "text-[#F4F5F7]",
                      check.state === "bad" && "text-red-400",
                      check.state === "wait" && "text-white/50",
                    )}
                  >
                    {check.label}
                  </p>
                  <p className="mt-1 break-words text-[12px] leading-relaxed text-white/40">
                    {check.detail}
                  </p>
                </div>
              </motion.div>
            );

            if (isFail && animated) {
              return (
                <HighlightPulse key={check.id} variant="red" className={cn("shrink-0", spread && "sm:flex-1")}>
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-2 py-1">{row}</div>
                </HighlightPulse>
              );
            }

            return <div key={check.id}>{row}</div>;
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
