"use client";

import { useEffect, useRef } from "react";

export function SignatureArc() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let raf: number;

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) {
        raf = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h + h * 0.08;
      const radius = w * 0.62;
      const cols = Math.floor(w / 7);
      const rows = Math.floor(h / 6);
      const dotR = Math.max(0.8, w / 900);
      const pulse = Math.sin(frame * 0.012) * 0.08 + 0.92;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const angle = (col / (cols - 1)) * Math.PI;
          const r = radius - row * (radius / rows) * 0.95;
          const x = cx + Math.cos(Math.PI - angle) * r;
          const y = cy - Math.sin(angle) * r;

          if (y < -20 || y > h + 10) continue;

          const wave = Math.sin(col * 0.22 + row * 0.15 + frame * 0.018);
          const depth = 1 - row / rows;
          const alpha = (0.06 + wave * 0.04 + depth * 0.42) * pulse;

          if (alpha < 0.04) continue;

          ctx.beginPath();
          ctx.arc(x, y, dotR + (wave > 0.5 ? 0.2 : 0), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(10, 10, 10, ${Math.min(alpha, 0.85)})`;
          ctx.fill();
        }
      }

      frame++;
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[min(52vh,480px)] w-full"
      aria-hidden
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
