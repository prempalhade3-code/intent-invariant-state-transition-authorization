"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/cn";
import { DEFAULT_PROMPT } from "@/lib/api";

interface IntentComposerProps {
  onSubmit: (prompt: string) => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

const EXAMPLE_PROMPTS = [
  "Find me a basic VPS under $25 and purchase it from the approved marketplace.",
  "Get me the cheapest VPS available from the approved vendor, budget $30.",
];

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
      className={cn("w-full max-w-2xl", className)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    >
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            "relative bg-paper border rounded-[22px] transition-all duration-300",
            focused
              ? "border-accent/50 shadow-accent shadow-lg"
              : "border-border shadow-md",
            loading && "opacity-80",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-border">
            <span className="text-[10px] font-mono font-medium text-ink-faint tracking-[0.14em] uppercase">
              New authorization
            </span>
            <div className="flex items-center gap-1.5 text-xs text-ink-faint">
              <Lock className="w-3 h-3" />
              <span>Policy becomes immutable on submit</span>
            </div>
          </div>

          {/* Textarea */}
          <div className="px-6 py-5">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleSubmit(e);
                }
              }}
              placeholder="Describe your financial intent in plain language…"
              spellCheck={false}
              disabled={loading}
              className={cn(
                "w-full resize-none bg-transparent outline-none",
                "text-[18px] font-medium text-ink leading-[1.55] tracking-[-0.025em]",
                "placeholder:text-ink-faint",
                "min-h-[80px] max-h-[180px]",
                "disabled:opacity-60",
              )}
              rows={3}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-border">
            <p className="text-xs text-ink-faint leading-relaxed">
              Budget, merchant and capabilities are sealed before the agent touches the marketplace.
            </p>

            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "flex shrink-0 items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full",
                "transition-all duration-200 active:scale-[0.97]",
                canSubmit
                  ? "bg-ink text-paper hover:bg-ink/90 shadow-sm"
                  : "bg-surface text-ink-faint border border-border cursor-not-allowed",
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Starting…
                </>
              ) : (
                <>
                  Run protected transaction
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-3 px-4 py-3 bg-danger-light border border-blocked-border rounded-xl text-sm text-danger"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      <p className="mt-3 text-center text-xs text-ink-faint">
        ⌘ + Enter to execute
      </p>
    </motion.div>
  );
}
