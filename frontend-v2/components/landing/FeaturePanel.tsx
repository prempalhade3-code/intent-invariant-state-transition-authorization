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
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            01 · POST /v1/seal ↗
          </p>
          <h2 className="text-[26px] font-medium leading-[1.15] tracking-[-0.04em] text-ink sm:text-[32px]">
            Seal anything
            <br />
            before the agent acts
          </h2>
          <p className="mt-4 max-w-[360px] text-[15px] font-normal leading-[1.6] text-ink-muted">
            Intent, price ceiling and merchant scope are bound into a cryptographic policy. The agent receives the rules — it cannot rewrite them.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[24px] border border-border"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, #F0EFEB 0%, #E8E6E1 40%, #DDDAD4 70%, #D0CDC6 100%)",
            }}
          />
          <div className="relative p-6 sm:p-8">
            <div className="rounded-[18px] border border-white/60 bg-white/60 p-5 shadow-sm backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-ink" />
                <span className="font-mono text-[11px] text-ink-muted">
                  Agent · sealed by Sworn
                </span>
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
                    <span className="font-medium text-ink">{p.key}</span>
                    <span className="font-normal text-ink-muted">{p.val}</span>
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
