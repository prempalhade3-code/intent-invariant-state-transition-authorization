"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ATTACKS } from "@/lib/api";

const ease = [0.22, 1, 0.36, 1] as const;

const PATTERNS = [
  "radial-gradient(circle at 30% 40%, rgba(10,10,10,0.06) 0%, transparent 60%)",
  "repeating-linear-gradient(45deg, rgba(10,10,10,0.04) 0px, rgba(10,10,10,0.04) 1px, transparent 1px, transparent 8px)",
  "radial-gradient(ellipse at 70% 60%, rgba(10,10,10,0.05) 0%, transparent 55%)",
  "linear-gradient(135deg, rgba(10,10,10,0.03) 25%, transparent 25%, transparent 50%, rgba(10,10,10,0.03) 50%, rgba(10,10,10,0.03) 75%, transparent 75%)",
];

export function BentoLab() {
  const featured = ATTACKS.slice(0, 4);

  return (
    <motion.section
      className="mx-auto w-full max-w-[960px] px-5 py-24 sm:px-8"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease }}
    >
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Incident Lab
          </p>
          <h2 className="text-[26px] font-medium leading-[1.15] tracking-[-0.04em] text-ink sm:text-[32px]">
            Conditions we break
          </h2>
        </div>
        <Link
          href="/lab"
          className="group flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13px] font-medium text-ink transition-all hover:border-ink hover:shadow-sm"
        >
          Open lab
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {featured.map((attack, i) => (
          <motion.div
            key={attack.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08, ease }}
          >
            <Link href="/lab" className="group block">
              <div
                className="mb-2.5 aspect-[4/3] overflow-hidden rounded-2xl border border-border transition-all duration-300 group-hover:border-ink/30 group-hover:shadow-md"
                style={{
                  background: `#FAFAF9 ${PATTERNS[i % PATTERNS.length]}`,
                  backgroundSize: i % 2 === 1 ? "16px 16px" : "cover",
                }}
              >
                <div className="flex h-full items-end p-3">
                  <span className="rounded-full bg-paper/90 px-2 py-0.5 font-mono text-[9px] font-medium text-ink backdrop-blur-sm">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              </div>
              <p className="text-[14px] font-medium tracking-[-0.02em] text-ink transition-colors group-hover:text-ink/70">
                {attack.title}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
