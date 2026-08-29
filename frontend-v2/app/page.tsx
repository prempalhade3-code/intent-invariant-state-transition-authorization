"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/shell/NavBar";
import { AnimatedHeadline } from "@/components/landing/AnimatedHeadline";
import { IntentComposer } from "@/components/landing/IntentComposer";
import { createRun } from "@/lib/api";
import type { Phase } from "@/lib/types";

const reveal = { duration: 0.52, ease: [0.22, 1, 0.36, 1] as const };

const QUICK_PROMPTS = [
  "VPS under $25",
  "approved marketplace",
  "sealed on send",
];

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
    <div className="flex min-h-screen flex-col bg-paper">
      <NavBar phase={phase} />

      <main className="flex-1 px-5 pb-20 pt-[108px] sm:px-8 md:pt-[120px]">
        <section className="mx-auto flex w-full max-w-[680px] flex-col items-center text-center">
          <motion.p
            className="mb-5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reveal}
          >
            Authorization infrastructure
          </motion.p>

          <motion.div
            className="mb-9 w-full"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...reveal, delay: 0.06 }}
          >
            <AnimatedHeadline />
          </motion.div>

          <div className="w-full">
            <IntentComposer
              onSubmit={(prompt) => handleAutonomous(prompt)}
              loading={busy}
              error={error}
            />
          </div>

          <motion.div
            className="mt-5 flex flex-wrap justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.28 }}
          >
            {QUICK_PROMPTS.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-3 py-1.5 font-mono text-[10px] tracking-wide text-ink-faint"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </section>

        <motion.section
          className="mx-auto mt-28 w-full max-w-[680px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...reveal, delay: 0.35 }}
        >
          <Link
            href="/lab"
            className="group flex items-center justify-between py-4 transition-colors hover:text-accent"
          >
            <div className="text-left">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                Incident Lab
              </p>
              <p className="text-[15px] font-medium tracking-[-0.02em] text-ink transition-colors group-hover:text-accent">
                Six hostile conditions, one invariant
              </p>
            </div>
            <span
              aria-hidden
              className="text-[15px] text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-accent"
            >
              →
            </span>
          </Link>
        </motion.section>
      </main>

      <footer className="px-6 py-8 text-center font-mono text-[10px] tracking-wide text-ink-faint">
        Sworn
      </footer>
    </div>
  );
}
