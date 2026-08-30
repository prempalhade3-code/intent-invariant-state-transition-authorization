"use client";

import { cn } from "@/lib/cn";
import { useElapsedTimer } from "@/hooks/useElapsedTimer";

interface IntentBarProps {
  prompt: string | null;
  budget?: number | null;
  merchant?: string | null;
  status: "live" | "settled" | "error" | "submitting" | "blocked";
  onNewRun?: () => void;
}

export function IntentBar({
  prompt,
  budget,
  merchant,
  status,
  onNewRun,
}: IntentBarProps) {
  const { label: elapsed } = useElapsedTimer(
    status === "live" || status === "submitting",
  );

  return (
    <div className="shrink-0 border-b border-white/[0.06] bg-[#0A0B0D]/95 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:px-10">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-white/75 sm:text-[14px]">
            {prompt ?? "Running authorized transaction…"}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            {budget != null && (
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white/40">
                Ceiling ${budget}
              </span>
            )}
            {merchant && (
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white/40">
                {merchant}
              </span>
            )}
            {(status === "live" || status === "submitting") && (
              <>
                <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#10B981]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#10B981]" />
                  Live
                </span>
                <span className="font-mono text-[11px] tabular-nums text-white/30">
                  {elapsed}
                </span>
              </>
            )}
            {status === "settled" && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#10B981]/70">
                Complete
              </span>
            )}
            {status === "blocked" && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#EF4444]">
                Blocked
              </span>
            )}
          </div>
        </div>
        {onNewRun && (
          <button
            onClick={onNewRun}
            className={cn(
              "shrink-0 rounded-full border border-white/[0.12] px-3.5 py-1.5",
              "text-[12px] font-medium text-white/55 transition-colors",
              "hover:border-white/25 hover:text-white",
            )}
          >
            New run
          </button>
        )}
      </div>
    </div>
  );
}
