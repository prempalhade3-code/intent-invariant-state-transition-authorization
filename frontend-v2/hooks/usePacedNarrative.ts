"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ViewModel } from "@/lib/reduce";
import type { Phase, StoreSnapshot } from "@/lib/types";
import {
  CHAPTER_SEQUENCE,
  computeTargetIndex,
  type ChapterId,
} from "@/lib/narrative";

export function usePacedNarrative(
  view: ViewModel,
  store: StoreSnapshot,
  phase: Phase,
) {
  const [displayIndex, setDisplayIndex] = useState(0);
  const [resultReady, setResultReady] = useState(false);
  const enteredAt = useRef(Date.now());
  const targetIndex = computeTargetIndex(view, store, phase);
  const blocked = view.authorized === false;
  const resultIndex = CHAPTER_SEQUENCE.findIndex((c) => c.id === "result");

  const resetTimer = useCallback(() => {
    enteredAt.current = Date.now();
  }, []);

  // Always replay from the beginning on mount / run change (decision #3 not implemented)
  useEffect(() => {
    setDisplayIndex(0);
    setResultReady(false);
    resetTimer();
  }, [view.runId, resetTimer]);

  useEffect(() => {
    if (blocked || phase !== "settled" || displayIndex < resultIndex) {
      setResultReady(false);
      return;
    }
    const dwell = CHAPTER_SEQUENCE[resultIndex]?.minDwell ?? 4000;
    const timer = window.setTimeout(() => setResultReady(true), dwell);
    return () => window.clearTimeout(timer);
  }, [blocked, displayIndex, phase, resultIndex, view.runId]);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setDisplayIndex((current) => {
        if (current >= targetIndex) return current;

        const chapter = CHAPTER_SEQUENCE[current];
        if (!chapter) return current;

        const elapsed = Date.now() - enteredAt.current;
        if (elapsed >= chapter.minDwell) {
          enteredAt.current = Date.now();
          return current + 1;
        }
        return current;
      });
    }, 80);

    return () => window.clearInterval(tick);
  }, [targetIndex]);

  // After blocked verify, jump to blocked virtual state handled by displayIndex cap
  const effectiveIndex = blocked && displayIndex >= CHAPTER_SEQUENCE.findIndex((c) => c.id === "verify")
    ? Math.min(displayIndex, CHAPTER_SEQUENCE.findIndex((c) => c.id === "verify"))
    : displayIndex;

  const activeChapter = CHAPTER_SEQUENCE[effectiveIndex]?.id ?? "intent";
  const isComplete =
    phase === "settled" &&
    effectiveIndex >= targetIndex &&
    (blocked ? view.authorized === false : activeChapter === "result" && resultReady);

  return {
    displayIndex: effectiveIndex,
    activeChapter: activeChapter as ChapterId,
    targetIndex,
    blocked,
    isComplete,
    chapters: CHAPTER_SEQUENCE,
  };
}
