"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AttackCard } from "./AttackCard";
import { IISTARail } from "@/components/run/IISTARail";
import { ResultBanner } from "@/components/run/ResultBanner";
import { ATTACKS } from "@/lib/api";
import type { Attack, Phase } from "@/lib/types";
import type { ViewModel } from "@/lib/reduce";

interface LabGridProps {
  onAutonomous: (prompt: string, demoEvent: string, id: string) => void;
  onScenario: (scenario: string, id: string) => void;
  activeId?: string | null;
  phase?: Phase;
  view?: ViewModel;
}

export function LabGrid({ onAutonomous, onScenario, activeId, phase, view }: LabGridProps) {
  const [lastResults, setLastResults] = useState<Record<string, "authorized" | "blocked">>({});

  // Record result when a run settles
  useEffect(() => {
    if (phase === "settled" && activeId && view) {
      const result = view.authorized === true ? "authorized" : "blocked";
      setLastResults((prev) => ({ ...prev, [activeId]: result }));
    }
  }, [phase, activeId, view?.authorized]);

  const handleRun = (attack: Attack) => {
    if (phase === "submitting" || phase === "live") return;
    if (attack.kind === "autonomous") {
      onAutonomous(attack.prompt ?? "", attack.demoEvent ?? "", attack.id);
    } else if (attack.scenario) {
      onScenario(attack.scenario, attack.id);
    }
  };

  const busy = phase === "submitting" || phase === "live";

  return (
    <div className="space-y-8">
      {/* Result banner */}
      <AnimatePresence>
        {phase === "settled" && view && (
          <ResultBanner view={view} />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ATTACKS.map((attack, i) => (
          <AttackCard
            key={attack.id}
            attack={attack}
            onRun={handleRun}
            active={activeId === attack.id && busy}
            result={
              activeId === attack.id && phase === "settled"
                ? view?.authorized === true ? "authorized" : "blocked"
                : lastResults[attack.id] ?? null
            }
            disabled={busy && activeId !== attack.id}
            index={i}
          />
        ))}
      </div>

      {/* IISTA rail for active/settled run */}
      <AnimatePresence>
        {view && phase !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card p-5 max-w-sm"
          >
            <IISTARail view={view} phase={phase ?? "idle"} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
