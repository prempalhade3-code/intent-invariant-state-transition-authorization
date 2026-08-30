"use client";

import { useEffect, useRef, useCallback } from "react";

const CANVAS_BG = "#0A0B0D";
const SEALED = "#10B981";
const BLOCKED = "#E5484D";
const DIM = "#2a2f38";
const GLYPHS = "0123456789abcdef·";

type CellState = "idle" | "sealed" | "blocked";

type Cell = {
  glyph: string;
  state: CellState;
  stateUntil: number;
  seed: number;
};

function seeded(n: number) {
  const v = Math.sin(n * 127.1) * 43758.5453;
  return v - Math.floor(v);
}

interface AuthorizationMatrixProps {
  armed: boolean;
  stamping: boolean;
  reducedMotion: boolean;
}

export function AuthorizationMatrix({ armed, stamping, reducedMotion }: AuthorizationMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cellsRef = useRef<Cell[][]>([]);
  const beamRef = useRef(0);
  const beamVelRef = useRef(0);
  const cursorRef = useRef({ x: 0.5, y: 0.5 });
  const stampFlashRef = useRef(0);
  const rafRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0, cols: 0, rows: 0, cell: 28 });
  const loadDoneRef = useRef(false);
  const lockPulseRef = useRef(0);
  const lastRef = useRef(0);

  const initGrid = useCallback((cols: number, rows: number) => {
    const grid: Cell[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        row.push({
          glyph: GLYPHS[Math.floor(seeded(i * 3.7) * GLYPHS.length)],
          state: "idle",
          stateUntil: 0,
          seed: seeded(i * 11.3),
        });
      }
      grid.push(row);
    }
    cellsRef.current = grid;
  }, []);

  const resolveCellsAtBeam = useCallback((beamY: number, band: number) => {
    const { rows, cols } = sizeRef.current;
    const grid = cellsRef.current;
    const row = Math.floor(beamY * rows);
    for (let dr = -1; dr <= 1; dr++) {
      const r = row + dr;
      if (r < 0 || r >= rows) continue;
      for (let c = 0; c < cols; c++) {
        const cell = grid[r][c];
        if (Date.now() < cell.stateUntil) continue;
        if (seeded(r * 100 + c + beamY * 1000) > 0.08) continue;
        const blocked = seeded(cell.seed + beamY) > 0.94;
        cell.state = blocked ? "blocked" : "sealed";
        cell.stateUntil = Date.now() + 1800 + seeded(cell.seed) * 1200;
      }
    }
  }, []);

  useEffect(() => {
    if (!stamping) return;
    stampFlashRef.current = 1;
    const { cols, rows } = sizeRef.current;
    const grid = cellsRef.current;
    const cr = Math.floor(rows * 0.52);
    const cc = Math.floor(cols * 0.5);
    for (let dr = -4; dr <= 4; dr++) {
      for (let dc = -8; dc <= 8; dc++) {
        const r = cr + dr;
        const c = cc + dc;
        if (r >= 0 && r < rows && c >= 0 && c < cols) {
          grid[r][c].state = "sealed";
          grid[r][c].stateUntil = Date.now() + 2200;
        }
      }
    }
  }, [stamping]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const cell = w < 640 ? 24 : 28;
      sizeRef.current = {
        w,
        h,
        cell,
        cols: Math.ceil(w / cell),
        rows: Math.ceil(h / cell),
      };
      initGrid(sizeRef.current.cols, sizeRef.current.rows);
    };

    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      cursorRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const tick = (now: number) => {
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { w, h, cell, cols, rows } = sizeRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = CANVAS_BG;
      ctx.fillRect(0, 0, w, h);

      const targetSpeed = reducedMotion ? 0 : armed ? 0.14 : loadDoneRef.current ? 0.045 : 0.55;
      if (!loadDoneRef.current && !reducedMotion) {
        beamRef.current += beamVelRef.current * dt;
        if (beamRef.current >= 1) {
          beamRef.current = 1;
          loadDoneRef.current = true;
          lockPulseRef.current = 1;
          beamRef.current = 0;
        }
      } else if (!reducedMotion) {
        beamRef.current = (beamRef.current + targetSpeed * dt) % 1;
      }

      beamVelRef.current += (targetSpeed - beamVelRef.current) * 0.06;
      const beamY = beamRef.current;

      if (!reducedMotion) resolveCellsAtBeam(beamY, 0.04);

      if (stampFlashRef.current > 0) {
        stampFlashRef.current = Math.max(0, stampFlashRef.current - dt * 1.8);
      }
      if (lockPulseRef.current > 0) {
        lockPulseRef.current = Math.max(0, lockPulseRef.current - dt * 0.9);
      }

      const cx = cursorRef.current.x * w;
      const cy = cursorRef.current.y * h;
      const grid = cellsRef.current;
      const nowMs = Date.now();

      ctx.font = `${cell * 0.38}px var(--font-plex), ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cellData = grid[r]?.[c];
          if (!cellData) continue;

          const x = c * cell + cell / 2;
          const y = r * cell + cell / 2;

          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const cursorBoost = Math.max(0, 1 - dist / 220) * 0.55;

          const beamDist = Math.abs(r / rows - beamY);
          const inBeam = beamDist < 0.05 ? 1 - beamDist / 0.05 : 0;

          const vx = x - w / 2;
          const vy = y - h * 0.38;
          const vignette = Math.max(0.18, 1 - Math.sqrt(vx * vx + vy * vy) / (w * 0.58));
          const bottomBoost = r / rows > 0.5 ? 1 + (r / rows - 0.5) * 0.9 : 1;

          let alpha = (0.16 + cellData.seed * 0.1 + cursorBoost + inBeam * 0.4) * vignette * bottomBoost;

          if (!loadDoneRef.current && !reducedMotion) {
            const reveal = r / rows <= beamY + 0.02 ? 1 : 0.15;
            alpha *= reveal;
          }

          let color = DIM;
          if (cellData.state === "sealed" && nowMs < cellData.stateUntil) {
            color = SEALED;
            alpha = Math.max(alpha, 0.72);
          } else if (cellData.state === "blocked" && nowMs < cellData.stateUntil) {
            color = BLOCKED;
            alpha = Math.max(alpha, 0.78);
          } else if (nowMs >= cellData.stateUntil) {
            cellData.state = "idle";
          }

          ctx.fillStyle = color;
          ctx.globalAlpha = Math.min(1, alpha);
          ctx.fillText(cellData.glyph, x, y);
        }
      }

      ctx.globalAlpha = 1;

      if (!reducedMotion) {
        const beamLineY = beamY * h;
        const grad = ctx.createLinearGradient(0, beamLineY - 56, 0, beamLineY + 56);
        grad.addColorStop(0, "rgba(16,185,129,0)");
        grad.addColorStop(0.4, armed ? "rgba(16,185,129,0.28)" : "rgba(16,185,129,0.16)");
        grad.addColorStop(0.5, armed ? "rgba(16,185,129,0.55)" : "rgba(16,185,129,0.38)");
        grad.addColorStop(0.6, armed ? "rgba(16,185,129,0.28)" : "rgba(16,185,129,0.16)");
        grad.addColorStop(1, "rgba(16,185,129,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, beamLineY - 64, w, 128);

        ctx.strokeStyle = armed ? "rgba(16,185,129,0.7)" : "rgba(16,185,129,0.45)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, beamLineY);
        ctx.lineTo(w, beamLineY);
        ctx.stroke();
      }

      if (lockPulseRef.current > 0) {
        const pulseR = (1.15 - lockPulseRef.current * 0.4) * Math.min(w, h) * 0.22;
        const lg = ctx.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h * 0.42, pulseR);
        lg.addColorStop(0, `rgba(16,185,129,${0.28 * lockPulseRef.current})`);
        lg.addColorStop(0.55, `rgba(16,185,129,${0.08 * lockPulseRef.current})`);
        lg.addColorStop(1, "rgba(16,185,129,0)");
        ctx.fillStyle = lg;
        ctx.fillRect(0, 0, w, h);
      }

      if (stampFlashRef.current > 0) {
        const flashR = (1 - stampFlashRef.current) * Math.max(w, h) * 0.45;
        const g = ctx.createRadialGradient(w / 2, h * 0.52, 0, w / 2, h * 0.52, flashR);
        g.addColorStop(0, `rgba(16,185,129,${0.35 * stampFlashRef.current})`);
        g.addColorStop(1, "rgba(16,185,129,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    if (reducedMotion) {
      loadDoneRef.current = true;
      const ctx = canvas.getContext("2d");
      const grid = cellsRef.current;
      if (ctx && grid.length) {
        const { w, h, cell, cols, rows } = sizeRef.current;
        ctx.fillStyle = CANVAS_BG;
        ctx.fillRect(0, 0, w, h);
        ctx.font = `${cell * 0.38}px var(--font-plex), ui-monospace, monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cellData = grid[r]?.[c];
            if (!cellData) continue;
            ctx.fillStyle = DIM;
            ctx.globalAlpha = 0.1 + cellData.seed * 0.06;
            ctx.fillText(cellData.glyph, c * cell + cell / 2, r * cell + cell / 2);
          }
        }
      }
    } else {
      beamVelRef.current = 0.62;
      lastRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [armed, reducedMotion, initGrid, resolveCellsAtBeam]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}
