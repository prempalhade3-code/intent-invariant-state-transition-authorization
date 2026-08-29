"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const INK = "#0A0A0A";
const OCEAN = "#0077B6";
const OCEAN_DEEP = "#023E8A";
const OCEAN_GLOW = "#48CAE4";

type FallPiece = {
  id: number;
  x: number;
  w: number;
  h: number;
  rotate: number;
  delay: number;
  duration: number;
  shape: "bar" | "disc" | "hex" | "sheet";
  tone: "ink" | "ocean" | "ghost";
};

type Sparkle = { id: number; x: number; y: number; size: number; delay: number };

function seeded(n: number) {
  const v = Math.sin(n * 43758.5453) * 10000;
  return v - Math.floor(v);
}

function buildPieces(count: number): FallPiece[] {
  const shapes: FallPiece["shape"][] = ["bar", "disc", "hex", "sheet"];
  const tones: FallPiece["tone"][] = ["ink", "ocean", "ghost"];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: seeded(i * 1.7) * 100,
    w: 6 + seeded(i * 2.9) * 22,
    h: 6 + seeded(i * 4.1) * 28,
    rotate: -40 + seeded(i * 5.3) * 80,
    delay: seeded(i * 6.7) * 8,
    duration: 7 + seeded(i * 3.3) * 8,
    shape: shapes[Math.floor(seeded(i * 8.1) * shapes.length)],
    tone: tones[Math.floor(seeded(i * 9.4) * tones.length)],
  }));
}

function buildSparkles(count: number): Sparkle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 5 + seeded(i * 2.1) * 90,
    y: 45 + seeded(i * 3.7) * 50,
    size: 1.5 + seeded(i * 5.9) * 2.5,
    delay: seeded(i * 7.3) * 4,
  }));
}

