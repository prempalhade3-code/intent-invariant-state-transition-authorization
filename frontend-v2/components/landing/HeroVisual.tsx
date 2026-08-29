"use client";

import { motion } from "framer-motion";

const NODES = [
  { id: "intent", label: "INTENT", x: 120, y: 200, delay: 0 },
  { id: "proof", label: "PROOF", x: 680, y: 120, delay: 0.15 },
  { id: "oracle", label: "ORACLE", x: 680, y: 280, delay: 0.3 },
  { id: "sign", label: "SIGN", x: 120, y: 80, delay: 0.45 },
];

const FLOATS = [
  { label: "policy_hash", x: "18%", y: "62%", delay: 0 },
  { label: "ceiling $25", x: "78%", y: "58%", delay: 0.4 },
  { label: "0x7f3a…e2c1", x: "72%", y: "78%", delay: 0.8 },
];

const CENTER = { x: 400, y: 200 };

function DotCluster({ cx, cy, count, spread }: { cx: number; cy: number; count: number; spread: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const r = spread * (0.4 + (i % 3) * 0.2);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r={1.2 + (i % 2) * 0.4}
            fill="#0A0A0A"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.12, 0.45, 0.12] }}
            transition={{
              duration: 3 + (i % 4) * 0.5,
              repeat: Infinity,
              delay: i * 0.08,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </>
  );
}

export function HeroVisual() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-paper from-35% via-paper/95 to-paper/75" />

      {FLOATS.map((f) => (
        <motion.span
          key={f.label}
          className="absolute hidden rounded-md border border-border/80 bg-paper/80 px-2 py-1 font-mono text-[9px] tracking-wide text-ink-faint backdrop-blur-sm sm:inline"
          style={{ left: f.x, top: f.y }}
          animate={{ y: [0, -8, 0], opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 5 + f.delay, repeat: Infinity, ease: "easeInOut", delay: f.delay }}
        >
          {f.label}
        </motion.span>
      ))}

      <svg
        viewBox="0 0 800 360"
        preserveAspectRatio="xMidYMid slice"
        className="absolute bottom-[-2%] left-1/2 h-[50%] w-full max-w-[960px] -translate-x-1/2 opacity-50 sm:bottom-0 sm:h-[52%]"
      >
        <g stroke="#0A0A0A" strokeWidth="0.8" fill="none" opacity="0.1">
          <path d="M 60 40 L 60 70 L 90 70" />
          <path d="M 740 40 L 740 70 L 710 70" />
          <path d="M 60 320 L 60 290 L 90 290" />
          <path d="M 740 320 L 740 290 L 710 290" />
        </g>

        {NODES.map((node) => (
          <motion.line
            key={`line-${node.id}`}
            x1={node.x}
            y1={node.y}
            x2={CENTER.x}
            y2={CENTER.y}
            stroke="#0A0A0A"
            strokeWidth="0.6"
            strokeDasharray="4 6"
            opacity="0.16"
            animate={{ strokeDashoffset: [0, -20] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay: node.delay }}
          />
        ))}

        <DotCluster cx={CENTER.x} cy={CENTER.y} count={52} spread={54} />
        <motion.circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={28}
          fill="none"
          stroke="#0A0A0A"
          strokeWidth="0.6"
          opacity="0.18"
          animate={{ r: [28, 34, 28], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {NODES.map((node) => (
          <g key={node.id}>
            <DotCluster cx={node.x} cy={node.y} count={12} spread={14} />
            <motion.rect
              x={node.x - 34}
              y={node.y - 26}
              width="68"
              height="16"
              rx="3"
              fill="white"
              stroke="#0A0A0A"
              strokeWidth="0.5"
              opacity="0.9"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ duration: 0.8, delay: 0.5 + node.delay }}
            />
            <text
              x={node.x}
              y={node.y - 15}
              textAnchor="middle"
              fontSize="7"
              fontFamily="var(--font-plex), monospace"
              fontWeight="500"
              fill="#0A0A0A"
              opacity="0.65"
            >
              {node.label}
            </text>
          </g>
        ))}

        <motion.circle
          r="2.5"
          fill="#0A0A0A"
          animate={{
            cx: [120, 400, 680, 400, 120, 400],
            cy: [200, 200, 200, 120, 80, 200],
            opacity: [0, 0.55, 0.55, 0.35, 0, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
