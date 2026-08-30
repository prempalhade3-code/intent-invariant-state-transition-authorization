"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { cn } from "@/lib/cn";
import type { HumanCheck } from "@/lib/narrative";

interface AuthorizationSealProps {
  checks: HumanCheck[];
  state: "waiting" | "checking" | "authorized" | "blocked";
  blockReason?: string | null;
}

function CheckRow({ check, index }: { check: HumanCheck; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.35, duration: 0.4 }}
      className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-0"
    >
      <div
        className={cn(
          "mt-1 h-2 w-2 shrink-0 rounded-full transition-colors duration-500",
          check.state === "ok" && "bg-[#10B981]",
          check.state === "bad" && "bg-[#EF4444]",
          check.state === "wait" && "bg-white/20",
        )}
      />
      <div>
        <p
          className={cn(
            "text-[14px] font-medium",
            check.state === "ok" && "text-white/85",
            check.state === "bad" && "text-[#EF4444]",
            check.state === "wait" && "text-white/45",
          )}
        >
          {check.label}
        </p>
        <p className="mt-0.5 text-[13px] text-white/35">{check.detail}</p>
      </div>
    </motion.div>
  );
}

export function AuthorizationSeal({ checks, state, blockReason }: AuthorizationSealProps) {
  const resolvedCount = checks.filter((c) => c.state === "ok" || c.state === "bad").length;

  return (
    <div className="mt-2 space-y-6">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            state === "authorized" && "bg-[#10B981]/15",
            state === "blocked" && "bg-[#EF4444]/15",
            (state === "waiting" || state === "checking") && "bg-white/[0.04]",
          )}
        >
          <Shield
            className={cn(
              "h-5 w-5",
              state === "authorized" && "text-[#10B981]",
              state === "blocked" && "text-[#EF4444]",
              (state === "waiting" || state === "checking") && "text-white/40",
            )}
          />
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
            SWORN verification
          </p>
          <p className="text-[14px] text-white/60">
            {state === "checking" && `Checking · ${resolvedCount}/${checks.length}`}
            {state === "authorized" && "All checks passed"}
            {state === "blocked" && "Payment blocked"}
            {state === "waiting" && "Preparing verification"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-[#0D0E12]/50 px-5 py-2">
        {checks.map((check, i) => (
          <CheckRow key={check.id} check={check} index={i} />
        ))}
      </div>

      {state === "blocked" && blockReason && (
        <p className="text-[14px] leading-relaxed text-[#EF4444]/90">{blockReason}</p>
      )}
    </div>
  );
}
