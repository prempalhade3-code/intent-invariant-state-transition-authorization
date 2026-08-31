"use client";

import { useCallback, useState } from "react";
import { LayoutGroup, motion, AnimatePresence } from "framer-motion";
import { IncidentCard } from "./IncidentCard";
import { IncidentStage } from "./IncidentStage";
import { INCIDENTS, getIncident } from "@/lib/incidents";
import { useIncidentRun } from "@/hooks/useIncidentRun";

export function IncidentGrid() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, "blocked">>({});
  const { phase, activeId, view, run, reset } = useIncidentRun();

  const openIncident = openId ? getIncident(openId) : null;
  const busy = phase === "running";

  const handleRun = useCallback((id: string) => {
    if (busy) return;
    const incident = getIncident(id);
    if (!incident) return;
    setOpenId(id);
    void run(incident);
  }, [busy, run]);

  const handleClose = useCallback(() => {
    if (busy) return;
    if (activeId && phase === "settled") {
      setResults((prev) => ({ ...prev, [activeId]: "blocked" }));
    }
    setOpenId(null);
    reset();
  }, [activeId, busy, phase, reset]);

  const handleReplay = useCallback(() => {
    if (!openIncident) return;
    reset();
    requestAnimationFrame(() => void run(openIncident));
  }, [openIncident, reset, run]);

  return (
    <LayoutGroup id="incident-lab">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
        {INCIDENTS.map((incident, i) =>
          openId === incident.id ? (
            <div key={incident.id} className="invisible min-h-[280px] sm:min-h-[300px]" aria-hidden />
          ) : (
            <IncidentCard
              key={incident.id}
              incident={incident}
              layoutId={`incident-${incident.id}`}
              onRun={() => handleRun(incident.id)}
              disabled={!!openId}
              result={results[incident.id] ?? null}
              index={i}
            />
          ),
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {openId && openIncident && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-[#0A0B0D]/80 backdrop-blur-md"
              onClick={busy ? undefined : handleClose}
            />
            <IncidentStage
              incident={openIncident}
              layoutId={`incident-${openId}`}
              phase={phase}
              view={view}
              onReplay={handleReplay}
              onClose={handleClose}
            />
          </>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
