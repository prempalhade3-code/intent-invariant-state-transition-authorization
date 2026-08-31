"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const FEED = [
  { hash: "0x7f3a…e2c1", status: "SEALED", detail: "ceiling $25.00 · intent bound" },
  { hash: "0x2b91…a4f8", status: "BLOCKED", detail: "oracle stale +340ms" },
  { hash: "0x9c04…1d7e", status: "SEALED", detail: "merchant_proof verified" },
  { hash: "0x4e88…b03a", status: "SEALED", detail: "policy_hash match" },
  { hash: "0x1f62…c9d2", status: "BLOCKED", detail: "invoice exceeds ceiling" },
  { hash: "0x8a17…f451", status: "SEALED", detail: "marketplace scope ok" },
];

interface HeroSealFeedProps {
  armed?: boolean;
  stamping?: boolean;
}

export function HeroSealFeed({ armed = false, stamping = false }: HeroSealFeedProps) {
  const [index, setIndex] = useState(0);
  const [sealed, setSealed] = useState(847);
  const [blocked, setBlocked] = useState(3);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % FEED.length);
      setSealed((s) => s + (Math.random() > 0.25 ? 1 : 0));
      if (Math.random() > 0.88) setBlocked((b) => b + 1);
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!stamping) return;
    setSealed((s) => s + 1);
  }, [stamping]);

  const current = FEED[index];
  const recent = [FEED[index], FEED[(index + FEED.length - 1) % FEED.length], FEED[(index + FEED.length - 2) % FEED.length]];

  return (
    <motion.div
      className="mt-auto w-full max-w-[540px] pb-5 pt-4 sm:pb-8 sm:pt-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease, delay: 1.2 }}
    >
      {/* stats strip */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-2.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:gap-4">
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-white/35">
            <span
              className={`h-1.5 w-1.5 rounded-full ${armed ? "animate-pulse bg-[#10B981]" : "bg-[#10B981]/60"}`}
            />
            {armed ? "armed" : "scanning"}
          </span>
          <span className="font-mono text-[10px] text-[#10B981]">{sealed.toLocaleString()} sealed</span>
          <span className="font-mono text-[10px] text-[#E5484D]">{blocked} blocked</span>
        </div>
        <span className="hidden font-mono text-[10px] text-white/25 sm:inline">live · DAE</span>
      </div>

      {/* resolve stream */}
      <div className="relative overflow-hidden rounded-[14px] bg-[#12141a]/60 backdrop-blur-sm">
        <div className="px-4 py-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.hash + index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease }}
              className="flex items-center justify-between gap-3"
            >
              <span className="truncate font-mono text-[11px] text-white/45">{current.hash}</span>
              <span
                className={`shrink-0 font-mono text-[10px] font-medium tracking-wide ${
                  current.status === "SEALED" ? "text-[#10B981]" : "text-[#E5484D]"
                }`}
              >
                {current.status}
              </span>
            </motion.div>
          </AnimatePresence>
          <motion.p
            key={`detail-${index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mt-1 font-mono text-[10px] text-white/30"
          >
            {current.detail}
          </motion.p>
        </div>

        {/* trailing log */}
        <div className="px-4 py-2">
          {recent.slice(1).map((row, i) => (
            <div key={`${row.hash}-${i}`} className="flex items-center justify-between py-0.5 opacity-40">
              <span className="truncate font-mono text-[9px] text-white/35">{row.hash}</span>
              <span
                className={`font-mono text-[9px] ${row.status === "SEALED" ? "text-[#10B981]/70" : "text-[#E5484D]/70"}`}
              >
                {row.status}
              </span>
            </div>
          ))}
        </div>

        {/* scan line */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 h-px bg-[#10B981]/30"
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: armed ? 2.2 : 3.8, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* hash ticker */}
      <div className="mt-2.5 overflow-hidden">
        <motion.div
          className="flex gap-6 whitespace-nowrap font-mono text-[9px] text-white/20"
          animate={{ x: [0, -320] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        >
          {Array.from({ length: 2 }).map((_, dup) =>
            "0123456789abcdef·".split("").map((g, i) => (
              <span key={`${dup}-${i}`} className={i % 5 === 0 ? "text-[#10B981]/40" : undefined}>
                {g}
              </span>
            )),
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
