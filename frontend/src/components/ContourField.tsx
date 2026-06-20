"use client";

import { useEffect, useRef, useMemo } from "react";

// ─── Seeded PRNG (Mulberry32) for deterministic but varied line params ─────────
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface LineConfig {
  y: number;         // base vertical position (0..1 of height)
  controlPoints: number[]; // evenly spaced x-positions for control points
  speed: number;     // radians per second
  phase: number;     // starting phase offset
  amplitude: number; // max vertical deviation in px
  waveCount: number; // number of sine waves superimposed
  waveFreqs: number[]; // frequencies of each wave
  waveAmps: number[];  // amplitudes of each wave (sum to 1)
  wavePhases: number[]; // phase offsets for each wave
  opacity: number;
  strokeWidth: number;
}

// ─── Generate contour line configs using seeded random ───────────────────────
function buildLines(width: number, height: number, count: number): LineConfig[] {
  const rng = mulberry32(0xdeadbeef);
  const lines: LineConfig[] = [];

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    // Spread vertically with slight clustering toward center
    const baseY = 0.05 + t * 0.90;

    // Each line gets 2–4 superimposed sine waves for organic feel
    const waveCount = 2 + Math.floor(rng() * 3);
    const rawAmps = Array.from({ length: waveCount }, () => rng() * 0.7 + 0.3);
    const sumAmps = rawAmps.reduce((a, b) => a + b, 0);
    const waveAmps = rawAmps.map((a) => a / sumAmps);
    const waveFreqs = Array.from({ length: waveCount }, () => 0.5 + rng() * 2.5);
    const wavePhases = Array.from({ length: waveCount }, () => rng() * Math.PI * 2);

    // Control points along x axis
    const cpCount = 8 + Math.floor(rng() * 5);
    const controlPoints = Array.from({ length: cpCount }, (_, j) =>
      (j / (cpCount - 1)) * width
    );

    lines.push({
      y: baseY,
      controlPoints,
      // Speed varies widely — some lines creep, some flow
      speed: 0.08 + rng() * 0.55,
      phase: rng() * Math.PI * 2,
      // Amplitude: lines closer to edges breathe less; center lines breathe more
      amplitude: (18 + rng() * 38) * (0.5 + Math.sin(t * Math.PI) * 0.5),
      waveCount,
      waveFreqs,
      waveAmps,
      wavePhases,
      // Subtle opacity variation — fades toward edges
      opacity: 0.25 + rng() * 0.45,
      strokeWidth: 0.6 + rng() * 0.8,
    });
  }

  return lines;
}

// ─── Compute the SVG path `d` attribute for a single line at time t ──────────
function computePath(line: LineConfig, width: number, height: number, t: number): string {
  const baseY = line.y * height;
  const pts = line.controlPoints.map((x, i) => {
    // Each control point gets an independent displacement: superposition of waves
    let dy = 0;
    for (let w = 0; w < line.waveCount; w++) {
      const spatialPhase = (x / width) * Math.PI * 2 * line.waveFreqs[w];
      const timePhase = t * line.speed + line.phase + line.wavePhases[w];
      dy += line.waveAmps[w] * Math.sin(spatialPhase + timePhase);
    }
    return { x, y: baseY + dy * line.amplitude };
  });

  if (pts.length < 2) return "";

  // Build smooth cubic bezier path through all control points
  let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` Q ${cpx.toFixed(1)},${prev.y.toFixed(1)} ${curr.x.toFixed(1)},${curr.y.toFixed(1)}`;
  }
  return d;
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface ContourFieldProps {
  lineCount?: number;
  color?: string;
  className?: string;
}

export function ContourField({
  lineCount = 36,
  color = "#9c9590",
  className = "",
}: ContourFieldProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathsRef = useRef<SVGPathElement[]>([]);
  const linesRef = useRef<LineConfig[]>([]);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const sizeRef = useRef({ width: 0, height: 0 });

  // ── Observe container size ──────────────────────────────────────────────────
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const updateSize = () => {
      const rect = svg.getBoundingClientRect();
      const w = rect.width || window.innerWidth;
      const h = rect.height || window.innerHeight;
      sizeRef.current = { width: w, height: h };
      // Rebuild line configs on resize
      linesRef.current = buildLines(w, h, lineCount);
    };

    const ro = new ResizeObserver(updateSize);
    ro.observe(svg);
    updateSize();

    return () => ro.disconnect();
  }, [lineCount]);

  // ── Collect path refs after first render ────────────────────────────────────
  const collectRef = (el: SVGPathElement | null, idx: number) => {
    if (el) pathsRef.current[idx] = el;
  };

  // ── Animation loop: update each path independently ─────────────────────────
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const tick = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const t = (timestamp - startRef.current) / 1000; // seconds

      const { width, height } = sizeRef.current;
      if (width === 0 || height === 0) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      const lines = linesRef.current;
      const paths = pathsRef.current;

      for (let i = 0; i < lines.length; i++) {
        const path = paths[i];
        if (!path) continue;
        const d = computePath(lines[i], width, height, t);
        if (d) path.setAttribute("d", d);
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  // ── Render placeholder paths (populated by RAF loop) ───────────────────────
  const indices = useMemo(() => Array.from({ length: lineCount }, (_, i) => i), [lineCount]);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {indices.map((i) => {
        // Initial opacity & stroke from a deterministic sample
        // (actual opacity set as attribute; RAF loop only updates `d`)
        const seed = mulberry32(0xdeadbeef + i);
        const rng = () => seed();
        const rawOp = 0.25 + rng() * 0.45;
        const rawSw = 0.6 + rng() * 0.8;
        return (
          <path
            key={i}
            ref={(el) => collectRef(el, i)}
            fill="none"
            stroke={color}
            strokeWidth={rawSw}
            strokeOpacity={rawOp}
            strokeLinecap="round"
            d=""
          />
        );
      })}
    </svg>
  );
}
