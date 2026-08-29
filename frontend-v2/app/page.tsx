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

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24">
        {/* Hero */}
        <div className="w-full max-w-5xl flex flex-col items-center gap-12">

          {/* Eyebrow */}
          <motion.div
            className="flex items-center gap-2 text-xs font-semibold text-ink-faint tracking-widest uppercase"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="w-4 h-px bg-border-strong" />
            Razorpay Buildathon 2026
            <span className="w-4 h-px bg-border-strong" />
          </motion.div>

          {/* Headline */}
          <div className="text-center space-y-3 max-w-3xl">
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-sans font-semibold text-ink leading-none tracking-tight"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              The agent acts.{" "}
              <span className="font-display italic font-semibold text-accent">
                IISTA
              </span>{" "}
              decides what moves.
            </motion.h1>

            <motion.p
              className="text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
            >
              Give an autonomous agent a financial goal. IISTA binds it to a policy,
              observes every action, and signs only the transaction that still matches
              your original authorization.
            </motion.p>
          </div>

          {/* Intent form */}
          <IntentComposer
            onSubmit={(prompt) => handleAutonomous(prompt)}
            loading={busy}
            error={error}
          />

          {/* Attack strip */}
          <LabStrip
            onAutonomous={(prompt, demoEvent, id) => handleAutonomous(prompt, demoEvent, id)}
            onScenario={handleScenario}
            disabled={busy}
            activeId={activeAttack}
          />

          {/* Principles */}
          <div className="w-full flex flex-col items-center gap-6">
            <p className="text-xs font-semibold text-ink-faint tracking-widest uppercase">
              How it works
            </p>
            <PrinciplesGrid />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-5 flex flex-wrap items-center justify-between gap-4 text-xs text-ink-faint">
        <span>IISTA · Intent-invariant state transition authorization</span>
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
