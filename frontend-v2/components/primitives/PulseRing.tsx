"use client";
import { cn } from "@/lib/cn";

interface PulseRingProps {
  active?: boolean;
  variant?: "accent" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PulseRing({
  active = true,
  variant = "accent",
  size = "md",
  className,
}: PulseRingProps) {
  if (!active) return null;

  const colorMap = {
    accent: "bg-accent",
    danger: "bg-danger",
    success: "bg-success",
  };

  const sizeMap = {
    sm: { outer: "w-3 h-3", inner: "w-1.5 h-1.5" },
    md: { outer: "w-4 h-4", inner: "w-2 h-2" },
    lg: { outer: "w-5 h-5", inner: "w-2.5 h-2.5" },
  };

  return (
    <span className={cn("relative inline-flex", sizeMap[size].outer, className)}>
      <span
        className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-30",
          colorMap[variant],
        )}
      />
      <span
        className={cn(
          "relative inline-flex rounded-full m-auto",
          sizeMap[size].inner,
          colorMap[variant],
        )}
      />
    </span>
  );
}
