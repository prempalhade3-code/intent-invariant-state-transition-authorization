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
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { LandingWordmark } from "@/components/landing/LandingWordmark";
import { HeroSealFeed } from "@/components/landing/HeroSealFeed";
import { createRun } from "@/lib/api";
import type { Phase } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

export default function LandingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);
  const [sealArmed, setSealArmed] = useState(false);
  const [sealStamping, setSealStamping] = useState(false);
  const busy = phase === "submitting" || launching;

  const handleAutonomous = async (prompt: string) => {
    setError(null);
    setLaunching(true);
    await new Promise((resolve) => window.setTimeout(resolve, 1500));
    setLaunching(false);
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
    <div className="min-h-screen bg-[#0A0B0D] text-[#F4F5F7]">
      <LandingNav />

      {/* Hero — exactly one viewport */}
      <section className="relative h-[100dvh] min-h-[640px] overflow-hidden bg-[#0A0B0D]">
        <HeroVisual armed={sealArmed} stamping={sealStamping} />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[900px] flex-col items-center px-5 pt-[216px] sm:px-8 sm:pt-[224px]">
          <motion.div
            className="mb-4 text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.85 }}
          >
            <RazorpayBadge />
          </motion.div>

          <AnimatedHeadline dark />

          <motion.p
            className="mx-auto mt-4 max-w-[480px] text-center text-[15px] font-normal leading-[1.45] tracking-[-0.01em] text-white/50 sm:text-[16px]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.95, ease }}
          >
            One seal for intent, merchant proof and settlement.
          </motion.p>

          <div id="try" className="mx-auto mt-9 w-full max-w-[540px] scroll-mt-28 sm:mt-10">
            <IntentComposer
              onSubmit={(prompt) => handleAutonomous(prompt)}
              onFocusChange={setSealArmed}
              onStamp={() => {
                setSealStamping(true);
                window.setTimeout(() => setSealStamping(false), 900);
              }}
              loading={busy}
              loadingLabel={
                launching ? "Launching agent" : phase === "submitting" ? "Sealing intent" : undefined
              }
              error={error}
              variant="dark"
            />
          </div>

          <HeroSealFeed armed={sealArmed} stamping={sealStamping} />
        </div>
      </section>

      <section id="how" className="scroll-mt-20 py-24 md:py-32">
        <ComparisonCards />
      </section>

      <section>
        <FlowDiagram />
      </section>

      <section>
        <FeaturePanel />
      </section>

      <section>
        <BentoLab />
      </section>

      <section>
        <LandingFAQ />
      </section>

      <LandingWordmark />
    </div>
  );
}
