"use client";
import { cn } from "@/lib/cn";

interface HashChipProps {
  value?: string | null;
  empty?: string;
  className?: string;
  full?: boolean;
}

export function HashChip({ value, empty = "—", className, full = false }: HashChipProps) {
  if (!value) {
    return (
      <span className={cn("font-mono text-2xs text-ink-faint", className)}>
        {empty}
      </span>
    );
  }

  const display = full ? value : `${value.slice(0, 8)}…${value.slice(-6)}`;

  return (
    <span
      title={value}
      className={cn(
        "font-mono text-2xs text-ink-faint bg-surface border border-border",
        "px-1.5 py-0.5 rounded-sm cursor-default select-all",
        "hover:text-ink-muted hover:border-border-strong transition-colors duration-100",
        className,
      )}
    >
      {display}
    </span>
  );
}

export function pretty(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
