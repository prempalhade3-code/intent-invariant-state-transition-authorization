import { useCallback, useEffect, useRef, useState } from "react";
import { createRun, getEvents, getRun, resetRun, runScenario } from "../lib/api";
import { DEFAULT_PROMPT } from "../lib/copy";
import { emptyView, reduceEvents, viewFromScenario, type ViewModel } from "../lib/reduce";
import type { RunEvent, RunRecord } from "../lib/types";

type Phase = "idle" | "submitting" | "live" | "settled" | "error";

export function useLiveRun() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [submittedPrompt, setSubmittedPrompt] = useState<string | null>(null);
  const [view, setView] = useState<ViewModel>(emptyView);
  const [error, setError] = useState<string | null>(null);
  const [activeAttack, setActiveAttack] = useState<string | null>(null);
  const seq = useRef(0);
  const runId = useRef<string | null>(null);
  const timer = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timer.current) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const ingest = useCallback(async (id: string) => {
    const [record, stream] = await Promise.all([getRun(id), getEvents(id, seq.current)]);
    if (stream.events.length) {
      seq.current = Math.max(seq.current, ...stream.events.map((e) => e.sequence));
    }
    setView((prev) => {
      const merged: RunEvent[] = [...prev.events];
      for (const event of stream.events) {
        if (!merged.some((e) => e.sequence === event.sequence && e.event_type === event.event_type)) {
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
          if (record.status === "completed" || record.status === "blocked" || record.status === "error") {
            stop();
            setPhase("settled");
          }
        } catch (cause) {
          stop();
          setError(cause instanceof Error ? cause.message : "Event stream failed");
          setPhase("error");
        }
      };
      void tick();
      timer.current = window.setInterval(tick, 280);
    },
    [ingest, stop],
  );

  const startAutonomous = useCallback(
    async (nextPrompt: string, demoEvent?: string, attackId?: string) => {
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
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not start run");
        setPhase("error");
      }
    },
    [poll, stop],
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
        setError(cause instanceof Error ? cause.message : "Scenario failed");
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
        /* reset is best-effort */
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
    startAutonomous,
    startScenario,
    reset,
  };
}
