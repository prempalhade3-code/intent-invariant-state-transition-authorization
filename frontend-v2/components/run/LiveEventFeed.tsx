"use client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { eventNarrative, labelSource, sourceColor, isSignificantEvent } from "@/lib/events";
import { HashChip } from "@/components/primitives/HashChip";
import type { RunEvent } from "@/lib/types";

interface LiveEventFeedProps {
  events: RunEvent[];
  maxItems?: number;
  className?: string;
}

export function LiveEventFeed({ events, maxItems = 20, className }: LiveEventFeedProps) {
  const sorted = [...events].sort((a, b) => a.sequence - b.sequence);
  const recent = sorted.slice(-maxItems).reverse(); // newest first

  if (!recent.length) {
    return (
      <div className={cn("py-3 text-center", className)}>
        <p className="text-xs text-ink-faint">
          Events will appear here as the agent works
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-0", className)}>
      <AnimatePresence initial={false}>
        {recent.map((event) => {
          const significant = isSignificantEvent(event);
          const narrative = eventNarrative(event);
          const source = labelSource(event.source ?? "");
          const hash = event.event_hash;

          return (
            <motion.div
              key={`${event.run_id}-${event.sequence}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "flex items-start gap-2.5 py-1.5 border-b border-border last:border-0",
                significant && "opacity-100",
                !significant && "opacity-70",
              )}
            >
              {/* Sequence number */}
              <span className="text-2xs font-mono text-ink-faint w-5 flex-shrink-0 pt-0.5 text-right">
                {event.sequence}
              </span>

              {/* Source dot */}
              <div className="pt-1.5 flex-shrink-0">
                <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", {
                  "bg-accent": event.source === "agent",
                  "bg-warning": event.source === "browser" || event.source === "store",
                  "bg-accent-dark": event.source === "dae",
                  "bg-ink-faint": event.source === "gateway",
                })} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-xs leading-snug",
                    significant ? "text-ink font-medium" : "text-ink-muted",
                  )}
                >
                  {narrative}
                </p>
                {hash && (
                  <HashChip value={hash} className="mt-0.5" />
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
