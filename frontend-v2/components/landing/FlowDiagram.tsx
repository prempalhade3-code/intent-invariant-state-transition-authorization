"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const AGENTS = ["Claude", "GPT", "Gemini", "Custom"];

const OUTPUTS = ["Sealed intent", "Merchant proof", "Oracle price", "Independent signature", "Blocked state"];

export function FlowDiagram() {
  return (
    <motion.section
      className="mx-auto w-full max-w-[960px] px-5 py-24 sm:px-8"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease }}
    >
      <div className="mb-14 text-center">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          Architecture
        </p>
        <h2 className="text-[26px] font-medium leading-[1.15] tracking-[-0.04em] text-ink sm:text-[32px]">
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
          className="w-full max-w-[200px] rounded-[18px] border border-border bg-paper p-4"
        >
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            AI agents
          </p>
          <div className="grid grid-cols-2 gap-2">
            {AGENTS.map((a) => (
              <div
                key={a}
                className="rounded-lg border border-border bg-surface px-2 py-2 text-center text-[11px] font-medium text-ink-muted"
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
            className="flex flex-col items-center gap-1 origin-left"
          >
            <span className="font-mono text-[10px] text-ink-faint">asks</span>
            <div className="h-px w-12 bg-border md:w-16" />
            <span className="text-ink-faint">→</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.15, ease }}
          className="rounded-[18px] bg-ink px-6 py-5 text-paper shadow-lg"
        >
          <p className="text-[15px] font-semibold tracking-[-0.02em]">Sworn</p>
          <p className="mt-0.5 font-mono text-[10px] font-normal text-paper/60">
            DAE · intent seal · MCP
          </p>
        </motion.div>

        <div className="flex items-center px-3 md:px-5">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35, ease }}
            className="flex flex-col items-center gap-1 origin-left"
          >
            <span className="font-mono text-[10px] text-ink-faint">verifies</span>
            <div className="h-px w-12 bg-border md:w-16" />
            <span className="text-ink-faint">→</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.25, ease }}
          className="w-full max-w-[240px] rounded-[18px] border border-border bg-paper p-4"
        >
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            What you get
          </p>
          <div className="flex flex-wrap gap-1.5">
            {OUTPUTS.map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-full border border-border px-2.5 py-1 font-mono text-[9px] text-ink-muted"
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
        className="mt-8 text-center font-mono text-[10px] tracking-wide text-ink-faint"
      >
        Field requests · queued builds · independent commit
      </motion.p>
    </motion.section>
  );
}
