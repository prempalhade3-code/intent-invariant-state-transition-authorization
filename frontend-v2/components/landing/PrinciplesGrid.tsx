"use client";
import { motion } from "framer-motion";

const PRINCIPLES = [
  {
    number: "01",
    title: "Intent becomes policy",
    body: "The user's natural-language goal is normalized into a cryptographically-bound policy: budget ceiling, allowed merchant, permitted tools, approved domains. The agent receives the policy. It cannot modify it.",
  },
  {
    number: "02",
    title: "The agent navigates freely",
    body: "Search, inspect, add to cart, create checkout, read invoice. SWORN observes every action but never controls the agent's decisions. The agent operates with real autonomy inside a real commerce environment.",
  },
  {
    number: "03",
    title: "Only proof unlocks payment",
    body: "The DAE independently verifies the full execution path, merchant proof, live oracle price, and hash chain before signing. If anything has drifted from the authorized state, payment doesn't happen.",
  },
];

export function PrinciplesGrid() {
  return (
    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
      {PRINCIPLES.map((p, i) => (
        <motion.div
          key={p.number}
          className="bg-paper px-6 py-7 flex flex-col gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.08 }}
        >
          <span className="text-2xs font-bold tracking-widest text-accent uppercase">
            {p.number}
          </span>
          <h3 className="text-base font-semibold text-ink leading-snug">
            {p.title}
          </h3>
          <p className="text-sm text-ink-muted leading-relaxed">
            {p.body}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
