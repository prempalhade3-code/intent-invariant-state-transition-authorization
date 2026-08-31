"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const AGENTS = ["Claude", "GPT", "Gemini", "Custom"];

const OUTPUTS = ["Sealed intent", "Merchant proof", "Oracle price", "Independent signature", "Blocked state"];

export function FlowDiagram() {
  return (
    <motion.section
      className="mx-auto w-full max-w-[960px] px-4 py-16 sm:px-8 sm:py-24"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease }}
    >
      <div className="mb-14 text-center">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
          Architecture
        </p>
        <h2 className="text-[26px] font-medium leading-[1.15] tracking-[-0.04em] text-[#F4F5F7] sm:text-[32px]">
          One layer between agent action
          <br />
          and money movement
        </h2>
      </div>

      <div className="relative flex flex-col items-center gap-6 md:flex-row md:items-stretch md:justify-center md:gap-0">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease }}
          className="w-full max-w-[200px] rounded-[18px] border border-white/[0.08] bg-[#12141a] p-4"
        >
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
            AI agents
          </p>
          <div className="grid grid-cols-2 gap-2">
            {AGENTS.map((a) => (
              <div
                key={a}
                className="rounded-lg border border-white/[0.08] bg-[#161820] px-2 py-2 text-center text-[11px] font-medium text-white/50"
              >
                {a}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="flex items-center px-3 md:px-5">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease }}
            className="flex origin-left flex-col items-center gap-1"
          >
            <span className="font-mono text-[10px] text-white/35">asks</span>
            <div className="h-px w-12 bg-white/[0.08] md:w-16" />
            <span className="text-white/35">→</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.15, ease }}
          className="rounded-[18px] border border-[#10B981]/30 bg-[#10B981]/10 px-6 py-5 shadow-[0_0_32px_rgba(16,185,129,0.08)]"
        >
          <p className="text-[15px] font-semibold tracking-[-0.02em] text-[#F4F5F7]">Sworn</p>
          <p className="mt-0.5 font-mono text-[10px] font-normal text-[#10B981]/70">
            DAE · intent seal · MCP
          </p>
        </motion.div>

        <div className="flex items-center px-3 md:px-5">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35, ease }}
            className="flex origin-left flex-col items-center gap-1"
          >
            <span className="font-mono text-[10px] text-white/35">verifies</span>
            <div className="h-px w-12 bg-white/[0.08] md:w-16" />
            <span className="text-white/35">→</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.25, ease }}
          className="w-full max-w-[240px] rounded-[18px] border border-white/[0.08] bg-[#12141a] p-4"
        >
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
            What you get
          </p>
          <div className="flex flex-wrap gap-1.5">
            {OUTPUTS.map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-full border border-white/[0.08] bg-[#161820] px-2.5 py-1 font-mono text-[9px] text-white/45"
              >
                {label}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 text-center font-mono text-[10px] tracking-wide text-white/35"
      >
        Field requests · queued builds · independent commit
      </motion.p>
    </motion.section>
  );
}
