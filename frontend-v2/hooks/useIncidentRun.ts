"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createRun,
  getEvents,
  getRun,
  runScenario,
  startRun,
} from "@/lib/api";
import type { IncidentDef } from "@/lib/incidents";
import { emptyView, reduceEvents, viewFromScenario, type ViewModel } from "@/lib/reduce";

export type IncidentPhase = "idle" | "running" | "settled" | "error";

export function useIncidentRun() {
  const [phase, setPhase] = useState<IncidentPhase>("idle");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<ViewModel>(emptyView());
  const [error, setError] = useState<string | null>(null);

  const seq = useRef(0);
  const runId = useRef<string | null>(null);
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
      const merged = [...prev.events];
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
          const record = await ingest(id);
          if (
            record.status === "completed" ||
            record.status === "blocked" ||
            record.status === "error" ||
            record.status === "cancelled"
          ) {
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
      timer.current = setInterval(tick, 400);
    },
    [ingest, stop],
  );

  const run = useCallback(
    async (incident: IncidentDef) => {
      stop();
      seq.current = 0;
      runId.current = null;
      setError(null);
      setActiveId(incident.id);
      setView(emptyView());
      setPhase("running");

      try {
        if (incident.kind === "autonomous") {
          const created = await createRun(incident.prompt ?? "", incident.demoEvent);
          runId.current = created.run_id;
          setView(reduceEvents([], { run_id: created.run_id, status: created.status, policy: created.intent }));
          await startRun(created.run_id);
          poll(created.run_id);
        } else if (incident.scenario) {
          const result = await runScenario(incident.scenario);
          setView(viewFromScenario(result, incident.scenario));
          setPhase("settled");
        }
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Incident failed");
        setPhase("error");
      }
    },
    [poll, stop],
  );

  const reset = useCallback(() => {
    stop();
    runId.current = null;
    seq.current = 0;
    setActiveId(null);
    setError(null);
    setView(emptyView());
    setPhase("idle");
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  return { phase, activeId, view, error, run, reset };
}
