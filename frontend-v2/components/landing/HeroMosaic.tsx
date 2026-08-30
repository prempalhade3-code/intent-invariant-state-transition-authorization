"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

type TileKind = "halftone" | "grid" | "gradient-a" | "gradient-b" | "wire" | "dots";

interface Tile {
  w: number;
  h: number;
  col: 0 | 1;
  row: number;
  delay: number;
  kind: TileKind;
}

const LEFT: Tile[] = [
  { w: 88, h: 88, col: 0, row: 0, delay: 0, kind: "gradient-a" },
  { w: 72, h: 96, col: 1, row: 0, delay: 0.06, kind: "halftone" },
  { w: 80, h: 72, col: 0, row: 1, delay: 0.1, kind: "grid" },
  { w: 96, h: 80, col: 1, row: 1, delay: 0.14, kind: "gradient-b" },
  { w: 76, h: 88, col: 0, row: 2, delay: 0.18, kind: "dots" },
  { w: 84, h: 76, col: 1, row: 2, delay: 0.22, kind: "wire" },
  { w: 88, h: 84, col: 0, row: 3, delay: 0.26, kind: "halftone" },
];

const RIGHT: Tile[] = [
  { w: 76, h: 92, col: 0, row: 0, delay: 0.04, kind: "grid" },
  { w: 92, h: 80, col: 1, row: 0, delay: 0.08, kind: "gradient-b" },
  { w: 84, h: 84, col: 0, row: 1, delay: 0.12, kind: "dots" },
  { w: 80, h: 96, col: 1, row: 1, delay: 0.16, kind: "gradient-a" },
  { w: 96, h: 76, col: 0, row: 2, delay: 0.2, kind: "wire" },
  { w: 72, h: 88, col: 1, row: 2, delay: 0.24, kind: "halftone" },
  { w: 88, h: 80, col: 0, row: 3, delay: 0.28, kind: "grid" },
];

function Halftone() {
  return (
    <div
      className="h-full w-full"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(10,10,10,0.35) 1px, transparent 1px)",
        backgroundSize: "5px 5px",
      }}
    />
  );
}

function TileVisual({ kind }: { kind: TileKind }) {
  if (kind === "halftone") return <Halftone />;
  if (kind === "gradient-a") {
    return (
      <div
        className="h-full w-full"
        style={{
          background:
            "linear-gradient(165deg, #E8E6E1 0%, #D4D2CC 35%, #C8C5BE 60%, #B8B5AE 100%)",
        }}
      />
    );
  }
  if (kind === "gradient-b") {
    return (
      <div
        className="h-full w-full"
        style={{
          background:
            "linear-gradient(200deg, #F0EFEB 0%, #DDDAD4 40%, #CAC7C0 70%, #BAB7B0 100%)",
        }}
      />
    );
  }
  if (kind === "grid") {
    return (
      <svg viewBox="0 0 80 80" className="h-full w-full text-ink/12">
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 10} x2="80" y2={i * 10} stroke="currentColor" strokeWidth="0.6" />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="80" stroke="currentColor" strokeWidth="0.6" />
        ))}
      </svg>
    );
  }
  if (kind === "dots") {
    return (
      <div className="grid h-full w-full grid-cols-6 gap-1.5 p-3">
        {Array.from({ length: 36 }).map((_, i) => (
          <div
            key={i}
            className="rounded-full bg-ink"
            style={{ opacity: 0.08 + (i % 5) * 0.04, width: 3, height: 3 }}
          />
        ))}
      </div>
    );
  }
  return (
    <svg viewBox="0 0 80 80" className="h-full w-full p-3 text-ink/15">
      <rect x="8" y="8" width="64" height="64" rx="6" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="20" y="20" width="40" height="40" rx="3" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 3" />
    </svg>
  );
}

function MosaicColumn({ tiles, side }: { tiles: Tile[]; side: "left" | "right" }) {
  const colGap = 10;
  const rowGap = 12;
  const colWidth = 96;

  return (
    <div
      className={`pointer-events-none absolute top-[12%] bottom-[38%] hidden w-[200px] lg:block ${
        side === "left" ? "left-6 xl:left-10" : "right-6 xl:right-10"
      }`}
    >
      {tiles.map((tile, i) => {
        const left = tile.col * (colWidth + colGap);
        const top = tile.row * (tile.h + rowGap);

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: tile.delay, ease }}
            className="absolute overflow-hidden rounded-2xl border border-border/50 bg-paper shadow-[0_2px_12px_rgba(10,10,10,0.04)]"
            style={{
              width: tile.w,
              height: tile.h,
              left: side === "left" ? left : undefined,
              right: side === "right" ? left : undefined,
              top,
            }}
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 5 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: tile.delay,
              }}
              className="h-full w-full"
            >
              <TileVisual kind={tile.kind} />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function HeroMosaic() {
  return (
    <>
      <MosaicColumn tiles={LEFT} side="left" />
      <MosaicColumn tiles={RIGHT} side="right" />
    </>
  );
}
