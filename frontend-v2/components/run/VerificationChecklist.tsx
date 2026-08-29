"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Clock, Shield } from "lucide-react";
import { cn } from "@/lib/cn";
import { HashChip } from "@/components/primitives/HashChip";
import type { VerificationCheck } from "@/lib/types";

interface VerificationChecklistProps {
  checks: VerificationCheck[];
  className?: string;
}

function CheckIcon({ state }: { state: VerificationCheck["state"] }) {
  if (state === "ok") {
    return (
      <div className="w-5 h-5 rounded-full bg-success-light border border-authorized-border flex items-center justify-center flex-shrink-0">
        <Check className="w-3 h-3 text-success" />
      </div>
    );
  }
  if (state === "bad") {
    return (
      <div className="w-5 h-5 rounded-full bg-danger-light border border-blocked-border flex items-center justify-center flex-shrink-0">
        <X className="w-3 h-3 text-danger" />
      </div>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center flex-shrink-0">
      <Clock className="w-3 h-3 text-ink-faint" />
    </div>
  );
}

export function VerificationChecklist({ checks, className }: VerificationChecklistProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <AnimatePresence initial={false}>
        {checks.map((check) => (
          <motion.div
            key={check.id}
            layout
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "flex items-start gap-2.5 py-2 border-b border-border last:border-0",
            )}
          >
            <CheckIcon state={check.state} />
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-xs font-medium leading-tight",
                  check.state === "ok" ? "text-ink" :
                  check.state === "bad" ? "text-danger" :
                  "text-ink-muted",
                )}
              >
                {check.label}
              </p>
              <p className="text-2xs text-ink-faint mt-0.5 leading-relaxed break-words">
                {check.detail}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
