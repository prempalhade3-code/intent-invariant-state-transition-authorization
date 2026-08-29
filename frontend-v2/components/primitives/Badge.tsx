"use client";
import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "success" | "danger" | "warning" | "accent" | "muted" | "outline";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface text-ink-muted border border-border",
  success: "bg-success-light text-success border border-authorized-border",
  danger: "bg-danger-light text-danger border border-blocked-border",
  warning: "bg-warning-light text-warning border border-warning/20",
  accent: "bg-accent-light text-accent border border-accent/20",
  muted: "bg-surface text-ink-faint border border-border",
  outline: "bg-transparent text-ink border border-border",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "text-2xs px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1.5",
};

export function Badge({
  children,
  variant = "default",
  size = "sm",
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full whitespace-nowrap",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0",
            variant === "success" && "bg-success",
            variant === "danger" && "bg-danger",
            variant === "warning" && "bg-warning",
            variant === "accent" && "bg-accent",
            variant === "muted" && "bg-ink-faint",
            variant === "default" && "bg-ink-muted",
            variant === "outline" && "bg-ink-muted",
          )}
        />
      )}
      {children}
    </span>
  );
}
