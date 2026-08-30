"use client";

import { motion } from "framer-motion";

export function HandoffSweep() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
    >
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-y-0 left-0 w-1/2 origin-left bg-gradient-to-r from-transparent via-[#10B981]/10 to-transparent"
      />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative rounded-full border border-[#10B981]/30 bg-[#0A0B0D]/90 px-5 py-2.5 backdrop-blur-md"
      >
        <p className="text-center text-[13px] text-white/70">
          Agent finished shopping.{" "}
          <span className="text-[#10B981]">SWORN takes over.</span>
        </p>
      </motion.div>
    </motion.div>
  );
}
