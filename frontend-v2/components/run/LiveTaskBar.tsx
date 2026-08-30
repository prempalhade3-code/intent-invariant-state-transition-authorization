"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface LiveTaskBarProps {
  prompt: string | null;
  live?: boolean;
}

export function LiveTaskBar({ prompt, live }: LiveTaskBarProps) {
  const text = prompt ?? "Running authorized transaction";
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    };
  }, []);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <div className="flex w-full items-center gap-3">
      <p className="min-w-0 flex-1 truncate font-mono text-[13px] leading-none text-white/55">
        {live && (
          <>
            <span className="text-white/80">●</span>{" "}
            <span className="uppercase tracking-wide text-white/45">Live</span>{" "}
          </>
        )}
        <span className="uppercase tracking-wide text-white/35">Intent</span>{" "}
        <span className="text-white/65">{text}</span>
      </p>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 font-mono text-[12px] text-white/25 transition-colors hover:text-white/50"
      >
        {copied ? "Copied" : "Copy task"}
      </button>
    </div>
  );
}