function FallShape({ piece }: { piece: FallPiece }) {
  const color =
    piece.tone === "ocean" ? OCEAN : piece.tone === "ink" ? INK : "rgba(10,10,10,0.18)";
  const opacity = piece.tone === "ghost" ? 0.35 : 0.55;

  return (
    <motion.div
      className="absolute top-0 will-change-transform"
      style={{
        left: `${piece.x}%`,
        width: piece.w,
        height: piece.h,
        rotate: piece.rotate,
      }}
      initial={{ y: "-20%", opacity: 0 }}
      animate={{
        y: ["-20%", "115%"],
        opacity: [0, opacity, opacity, 0],
        rotate: [piece.rotate, piece.rotate + 120, piece.rotate + 240],
      }}
      transition={{
        duration: piece.duration,
        repeat: Infinity,
        ease: "linear",
        delay: piece.delay,
        times: [0, 0.08, 0.88, 1],
      }}
    >
      {piece.shape === "disc" && (
        <div
          className="h-full w-full rounded-full"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${OCEAN_GLOW}99, ${color})`,
            opacity: 0.75,
          }}
        />
      )}
      {piece.shape === "bar" && (
        <div className="h-full w-[2px] rounded-full" style={{ background: color, margin: "0 auto" }} />
      )}
      {piece.shape === "sheet" && (
        <div
          className="hero-shimmer-surface h-full w-full overflow-hidden rounded-[3px] border"
          style={{ backgroundColor: "rgba(255,255,255,0.75)", borderColor: `${OCEAN}33` }}
        />
      )}
      {piece.shape === "hex" && (
        <svg viewBox="0 0 24 24" className="h-full w-full">
          <polygon
            points="12,2 22,8 22,16 12,22 2,16 2,8"
            fill="none"
            stroke={color}
            strokeWidth="1.2"
            opacity="0.65"
          />
        </svg>
      )}
    </motion.div>
  );
}

const WAVE_A = [
  "M0,120 C120,95 240,140 400,110 C560,80 680,130 800,105 L800,220 L0,220 Z",
  "M0,120 C130,150 270,90 400,125 C530,160 670,95 800,130 L800,220 L0,220 Z",
  "M0,120 C120,95 240,140 400,110 C560,80 680,130 800,105 L800,220 L0,220 Z",
];

const WAVE_B = [
  "M0,145 C150,120 300,165 450,135 C600,105 700,155 800,125 L800,220 L0,220 Z",
  "M0,145 C140,170 320,115 480,150 C640,185 720,120 800,160 L800,220 L0,220 Z",
  "M0,145 C150,120 300,165 450,135 C600,105 700,155 800,125 L800,220 L0,220 Z",
];

const WAVE_C = [
  "M0,165 C100,140 220,180 400,155 C580,130 700,175 800,150 L800,220 L0,220 Z",
  "M0,165 C110,190 250,135 420,170 C590,205 710,140 800,185 L800,220 L0,220 Z",
  "M0,165 C100,140 220,180 400,155 C580,130 700,175 800,150 L800,220 L0,220 Z",
];

export function HeroVisual() {
  const pieces = useMemo(() => buildPieces(32), []);
  const sparkles = useMemo(() => buildSparkles(28), []);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[42vh] max-h-[360px] min-h-[220px] overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-b from-paper via-paper/88 to-transparent" />

      <motion.div
        className="absolute bottom-[-10%] left-[18%] h-[220px] w-[320px] rounded-full blur-[80px]"
        style={{ background: `radial-gradient(circle, ${OCEAN}35 0%, transparent 70%)` }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-5%] right-[12%] h-[200px] w-[280px] rounded-full blur-[70px]"
        style={{ background: `radial-gradient(circle, ${OCEAN_DEEP}28 0%, transparent 72%)` }}
        animate={{ x: [0, -25, 0], y: [0, 15, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      <div className="absolute inset-0">
        {pieces.map((p) => (
          <FallShape key={p.id} piece={p} />
        ))}
      </div>

      <svg
        viewBox="0 0 800 220"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[72%] w-full"
      >
        <defs>
          <linearGradient id="wave-ink" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={OCEAN_DEEP} stopOpacity="0.06" />
            <stop offset="100%" stopColor={INK} stopOpacity="0.14" />
          </linearGradient>
          <linearGradient id="wave-ocean" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={OCEAN} stopOpacity="0.14" />
            <stop offset="100%" stopColor={OCEAN_DEEP} stopOpacity="0.34" />
          </linearGradient>
          <linearGradient id="wave-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={OCEAN_GLOW} stopOpacity="0.1" />
            <stop offset="100%" stopColor={OCEAN} stopOpacity="0.26" />
          </linearGradient>
          <linearGradient id="wave-shine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="45%" stopColor="white" stopOpacity="0.35" />
            <stop offset="55%" stopColor={OCEAN_GLOW} stopOpacity="0.25" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        <motion.path
          fill="url(#wave-ink)"
          animate={{ d: WAVE_A }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          fill="url(#wave-ocean)"
          animate={{ d: WAVE_B }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        <motion.path
          fill="url(#wave-glow)"
          animate={{ d: WAVE_C }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        />

        {/* glitter caustics on wave surface */}
        <motion.path
          d="M0,155 C200,130 400,175 600,140 C700,125 750,150 800,135 L800,220 L0,220 Z"
          fill="url(#wave-shine)"
          animate={{ opacity: [0.15, 0.55, 0.15] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* sparkles */}
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            bottom: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: `radial-gradient(circle, white 0%, ${OCEAN_GLOW} 45%, transparent 70%)`,
            boxShadow: `0 0 ${s.size * 3}px ${OCEAN_GLOW}88`,
          }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.4, 0.5] }}
          transition={{
            duration: 2.2 + (s.id % 3) * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: s.delay,
          }}
        />
      ))}

      {[
        { left: "12%", bottom: "28%", w: 64, h: 64, delay: 0 },
        { left: "78%", bottom: "34%", w: 52, h: 52, delay: 1.2 },
        { left: "44%", bottom: "18%", w: 40, h: 40, delay: 2.1 },
      ].map((shard, i) => (
        <motion.div
          key={i}
          className="absolute overflow-hidden rounded-2xl border border-white/70 bg-white/45 shadow-sm backdrop-blur-md"
          style={{ left: shard.left, bottom: shard.bottom, width: shard.w, height: shard.h }}
          animate={{
            y: [0, -18, 0],
            rotate: [0, i % 2 ? 8 : -8, 0],
            opacity: [0.5, 0.9, 0.5],
          }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: shard.delay }}
        >
          <div className="hero-shimmer-surface absolute inset-0 opacity-80" />
        </motion.div>
      ))}

      <motion.div
        className="absolute bottom-[22%] left-1/2 h-px w-[60%] -translate-x-1/2"
        style={{
          background: `linear-gradient(90deg, transparent, ${OCEAN}77, ${OCEAN_GLOW}99, ${OCEAN}77, transparent)`,
        }}
        animate={{ opacity: [0.25, 0.9, 0.25], scaleX: [0.85, 1, 0.85] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* sweeping mirror gleam */}
      <motion.div
        className="absolute bottom-0 left-0 h-[55%] w-[35%]"
        style={{
          background:
            "linear-gradient(118deg, transparent 42%, rgba(255,255,255,0.55) 50%, rgba(186,230,253,0.25) 52%, transparent 58%)",
        }}
        animate={{ x: ["-30%", "320%"] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
      />

      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-paper to-transparent" />
    </div>
  );
}
