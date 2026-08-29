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
        "sticky top-0 z-40 h-14 border-b border-border bg-paper/90 backdrop-blur-md",
        "flex items-center justify-between px-6",
        className,
      )}
    >
      {/* Brand */}
      <Link href="/" className="flex items-center gap-3 no-underline group">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <span className="text-paper font-bold text-xs tracking-tight">I</span>
          </div>
          <span className="font-semibold text-base text-ink tracking-tight">IISTA</span>
        </div>
        <span className="text-border-strong">·</span>
        <span className="text-sm text-ink-muted font-normal hidden sm:block">
          Authorization for autonomous payments
        </span>
      </Link>

      {/* Center — run context */}
      {runId && (
        <div className="hidden md:flex items-center gap-2 font-mono text-xs text-ink-faint bg-surface border border-border px-3 py-1 rounded-full">
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
              "flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border",
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
