"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Live-looking audio waveform. Bars oscillate on rAF with per-bar phase
 * offsets; renders a static mid-height pattern under reduced motion.
 */
export function Waveform({
  bars = 32,
  color = "#2563eb",
  height = 48,
  className,
}: {
  bars?: number;
  color?: string;
  height?: number;
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const svg = ref.current;
    if (!svg) return;
    const rects = Array.from(svg.querySelectorAll("rect"));
    let raf = 0;

    const tick = (t: number) => {
      rects.forEach((rect, i) => {
        const phase = i * 0.55;
        const wave =
          Math.sin(t / 260 + phase) * 0.5 + Math.sin(t / 140 + phase * 1.7) * 0.3;
        const h = height * (0.18 + Math.abs(wave) * 0.7);
        rect.setAttribute("height", h.toFixed(1));
        rect.setAttribute("y", ((height - h) / 2).toFixed(1));
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion, height]);

  const barWidth = 3;
  const gap = 4;
  const width = bars * (barWidth + gap) - gap;

  return (
    <svg
      ref={ref}
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden
    >
      {Array.from({ length: bars }).map((_, i) => {
        const staticH = height * (0.2 + Math.abs(Math.sin(i * 0.8)) * 0.6);
        return (
          <rect
            key={i}
            x={i * (barWidth + gap)}
            y={(height - staticH) / 2}
            width={barWidth}
            height={staticH}
            rx={barWidth / 2}
            fill={color}
          />
        );
      })}
    </svg>
  );
}
