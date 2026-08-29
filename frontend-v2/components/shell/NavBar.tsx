"use client";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { PulseRing } from "@/components/primitives/PulseRing";
import type { Phase } from "@/lib/types";

interface NavBarProps {
  phase?: Phase;
  runId?: string | null;
  blocked?: boolean;
  onReset?: () => void;
  className?: string;
}

export function NavBar({ phase, runId, blocked, onReset, className }: NavBarProps) {
  const isLive = phase === "live";
  const isSettled = phase === "settled";
  const inRun = ["live", "settled", "submitting", "error"].includes(phase ?? "");

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-xl",
        "flex h-[74px] items-center justify-between px-5 md:px-8",
        className,
      )}
    >
      {/* Brand */}
      <Link href="/" className="flex items-center gap-3 no-underline group" aria-label="SWORN home">
        <div className="sworn-mark">S</div>
        <div className="leading-none">
          <span className="block text-[17px] font-semibold tracking-[-0.06em] text-ink">SWORN</span>
          <span className="mt-1 hidden text-[10px] font-mono uppercase tracking-[0.12em] text-ink-faint sm:block">authorization layer</span>
        </div>
      </Link>

      {/* Center — run context */}
      {runId && (
        <div className="hidden md:flex items-center gap-2 font-mono text-[10px] text-ink-faint border border-border px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-border-strong" />
          {runId}
        </div>
      )}

      {/* Right — status + actions */}
      <div className="flex items-center gap-3">
        {/* Status chip */}
        {phase && phase !== "idle" && (
          <div
            className={cn(
              "flex items-center gap-2 text-[11px] font-medium px-3 py-1.5 rounded-full border",
              isLive && !blocked
                ? "bg-accent-light border-accent/20 text-accent"
                : isSettled && !blocked
                  ? "bg-success-light border-authorized-border text-success"
                  : blocked || phase === "error"
                    ? "bg-danger-light border-blocked-border text-danger"
                    : "bg-surface border-border text-ink-muted",
            )}
          >
            {isLive && !blocked && <PulseRing active size="sm" variant="accent" />}
            {(blocked || phase === "error") && <span className="w-1.5 h-1.5 rounded-full bg-danger" />}
            {isSettled && !blocked && <span className="w-1.5 h-1.5 rounded-full bg-success" />}
            {phase === "submitting" && (
              <span className="w-1.5 h-1.5 rounded-full bg-ink-faint animate-pulse" />
            )}
            <span className="capitalize">
              {phase === "submitting"
                ? "Starting…"
                : blocked
                  ? "Blocked"
                  : isLive
                    ? "Live"
                    : isSettled
                      ? "Settled"
                      : phase}
            </span>
          </div>
        )}

        {/* Actions */}
        {inRun && onReset && (
          <button
            onClick={onReset}
            className="btn-ghost text-xs h-8 px-3"
          >
            New run
          </button>
        )}

        {!inRun && (
          <Link href="/lab" className="btn-ghost text-xs h-8 px-3">
            Incident lab
          </Link>
        )}
      </div>
    </header>
  );
}
