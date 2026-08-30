"use client";

import { useEffect, useRef, useState } from "react";

export function useElapsedTimer(active: boolean) {
  const [seconds, setSeconds] = useState(0);
  const started = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    started.current = Date.now();
    setSeconds(0);
    const tick = window.setInterval(() => {
      if (started.current) {
        setSeconds(Math.floor((Date.now() - started.current) / 1000));
      }
    }, 250);
    return () => window.clearInterval(tick);
  }, [active]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const label = `${mins}:${secs.toString().padStart(2, "0")}`;

  return { seconds, label };
}
