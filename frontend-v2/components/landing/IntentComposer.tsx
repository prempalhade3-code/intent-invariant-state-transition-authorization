"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { DEFAULT_PROMPT } from "@/lib/api";

interface IntentComposerProps {
  onSubmit: (prompt: string) => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export function IntentComposer({
  onSubmit,
  loading,
  error,
  className,
}: IntentComposerProps) {
  const [value, setValue] = useState(DEFAULT_PROMPT);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
  };

  const canSubmit = value.trim().length > 0 && !loading;

  return (
    <motion.div
      className={cn("w-full mx-auto", className)}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
    >
      <form onSubmit={handleSubmit} className="relative">
        <motion.div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          animate={{
            borderColor: focused ? "#C8C5BF" : hovered ? "#E2E0DC" : "#E8E8E6",
            boxShadow: focused
              ? "0 2px 12px rgba(10,10,10,0.06)"
              : hovered
                ? "0 1px 6px rgba(10,10,10,0.04)"
                : "0 0 0 rgba(10,10,10,0)",
          }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "relative overflow-hidden rounded-[20px] border bg-paper",
            loading && "opacity-80",
          )}
        >
          <div className="px-5 py-4 pb-[56px] sm:px-6 sm:py-5">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Find me a basic VPS under $25..."
              spellCheck={false}
              disabled={loading}
              className={cn(
                "w-full resize-none bg-transparent outline-none",
                "text-[15px] sm:text-[16px] text-ink leading-[1.5] tracking-[-0.02em]",
                "placeholder:text-ink-faint",
                "min-h-[52px]",
                "disabled:opacity-60",
              )}
              rows={2}
            />
          </div>

          <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-end">
            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium",
                "transition-all duration-200",
                canSubmit
                  ? "bg-ink text-paper hover:bg-ink/90 active:scale-[0.97]"
                  : "bg-surface text-ink-faint cursor-not-allowed",
              )}
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Send"}
            </button>
          </div>
        </motion.div>
      </form>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-3 rounded-xl border border-blocked-border bg-danger-light px-4 py-3 text-center text-sm text-danger"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
