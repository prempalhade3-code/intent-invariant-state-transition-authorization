"use client";

import { motion } from "framer-motion";

export function AnimatedHeadline() {
  return (
    <motion.h1
      className="whitespace-nowrap text-center text-[clamp(24px,2.75vw,36px)] font-medium leading-[1.1] tracking-[-0.03em] text-ink"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      Authorization for autonomous agents
    </motion.h1>
  );
}
