"use client";
import { useEffect, useRef, useState } from "react";

export function useAnimatedCounter(target: number, duration = 400) {
  const [current, setCurrent] = useState(target);
  const prev = useRef(target);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (target === prev.current) return;
    const start = prev.current;
    const diff = target - start;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      setCurrent(Math.round(start + diff * ease));
      if (progress < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        prev.current = target;
      }
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration]);

  return current;
}

export function useCountUp(value: number, decimals = 0) {
  const animated = useAnimatedCounter(Math.round(value * 10 ** decimals), 600);
  return (animated / 10 ** decimals).toFixed(decimals);
}
