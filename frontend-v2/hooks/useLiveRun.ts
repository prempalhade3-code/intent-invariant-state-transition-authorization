"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createRun,
  getEvents,
  getRun,
  resetRun,
  runScenario,
  DEFAULT_PROMPT,
} from "@/lib/api";
import { emptyView, reduceEvents, viewFromScenario, type ViewModel } from "@/lib/reduce";
import type { Phase, RunEvent, RunRecord } from "@/lib/types";

export function useLiveRun(initialRunId?: string) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [submittedPrompt, setSubmittedPrompt] = useState<string | null>(null);
  const [view, setView] = useState<ViewModel>(emptyView);
  const [error, setError] = useState<string | null>(null);
  const [activeAttack, setActiveAttack] = useState<string | null>(null);
  const seq = useRef(0);
  const runId = useRef<string | null>(initialRunId ?? null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const ingest = useCallback(async (id: string) => {
    const [record, stream] = await Promise.all([
      getRun(id),
      getEvents(id, seq.current),
    ]);
    if (stream.events.length) {
      seq.current = Math.max(seq.current, ...stream.events.map((e) => e.sequence));
    }
    setView((prev) => {
      const merged: RunEvent[] = [...prev.events];
      for (const event of stream.events) {
        if (
          !merged.some(
            (e) =>
              e.sequence === event.sequence &&
              e.event_type === event.event_type,
          )
        ) {
          merged.push(event);
        }
      }
      return reduceEvents(merged, record);
    });
    return record;
  }, []);

  const poll = useCallback(
    (id: string) => {
      stop();
      const tick = async () => {
        try {
          const record: RunRecord = await ingest(id);
          if (
            record.status === "completed" ||
            record.status === "blocked" ||
            record.status === "error"
          ) {
            stop();
            setPhase("settled");
          }
        } catch (cause) {
          stop();
          setError(
            cause instanceof Error ? cause.message : "Event stream failed",
          );
          setPhase("error");
        }
      };
      void tick();
      // 280ms polling — fast enough to feel live, light enough to stay stable
      timer.current = setInterval(tick, 280);
    },
    [ingest, stop],
  );

  // If a runId was provided (via URL), start polling immediately
  useEffect(() => {
    if (initialRunId && phase === "idle") {
      runId.current = initialRunId;
      setPhase("live");
      poll(initialRunId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRunId]);

  const startAutonomous = useCallback(
    async (
      nextPrompt: string,
      demoEvent?: string,
      attackId?: string,
      navigate = true,
    ) => {
      stop();
      seq.current = 0;
      setError(null);
      setView(emptyView());
      setActiveAttack(attackId ?? null);
      setSubmittedPrompt(nextPrompt);
      setPhase("submitting");
      try {
        const created = await createRun(nextPrompt, demoEvent);
        runId.current = created.run_id;
        setView(
          reduceEvents([], {
            run_id: created.run_id,
            status: created.status,
            policy: created.intent,
          }),
        );
        setPhase("live");
        poll(created.run_id);
        if (navigate) {
          router.push(`/run/${created.run_id}`);
        }
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : "Could not start run",
        );
        setPhase("error");
      }
    },
    [poll, router, stop],
  );

  const startScenario = useCallback(
    async (scenario: string, attackId: string) => {
      stop();
      seq.current = 0;
      runId.current = null;
      setError(null);
      setActiveAttack(attackId);
      setPhase("submitting");
      setView(emptyView());
      try {
        const result = await runScenario(scenario);
        setView(viewFromScenario(result, scenario));
        setPhase("settled");
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : "Scenario failed",
        );
        setPhase("error");
      }
    },
    [stop],
  );

  const reset = useCallback(async () => {
    stop();
    if (runId.current) {
      try {
        await resetRun(runId.current);
      } catch {
        // reset is best-effort
      }
    }
    runId.current = null;
    seq.current = 0;
    setActiveAttack(null);
    setSubmittedPrompt(null);
    setError(null);
    setView(emptyView());
    setPhase("idle");
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  return {
    phase,
    prompt,
    setPrompt,
    submittedPrompt,
    view,
    error,
    activeAttack,
    runId: runId.current,
    startAutonomous,
    startScenario,
    reset,
  };
}
