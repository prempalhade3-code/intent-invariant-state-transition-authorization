"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export function HandoffBeat() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative py-10 sm:py-12"
    >
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div className="relative flex flex-col items-center gap-3 text-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.1] bg-[#0A0B0D]">
          <ArrowDown className="h-3.5 w-3.5 text-white/40" />
        </div>
        <p className="max-w-sm text-[14px] leading-relaxed text-white/45">
          Agent finished shopping.{" "}
          <span className="text-white/70">SWORN now checks the transaction.</span>
        </p>
      </div>
    </motion.div>
  );
}
