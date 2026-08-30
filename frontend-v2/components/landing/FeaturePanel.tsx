"use client";

import { motion } from "framer-motion";

const PARAMS = [
  { key: "policy_hash", val: "0x7f3a…e2c1" },
  { key: "ceiling_usd", val: "25.00" },
  { key: "merchant_proof", val: "verified" },
  { key: "oracle_staleness", val: "0ms" },
  { key: "signature_state", val: "pending" },
];

export function FeaturePanel() {
  return (
    <motion.section
      className="mx-auto w-full max-w-[960px] px-5 py-24 sm:px-8"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
            01 · POST /v1/seal
          </p>
          <h2 className="text-[26px] font-medium leading-[1.15] tracking-[-0.04em] text-[#F4F5F7] sm:text-[32px]">
            Seal anything
            <br />
            before the agent acts
          </h2>
          <p className="mt-4 max-w-[360px] text-[15px] font-normal leading-[1.6] text-white/50">
            Intent, price ceiling and merchant scope are bound into a cryptographic policy. The agent receives the rules — it cannot rewrite them.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[24px] border border-white/[0.08]"
        >
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(160deg, #161820 0%, #12141a 40%, #0D0E12 70%, #0A0B0D 100%)",
            }}
          />
          <div className="relative p-6 sm:p-8">
            <div className="rounded-[18px] border border-white/[0.08] bg-[#12141a]/80 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                <span className="font-mono text-[11px] text-white/50">Agent · sealed by Sworn</span>
              </div>
              <div className="space-y-2 font-mono text-[11px] leading-[1.8]">
                {PARAMS.map((p, i) => (
                  <motion.div
                    key={p.key}
                    initial={{ opacity: 0, x: 8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                    className="flex gap-3"
                  >
                    <span className="font-medium text-[#F4F5F7]">{p.key}</span>
                    <span className="font-normal text-white/45">{p.val}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
