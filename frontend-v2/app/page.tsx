"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { LandingNav } from "@/components/landing/LandingNav";
import { HeroVisual } from "@/components/landing/HeroVisual";
import { RazorpayBadge } from "@/components/landing/RazorpayBadge";
import { AnimatedHeadline } from "@/components/landing/AnimatedHeadline";
import { IntentComposer } from "@/components/landing/IntentComposer";
import { ComparisonCards } from "@/components/landing/ComparisonCards";
import { FlowDiagram } from "@/components/landing/FlowDiagram";
import { FeaturePanel } from "@/components/landing/FeaturePanel";
import { BentoLab } from "@/components/landing/BentoLab";
import { createRun } from "@/lib/api";
import type { Phase } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

export default function LandingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const busy = phase === "submitting";

  const handleAutonomous = async (prompt: string) => {
    setError(null);
    setPhase("submitting");
    try {
      const res = await createRun(prompt);
      router.push(`/run/${res.run_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start run");
      setPhase("error");
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      <LandingNav />

      {/* Hero — exactly one viewport */}
      <section className="relative h-[100dvh] min-h-[640px] max-h-[900px] overflow-hidden">
        <HeroVisual />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[900px] flex-col items-center px-5 pt-[168px] sm:px-8 sm:pt-[176px]">
          <motion.div
            className="mb-4 text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <RazorpayBadge />
          </motion.div>

          <AnimatedHeadline />

          <motion.p
            className="mx-auto mt-4 max-w-[480px] text-center text-[15px] font-normal leading-[1.45] tracking-[-0.01em] text-[#737373] sm:text-[16px]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease }}
          >
            One seal for intent, merchant proof and settlement.
          </motion.p>

          <div id="try" className="mx-auto mt-9 w-full max-w-[540px] scroll-mt-28 sm:mt-10">
            <IntentComposer
              onSubmit={(prompt) => handleAutonomous(prompt)}
              loading={busy}
              error={error}
            />
          </div>
        </div>
      </section>

      <section id="how" className="scroll-mt-20 bg-paper py-24 md:py-32">
        <ComparisonCards />
      </section>

      <section className="bg-[#FAFAF9]">
        <FlowDiagram />
      </section>

      <section className="bg-paper">
        <FeaturePanel />
      </section>

      <section className="bg-paper pb-32">
        <BentoLab />
      </section>

      <footer className="border-t border-border/60 px-6 py-10 text-center">
        <p className="font-mono text-[10px] tracking-wide text-ink-faint">Sworn</p>
      </footer>
    </div>
  );
}
