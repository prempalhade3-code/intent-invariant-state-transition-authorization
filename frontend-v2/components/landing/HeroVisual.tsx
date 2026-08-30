"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AuthorizationMatrix } from "@/components/landing/AuthorizationMatrix";

interface HeroVisualProps {
  armed?: boolean;
  stamping?: boolean;
}

export function HeroVisual({ armed = false, stamping = false }: HeroVisualProps) {
  const reduced = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#0A0B0D]" aria-hidden>
      <AuthorizationMatrix armed={armed} stamping={stamping} reducedMotion={!!reduced} />

      {/* center vignette — keeps copy legible, lighter at bottom */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_68%_52%_at_50%_36%,rgba(10,11,13,0.12)_0%,rgba(10,11,13,0.55)_48%,rgba(10,11,13,0.82)_72%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-[#0A0B0D]/40 via-transparent to-transparent" />

      {/* edge vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.55)_100%)]" />

      {/* blueprint hairlines — only two horizontal lines in hero */}
      <div className="absolute inset-x-6 top-[68px] h-px bg-white/[0.06]" />
      <div className="absolute inset-x-6 bottom-6 h-px bg-white/[0.06]" />

      {/* stamp verdict flash */}
      {stamping && (
        <motion.div
          className="absolute left-1/2 top-[48%] -translate-x-1/2 font-mono text-[11px] font-medium tracking-[0.35em] text-[#10B981]"
          initial={{ opacity: 0, scale: 0.92, y: 4 }}
          animate={{ opacity: [0, 1, 0], scale: [0.92, 1, 1.02], y: [4, 0, -6] }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          SEALED
        </motion.div>
      )}

      {/* soft bottom edge */}
      <div className="absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-b from-transparent to-[#0A0B0D]" />
    </div>
  );
}
