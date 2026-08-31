"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ATTACKS } from "@/lib/api";
import type { Attack } from "@/lib/types";
import { IncidentMiniVisual } from "@/components/landing/IncidentMiniVisual";

const ease = [0.22, 1, 0.36, 1] as const;

function IncidentCard({ attack, index }: { attack: Attack; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.08, ease }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setExpanded(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group w-full text-left"
      >
        <span className="mb-1.5 block font-mono text-[10px] tracking-[0.14em] text-white/30">
          {String(index + 1).padStart(2, "0")}
        </span>

        <motion.div
          animate={hovered ? { y: -4, borderColor: "rgba(16,185,129,0.35)" } : { y: 0 }}
          transition={{ duration: 0.25, ease }}
          className="relative mb-2 aspect-[4/3] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12141a] shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.07)_0%,transparent_65%)]" />
          <IncidentMiniVisual attackId={attack.id} active={hovered || expanded} />

          {/* hover ring pulse */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl border border-[#10B981]/0"
            animate={hovered ? { borderColor: "rgba(16,185,129,0.25)" } : {}}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        <p className="text-[14px] font-medium tracking-[-0.02em] text-[#F4F5F7] transition-colors group-hover:text-[#10B981]">
          {attack.title}
        </p>
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpanded(false)}
          >
            <motion.div
              className="absolute inset-0 bg-[#0A0B0D]/80 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ duration: 0.4, ease }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[420px] overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#12141a] shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
            >
              <div className="relative h-[200px] border-b border-white/[0.06] bg-[#0A0B0D]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.1)_0%,transparent_70%)]" />
                <IncidentMiniVisual attackId={attack.id} active large />
              </div>

              <div className="p-6">
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
                  Incident Lab · {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="text-[20px] font-medium tracking-[-0.03em] text-[#F4F5F7]">{attack.title}</h3>
                <p className="mt-1 text-[13px] text-white/50">{attack.subtitle}</p>
                <p className="mt-4 text-[14px] leading-[1.6] text-white/45">{attack.whatBreaks}</p>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <Link
                    href="/lab"
                    className="rounded-full bg-[#10B981] px-5 py-2.5 text-[13px] font-medium text-[#0A0B0D] transition-all hover:bg-[#0ea472] active:scale-[0.97]"
                  >
                    Run in lab
                  </Link>
                  <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    className="rounded-full border border-white/[0.08] px-4 py-2.5 text-[13px] font-medium text-white/50 transition-colors hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function BentoLab() {
  const featured = ATTACKS.slice(0, 4);

  return (
    <motion.section
      className="mx-auto w-full max-w-[960px] px-4 py-16 sm:px-8 sm:py-24"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease }}
    >
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
            Incident Lab
          </p>
          <h2 className="text-[26px] font-medium leading-[1.15] tracking-[-0.04em] text-[#F4F5F7] sm:text-[32px]">
            Conditions we break
          </h2>
        </div>
        <Link
          href="/lab"
          className="rounded-full border border-white/[0.08] px-4 py-2 text-[13px] font-medium text-[#F4F5F7] transition-all hover:border-[#10B981]/40 hover:shadow-[0_0_24px_rgba(16,185,129,0.08)]"
        >
          Open lab
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 md:grid-cols-4">
        {featured.map((attack, i) => (
          <IncidentCard key={attack.id} attack={attack} index={i} />
        ))}
      </div>
    </motion.section>
  );
}
