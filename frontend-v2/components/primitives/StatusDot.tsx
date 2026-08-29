"use client";
import { cn } from "@/lib/cn";

type DotState = "idle" | "live" | "done" | "blocked" | "warning" | "wait";

interface StatusDotProps {
  state: DotState;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const stateClasses: Record<DotState, string> = {
  idle: "bg-ink-faint",
  live: "bg-accent animate-pulse-dot",
  done: "bg-success",
  blocked: "bg-danger",
  warning: "bg-warning",
  wait: "bg-border-strong",
};

const sizeClasses = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-2.5 h-2.5",
};

export function StatusDot({ state, size = "sm", className }: StatusDotProps) {
  return (
    <span
      className={cn(
        "rounded-full flex-shrink-0 inline-block",
        stateClasses[state],
        sizeClasses[size],
        className,
      )}
    />
  );
}
