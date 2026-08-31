"use client";

import { motion } from "framer-motion";
import { LandingNav } from "@/components/landing/LandingNav";
import { IncidentGrid } from "@/components/lab/IncidentGrid";

const reveal = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };

export default function LabPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#F4F5F7]">
      <LandingNav />

      <main className="mx-auto w-full max-w-[1280px] px-4 pb-20 pt-[calc(3.5rem+env(safe-area-inset-top))] sm:px-8 sm:pb-20 lg:px-10">
        <motion.div
          className="mb-10 max-w-[720px]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reveal}
        >
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
            Incident Lab
          </p>
          <h1 className="text-[32px] font-medium leading-[1.08] tracking-[-0.045em] text-[#F4F5F7] sm:text-[44px]">
            Break the agent.
            <br />
            The money won&apos;t move.
          </h1>
          <p className="mt-4 max-w-[580px] text-[16px] font-normal leading-[1.65] tracking-[-0.01em] text-white/50">
            Six live attacks against an autonomous purchasing agent. In every one, Sworn lets the agent act and refuses to let the action become a real transaction.
          </p>
        </motion.div>

        <IncidentGrid />
      </main>
    </div>
  );
}
