"use client";

import { useEffect, useRef } from "react";

// ─── Tuning ──────────────────────────────────────────────────────────────────
// Start crossfading this many seconds before the active video ends.
// Should be >= the hold-frame duration you observe.
const CROSSFADE_SEC = 2.5;

// Keep the background video looping before it ends (keeps decoder warm).
const BG_RESET_THRESHOLD = 0.4;

// ─────────────────────────────────────────────────────────────────────────────
const SHARED: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  pointerEvents: "none",
  // GPU compositing — browser never touches CPU for this element
  transform: "translateZ(0)",
  willChange: "opacity",
};

interface VideoBackgroundProps {
  src: string;
  style?: React.CSSProperties;
}

export function VideoBackground({ src, style }: VideoBackgroundProps) {
  const vaRef = useRef<HTMLVideoElement>(null);
  const vbRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);

  // Mutable machine state — never causes re-renders
  const st = useRef({
    active: "a" as "a" | "b",
    crossfading: false,
    xStart: 0,
  });

  useEffect(() => {
    const a = vaRef.current!;
    const b = vbRef.current!;

    // ── Helpers ──────────────────────────────────────────────────────────────
    const ensurePlaying = (v: HTMLVideoElement) => {
      if (v.paused || v.ended) v.play().catch(() => {});
    };

    // ── Boot both decoders immediately ────────────────────────────────────────
    // BOTH videos start playing. Background video (b) stays at opacity 0.
    // This keeps the GPU texture and decode pipeline permanently warm so
    // there is zero startup lag when we switch visibility.
    a.style.opacity = "1";
    b.style.opacity = "0";
    a.play().catch(() => {});
    b.play().catch(() => {});

    // ── 60-fps control loop ───────────────────────────────────────────────────
    const tick = () => {
      const state = st.current;
      const curr = state.active === "a" ? a : b; // visible
      const next = state.active === "a" ? b : a; // background

      // ── 1. Keep background video looping silently ─────────────────────────
      //    Never let it run out of frames — reset to 0 while still invisible
      if (
        !state.crossfading &&
        next.duration > 0 &&
        next.duration - next.currentTime <= BG_RESET_THRESHOLD
      ) {
        next.currentTime = 0;
        ensurePlaying(next);
      }

      if (!state.crossfading) {
        // ── 2. Detect crossfade trigger ───────────────────────────────────────
        if (
          curr.duration > 0 &&
          curr.duration - curr.currentTime <= CROSSFADE_SEC
        ) {
          state.crossfading = true;
          state.xStart = performance.now();

          // Snap next to frame 0 — it's been rendering silently the whole
          // time so this seek is instant (fully buffered, warm decoder).
          next.currentTime = 0;
          ensurePlaying(next);
        }

        // Safety net: curr somehow ended / paused unexpectedly
        if (curr.ended || curr.paused) {
          curr.currentTime = 0;
          ensurePlaying(curr);
        }

      } else {
        // ── 3. Animate the crossfade at native 60 fps ─────────────────────────
        const t = Math.min(
          (performance.now() - state.xStart) / (CROSSFADE_SEC * 1000),
          1
        );
        curr.style.opacity = String(1 - t);
        next.style.opacity = String(t);

        if (t >= 1) {
          // ── 4. Swap ─────────────────────────────────────────────────────────
          state.active = state.active === "a" ? "b" : "a";
          state.crossfading = false;

          // Old active goes to background: reset to 0 NOW, while it has the
          // entire upcoming play-through of the new active to warm up.
          curr.style.opacity = "0";
          curr.currentTime = 0;
          ensurePlaying(curr); // keep decoder hot
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      a.pause();
      b.pause();
    };
  }, [src]);

  const merged = { ...SHARED, ...style };

  return (
    <>
      <video
        ref={vaRef}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        style={merged}
      >
        <source src={src} type="video/mp4" />
      </video>
      <video
        ref={vbRef}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        style={{ ...merged, opacity: 0 }}
      >
        <source src={src} type="video/mp4" />
      </video>
    </>
  );
}
