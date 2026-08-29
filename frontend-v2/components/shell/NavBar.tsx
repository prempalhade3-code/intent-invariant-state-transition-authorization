"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative py-1 text-[13px] font-medium text-ink-muted transition-colors duration-200 hover:text-ink"
    >
      {children}
      <span className="absolute -bottom-px left-1/2 h-px w-0 -translate-x-1/2 bg-ink transition-all duration-300 ease-out group-hover:w-full" />
    </Link>
  );
}

export function NavBar({ phase, runId, blocked, onReset, className }: NavBarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isLive = phase === "live";
  const isSettled = phase === "settled";
  const inRun = ["live", "settled", "submitting", "error"].includes(phase ?? "");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "fixed left-1/2 top-4 z-40 h-[52px] -translate-x-1/2",
        "flex items-center justify-between rounded-full border bg-paper/90 px-5 backdrop-blur-xl",
        "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:px-6",
        scrolled
          ? "border-border shadow-[0_2px_12px_rgba(10,10,10,0.06)]"
          : "border-border/80 shadow-[0_1px_3px_rgba(10,10,10,0.04)]",
        hovered ? "w-[min(calc(100%-1.5rem),680px)]" : "w-[min(calc(100%-2.5rem),640px)]",
        className,
      )}
    >
      <Link
        href="/"
        className="transition-opacity duration-200 hover:opacity-55"
        aria-label="Sworn home"
      >
        <span className="font-sans text-[16px] font-medium tracking-[-0.03em] text-ink">
          Sworn
        </span>
      </Link>

      <div className="flex items-center gap-5 font-sans">
        {inRun && (
          <div className="flex items-center gap-4">
            {runId && (
              <span className="hidden font-mono text-[10px] tracking-wide text-ink-faint md:block">
                {runId.split("-")[1] || runId}
              </span>
            )}

            <div className="flex items-center gap-2">
              {isLive && !blocked && <PulseRing active size="sm" variant="accent" />}
              {(blocked || phase === "error") && (
                <span className="h-1.5 w-1.5 rounded-full bg-danger" />
              )}
              {isSettled && !blocked && (
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
              )}
              {phase === "submitting" && (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-faint" />
              )}
              <span className="text-[13px] font-medium capitalize text-ink-muted">
                {phase === "submitting"
                  ? "Starting"
                  : blocked
                    ? "Blocked"
                    : isLive
                      ? "Live"
                      : isSettled
                        ? "Settled"
                        : phase}
              </span>
            </div>

            {onReset && (
              <button
                onClick={onReset}
                className="ml-2 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
              >
                New Run
              </button>
            )}
          </div>
        )}

        {!inRun && (
          <nav className="flex items-center gap-5">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/lab">Incident Lab</NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}
