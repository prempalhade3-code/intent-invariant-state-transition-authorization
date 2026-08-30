"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export function LandingWordmark() {
  return (
    <footer className="overflow-hidden">
      <motion.div
        className="flex items-end justify-center pt-20 pb-0 sm:pt-24 md:pt-28"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.8, ease }}
      >
        <span
          aria-hidden
          className="pointer-events-none select-none text-center font-sans text-[clamp(60px,6vw,245px)] font-normal lowercase leading-none tracking-[-0.03em] text-white/50"
        >
          sworn
        </span>
      </motion.div>
    </footer>
  );
}
