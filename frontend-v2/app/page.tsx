"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/shell/NavBar";
import { IntentComposer } from "@/components/landing/IntentComposer";
import { PrinciplesGrid } from "@/components/landing/PrinciplesGrid";
import { LabStrip } from "@/components/landing/LabStrip";
import { createRun } from "@/lib/api";
import type { Phase } from "@/lib/types";

export default function LandingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [activeAttack, setActiveAttack] = useState<string | null>(null);

  const busy = phase === "submitting";

  const handleAutonomous = async (prompt: string, demoEvent?: string, id?: string) => {
    setError(null);
    setActiveAttack(id ?? null);
    setPhase("submitting");
    try {
      const res = await createRun(prompt, demoEvent);
      router.push(`/run/${res.run_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start run");
      setPhase("error");
    }
  };

  const handleScenario = async (_scenario: string, id: string) => {
    setActiveAttack(id);
    router.push("/lab");
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <NavBar phase={phase} />

      <main className="flex-1 px-5 pb-16 pt-16 md:px-8 md:pt-24">
        {/* Hero */}
        <div className="mx-auto w-full max-w-[1180px]">
          <section className="grid items-end gap-12 border-b border-border pb-14 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-20">
            <div className="max-w-3xl space-y-7">
              <motion.div
                className="flex items-center gap-2 text-[10px] font-mono font-medium text-ink-faint tracking-[0.16em] uppercase"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="w-4 h-px bg-border-strong" />
                Authorization infrastructure for autonomous agents
              </motion.div>
              <motion.h1
                className="max-w-[760px] text-[58px] font-semibold leading-[0.92] tracking-[-0.075em] text-ink md:text-[78px] lg:text-[92px]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                Sworn to <span className="text-accent">execute.</span>
              </motion.h1>
              <motion.p
                className="max-w-[590px] text-[17px] text-ink-muted leading-[1.65]"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
              >
                An agent can search, choose and checkout. SWORN signs only the transaction that still matches the authority it was given.
              </motion.p>
            </div>
            <div className="lg:pb-1"><IntentComposer onSubmit={(prompt) => handleAutonomous(prompt)} loading={busy} error={error} /></div>
          </section>

          <section className="grid gap-10 py-14 lg:grid-cols-[260px_1fr] lg:gap-16">
            <div><p className="text-[10px] font-mono uppercase tracking-[0.16em] text-ink-faint">One authority. Two roles.</p><h2 className="mt-4 text-2xl font-semibold tracking-[-0.045em]">The agent proposes.<br />SWORN permits.</h2></div>
            <PrinciplesGrid />
          </section>
          <section className="border-t border-border pt-10">
            <div className="mb-5 flex items-end justify-between"><div><p className="text-[10px] font-mono uppercase tracking-[0.16em] text-ink-faint">Incident lab</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em]">Break the assumptions.</h2></div><button onClick={() => router.push("/lab")} className="hidden text-sm text-ink-muted underline underline-offset-4 sm:block">View all scenarios</button></div>
            <LabStrip onAutonomous={(prompt, demoEvent, id) => handleAutonomous(prompt, demoEvent, id)} onScenario={handleScenario} disabled={busy} activeId={activeAttack} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-5 flex flex-wrap items-center justify-between gap-4 text-xs text-ink-faint">
        <span>SWORN · Intent-Invariant State Transition Authorization</span>
        <span className="flex items-center gap-4">
          <span>Cryptographic policy</span>
          <span className="text-border-strong">·</span>
          <span>Independent DAE enclave</span>
          <span className="text-border-strong">·</span>
          <span>No real money</span>
        </span>
      </footer>
    </div>
  );
}
