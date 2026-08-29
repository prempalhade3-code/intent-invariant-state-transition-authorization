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
      className={cn("relative z-10 w-full mx-auto", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
    >
      <form onSubmit={handleSubmit} className="relative">
        <motion.div
          animate={{
            boxShadow: focused
              ? "0 8px 32px rgba(10,10,10,0.08), 0 0 0 1px rgba(10,10,10,0.12)"
              : "0 2px 16px rgba(10,10,10,0.04)",
          }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "relative overflow-hidden rounded-[22px] border border-border bg-paper",
            loading && "opacity-80",
          )}
        >
          <div className="px-5 py-4 pb-[52px] sm:px-6">
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
                "text-[15px] sm:text-[16px] text-ink leading-[1.55] tracking-[-0.02em]",
                "placeholder:text-ink-faint",
                "min-h-[48px]",
                "disabled:opacity-60",
              )}
              rows={2}
            />
          </div>

          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between px-1">
            <span className="hidden font-mono text-[10px] tracking-wide text-ink-faint sm:inline">
              sealed on send
            </span>
            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "ml-auto flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-medium",
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
            className="mt-3 rounded-xl border border-border bg-surface px-4 py-3 text-center text-sm font-medium text-ink"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
