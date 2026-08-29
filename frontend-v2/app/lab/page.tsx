"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";
import { LabGrid } from "@/components/lab/LabGrid";
import { useLiveRun } from "@/hooks/useLiveRun";

const reveal = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };

export default function LabPage() {
  const { phase, view, activeAttack, startAutonomous, startScenario, reset } = useLiveRun();

  const handleAutonomous = async (prompt: string, demoEvent: string, id: string) => {
    await startAutonomous(prompt, demoEvent, id, false);
  };

  const handleScenario = async (scenario: string, id: string) => {
    await startScenario(scenario, id);
  };

  const handleReset = async () => {
    await reset();
  };

  const blocked = view.authorized === false;
  const busy = phase === "submitting" || phase === "live";

  return (
    <div className="min-h-screen bg-paper text-ink">
      <LandingNav />

      <main className="mx-auto w-full max-w-[1000px] px-5 pb-24 pt-28 sm:px-8">
        <motion.div
          className="mb-14 max-w-[640px]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reveal}
        >
          <Link
            href="/"
            className="mb-6 inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint transition-colors hover:text-ink"
          >
            ← Home
          </Link>
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Incident Lab
          </p>
          <h1 className="text-[32px] font-medium leading-[1.1] tracking-[-0.045em] text-ink sm:text-[40px]">
            Break the assumptions
          </h1>
          <p className="mt-4 text-[16px] font-normal leading-[1.6] tracking-[-0.01em] text-ink-muted">
            Six hostile conditions. One invariant — payment cannot settle outside the user&apos;s word.
          </p>
        </motion.div>

        <LabGrid
          onAutonomous={handleAutonomous}
          onScenario={handleScenario}
          activeId={activeAttack}
          phase={phase}
          view={phase !== "idle" ? view : undefined}
          onReset={handleReset}
          blocked={blocked}
          busy={busy}
        />
      </main>

      <footer className="border-t border-border/60 px-6 py-10 text-center">
        <p className="font-mono text-[10px] tracking-wide text-ink-faint">Sworn</p>
      </footer>
    </div>
  );
}
