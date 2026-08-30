"use client";

import { useEffect, useState } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export function TypewriterText({
  text,
  speed = 32,
  className,
  onComplete,
}: TypewriterTextProps) {
  const [len, setLen] = useState(0);

  useEffect(() => {
    setLen(0);
    if (!text) return;

    let i = 0;
    const tick = window.setInterval(() => {
      i += 1;
      setLen(i);
      if (i >= text.length) {
        window.clearInterval(tick);
        onComplete?.();
      }
    }, speed);

    return () => window.clearInterval(tick);
  }, [text, speed, onComplete]);

  const done = len >= text.length;

  return (
    <span className={className}>
      {text.slice(0, len)}
      {!done && (
        <span className="ml-0.5 inline-block h-[1em] w-[2px] animate-pulse bg-white/50 align-middle" />
      )}
    </span>
  );
}
