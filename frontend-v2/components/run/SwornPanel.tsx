"use client";

import { Shield } from "lucide-react";
import { cn } from "@/lib/cn";
import { buildVerificationChecks, type ViewModel } from "@/lib/reduce";
import type { Phase } from "@/lib/types";

function CheckRow({
  label,
  detail,
  state,
}: {
  label: string;
  detail: string;
  state: "wait" | "ok" | "bad";
}) {
  return (
    <div className="flex items-start gap-3 border-b border-white/[0.04] py-3 last:border-0">
      <div
        className={cn(
          "mt-0.5 h-2 w-2 shrink-0 rounded-full",
          state === "ok" && "bg-[#10B981]",
          state === "bad" && "bg-[#EF4444]",
          state === "wait" && "bg-white/20",
        )}
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[13px] font-medium",
            state === "ok" && "text-white/80",
            state === "bad" && "text-[#EF4444]",
            state === "wait" && "text-white/45",
          )}
        >
          {label}
        </p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-white/35">{detail}</p>
      </div>
    </div>
  );
}

interface SwornPanelProps {
  view: ViewModel;
  phase: Phase;
  className?: string;
}

export function SwornPanel({ view, phase, className }: SwornPanelProps) {
  const checks = buildVerificationChecks(view, phase);
  const digest =
    view.ssi && typeof view.ssi.digest === "string"
      ? view.ssi.digest.slice(0, 12)
      : null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10B981]/10">
          <Shield className="h-4 w-4 text-[#10B981]" />
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
            Sworn
          </p>
          <p className="text-[14px] font-medium text-white/80">Authorization boundary</p>
        </div>
      </div>

      {digest && (
        <div className="mb-4 rounded-lg border border-white/[0.06] bg-[#0D0E12]/80 px-3 py-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">
            Policy digest
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-[#10B981]/80">{digest}…</p>
        </div>
      )}

      <div>
        {checks.slice(0, 5).map((c) => (
          <CheckRow key={c.id} label={c.label} detail={c.detail} state={c.state} />
        ))}
      </div>
    </div>
  );
}
