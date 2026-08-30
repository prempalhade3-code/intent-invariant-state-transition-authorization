"use client";

import { cn } from "@/lib/cn";
import { useElapsedTimer } from "@/hooks/useElapsedTimer";

interface TaskHeaderProps {
  prompt: string | null;
  budget?: number | null;
  merchant?: string | null;
  live?: boolean;
  onNewRun?: () => void;
}

export function TaskHeader({
  prompt,
  budget,
  merchant,
  live,
  onNewRun,
}: TaskHeaderProps) {
  const { label: elapsed } = useElapsedTimer(Boolean(live));

  return (
    <div className="border-b border-white/[0.06] px-6 py-8 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-[720px]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {live && (
              <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#10B981]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#10B981]" />
                Live
              </span>
            )}
            {live && (
              <span className="font-mono text-[13px] tabular-nums text-white/35">
                {elapsed}
              </span>
            )}
          </div>
          {onNewRun && (
            <button
              onClick={onNewRun}
              className={cn(
                "rounded-full border border-white/[0.12] px-4 py-1.5",
                "text-[12px] font-medium text-white/50 hover:text-white",
              )}
            >
              New run
            </button>
          )}
        </div>

        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
          Your task
        </p>
        <h1 className="mt-3 text-[clamp(20px,3.5vw,28px)] font-medium leading-snug tracking-[-0.02em] text-white/90">
          {prompt ?? "Running authorized transaction…"}
        </h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {budget != null && (
            <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/40">
              Ceiling ${budget}
            </span>
          )}
          {merchant && (
            <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/40">
              {merchant}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
