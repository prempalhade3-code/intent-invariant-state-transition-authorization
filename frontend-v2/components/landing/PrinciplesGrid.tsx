"use client";
import { motion } from "framer-motion";

const PRINCIPLES = [
  {
    number: "01",
    title: "A limit that can be bypassed will be.",
    body: "The user's goal is sealed into a cryptographic policy before execution begins. The agent receives the rules; it cannot modify them.",
  },
  {
    number: "02",
    title: "Autonomy requires freedom.",
    body: "The agent searches, inspects, and builds the cart independently. We observe the execution path but never control the decisions.",
  },
  {
    number: "03",
    title: "Only proof unlocks payment.",
    body: "The enclave verifies the execution path, merchant proof, and live oracle price against the policy. If any invariant drifts, payment fails.",
  },
];

export function PrinciplesGrid() {
  return (
    <div className="w-full mt-12 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
      {PRINCIPLES.map((p, i) => (
        <motion.div
          key={p.number}
          className="flex flex-col gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.08 }}
        >
          <span className="font-mono text-[11px] text-ink-faint tracking-widest mb-1">
            {p.number}
          </span>
          <h3 className="text-[17px] font-medium text-ink leading-[1.4] tracking-tight">
            {p.title}
          </h3>
          <p className="text-[15px] text-ink-muted leading-[1.6]">
            {p.body}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
