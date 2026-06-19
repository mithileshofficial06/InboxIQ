"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Key, Briefcase, GraduationCap, CreditCard,
  Plane, User, Mail, Newspaper, Gift, Building2,
  TrendingUp, BarChart3, PieChart, Sparkles, RotateCcw,
  Zap, CheckCircle2, ArrowDownToLine,
} from "lucide-react";

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */
interface EmailPillData {
  id: number;
  label: string;
  category: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
}

interface CategoryBucketData {
  name: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  lightBg: string;
}

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */
const EMAIL_PILLS: EmailPillData[] = [
  { id: 1, label: "Amazon Order", category: "Orders", icon: ShoppingCart, color: "#c99a5c", gradient: "linear-gradient(135deg, rgba(201,154,92,0.15), rgba(201,154,92,0.05))" },
  { id: 2, label: "OTP Code", category: "Personal", icon: Key, color: "#a8a29e", gradient: "linear-gradient(135deg, rgba(168,162,158,0.15), rgba(168,162,158,0.05))" },
  { id: 3, label: "LinkedIn", category: "Jobs", icon: Briefcase, color: "#6b7a8f", gradient: "linear-gradient(135deg, rgba(107,122,143,0.15), rgba(107,122,143,0.05))" },
  { id: 4, label: "Interview Invite", category: "Jobs", icon: Briefcase, color: "#6b7a8f", gradient: "linear-gradient(135deg, rgba(107,122,143,0.15), rgba(107,122,143,0.05))" },
  { id: 5, label: "Newsletter", category: "Personal", icon: Newspaper, color: "#a8a29e", gradient: "linear-gradient(135deg, rgba(168,162,158,0.15), rgba(168,162,158,0.05))" },
  { id: 6, label: "Bank Statement", category: "Bills", icon: CreditCard, color: "#c46b5a", gradient: "linear-gradient(135deg, rgba(196,107,90,0.15), rgba(196,107,90,0.05))" },
  { id: 7, label: "GitHub PR", category: "Personal", icon: Gift, color: "#a8a29e", gradient: "linear-gradient(135deg, rgba(168,162,158,0.15), rgba(168,162,158,0.05))" },
  { id: 8, label: "College Circular", category: "Academic", icon: GraduationCap, color: "#849b87", gradient: "linear-gradient(135deg, rgba(132,155,135,0.15), rgba(132,155,135,0.05))" },
  { id: 9, label: "Flight Booking", category: "Travel", icon: Plane, color: "#b5838d", gradient: "linear-gradient(135deg, rgba(181,131,141,0.15), rgba(181,131,141,0.05))" },
  { id: 10, label: "Recruiter Email", category: "Jobs", icon: Briefcase, color: "#6b7a8f", gradient: "linear-gradient(135deg, rgba(107,122,143,0.15), rgba(107,122,143,0.05))" },
  { id: 11, label: "Electricity Bill", category: "Bills", icon: CreditCard, color: "#c46b5a", gradient: "linear-gradient(135deg, rgba(196,107,90,0.15), rgba(196,107,90,0.05))" },
  { id: 12, label: "Exam Results", category: "Academic", icon: GraduationCap, color: "#849b87", gradient: "linear-gradient(135deg, rgba(132,155,135,0.15), rgba(132,155,135,0.05))" },
  { id: 13, label: "Flipkart Delivery", category: "Orders", icon: ShoppingCart, color: "#c99a5c", gradient: "linear-gradient(135deg, rgba(201,154,92,0.15), rgba(201,154,92,0.05))" },
  { id: 14, label: "Hotel Confirm", category: "Travel", icon: Plane, color: "#b5838d", gradient: "linear-gradient(135deg, rgba(181,131,141,0.15), rgba(181,131,141,0.05))" },
  { id: 15, label: "Internship Update", category: "Jobs", icon: Briefcase, color: "#6b7a8f", gradient: "linear-gradient(135deg, rgba(107,122,143,0.15), rgba(107,122,143,0.05))" },
  { id: 16, label: "Credit Card Due", category: "Bills", icon: CreditCard, color: "#c46b5a", gradient: "linear-gradient(135deg, rgba(196,107,90,0.15), rgba(196,107,90,0.05))" },
];

const CATEGORIES: CategoryBucketData[] = [
  { name: "Orders", icon: ShoppingCart, color: "#c99a5c", gradient: "linear-gradient(135deg, rgba(201,154,92,0.12), rgba(201,154,92,0.04))", lightBg: "rgba(201,154,92,0.06)" },
  { name: "Jobs", icon: Briefcase, color: "#6b7a8f", gradient: "linear-gradient(135deg, rgba(107,122,143,0.12), rgba(107,122,143,0.04))", lightBg: "rgba(107,122,143,0.06)" },
  { name: "Academic", icon: GraduationCap, color: "#849b87", gradient: "linear-gradient(135deg, rgba(132,155,135,0.12), rgba(132,155,135,0.04))", lightBg: "rgba(132,155,135,0.06)" },
  { name: "Bills", icon: CreditCard, color: "#c46b5a", gradient: "linear-gradient(135deg, rgba(196,107,90,0.12), rgba(196,107,90,0.04))", lightBg: "rgba(196,107,90,0.06)" },
  { name: "Travel", icon: Plane, color: "#b5838d", gradient: "linear-gradient(135deg, rgba(181,131,141,0.12), rgba(181,131,141,0.04))", lightBg: "rgba(181,131,141,0.06)" },
  { name: "Personal", icon: User, color: "#a8a29e", gradient: "linear-gradient(135deg, rgba(168,162,158,0.12), rgba(168,162,158,0.04))", lightBg: "rgba(168,162,158,0.06)" },
];

/* ═══════════════════════════════════════════
   CHAOS POSITION GENERATOR
   ═══════════════════════════════════════════ */
function useChaosPositions(count: number) {
  return useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      // Distribute pills across the container area avoiding extreme edges
      x: 8 + ((i * 17 + 11) % 75),
      y: 6 + ((i * 13 + 7) % 52),
      rotate: (Math.sin(i * 1.7) * 20),
      driftX: (Math.sin(i * 2.3) * 18),
      driftY: (Math.cos(i * 1.9) * 14),
    }));
  }, [count]);
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function InboxChaosAnimation() {
  const [phase, setPhase] = useState<"chaos" | "sorting" | "done">("chaos");
  const [sortedIds, setSortedIds] = useState<Set<number>>(new Set());
  const [flyingPill, setFlyingPill] = useState<number | null>(null);
  const [bucketCounts, setBucketCounts] = useState<Record<string, number>>({});
  const [flashBucket, setFlashBucket] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const bucketRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const chaosPositions = useChaosPositions(EMAIL_PILLS.length);

  /* ─── Auto-trigger sorting after 3.5s ─── */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (phase === "chaos") {
        setPhase("sorting");
      }
    }, 3500);
    return () => clearTimeout(timer);
  }, [phase]);

  /* ─── Sorting sequence ─── */
  useEffect(() => {
    if (phase !== "sorting") return;

    let i = 0;
    const interval = setInterval(() => {
      if (i >= EMAIL_PILLS.length) {
        clearInterval(interval);
        setTimeout(() => setPhase("done"), 800);
        return;
      }

      const pill = EMAIL_PILLS[i];

      // First, set the pill as "flying" (triggers position change)
      setFlyingPill(pill.id);

      // After the fly animation, mark as sorted and update bucket
      setTimeout(() => {
        setSortedIds(prev => new Set(prev).add(pill.id));
        setBucketCounts(prev => ({
          ...prev,
          [pill.category]: (prev[pill.category] || 0) + 1,
        }));
        setFlashBucket(pill.category);
        setFlyingPill(null);
        setTimeout(() => setFlashBucket(null), 500);
      }, 450);

      i++;
    }, 320);

    return () => clearInterval(interval);
  }, [phase]);

  /* ─── Reset for replay ─── */
  const handleReplay = useCallback(() => {
    setPhase("chaos");
    setSortedIds(new Set());
    setBucketCounts({});
    setFlashBucket(null);
    setFlyingPill(null);
    setTimeout(() => setPhase("sorting"), 3000);
  }, []);

  /* ─── Manual trigger ─── */
  const handleTrigger = useCallback(() => {
    if (phase === "chaos") {
      setPhase("sorting");
    }
  }, [phase]);

  /* ─── Get bucket center position (relative to container) ─── */
  const getBucketPosition = useCallback((categoryName: string) => {
    const container = containerRef.current;
    const bucket = bucketRefs.current[categoryName];
    if (!container || !bucket) return null;

    const containerRect = container.getBoundingClientRect();
    const bucketRect = bucket.getBoundingClientRect();

    return {
      x: ((bucketRect.left + bucketRect.width / 2 - containerRect.left) / containerRect.width) * 100,
      y: ((bucketRect.top + bucketRect.height / 2 - containerRect.top) / containerRect.height) * 100,
    };
  }, []);

  /* ─── Progress ─── */
  const progress = Math.round((sortedIds.size / EMAIL_PILLS.length) * 100);

  return (
    <div
      ref={containerRef}
      className="relative w-full mx-auto overflow-hidden select-none"
      style={{
        maxWidth: "1040px",
        height: "clamp(460px, 60vw, 580px)",
        borderRadius: "20px",
        border: "1px solid var(--color-border-default)",
        background: "var(--color-bg-secondary)",
        boxShadow: "0 32px 80px -20px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.02)",
      }}
    >
      {/* ══════════ HEADER BAR ══════════ */}
      <div
        className="flex justify-between items-center px-4 sm:px-6 py-3"
        style={{
          borderBottom: "1px solid var(--color-border-subtle)",
          background: "var(--color-bg-primary)",
          borderRadius: "20px 20px 0 0",
        }}
      >
        {/* Left: Title */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center rounded-md"
            style={{
              width: "26px", height: "26px",
              background: "var(--color-accent)",
            }}
          >
            <Mail size={12} color="#faf9f6" />
          </div>
          <span
            className="text-xs sm:text-sm font-semibold"
            style={{ color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}
          >
            InboxIQ Classifier
          </span>
        </div>

        {/* Right: Status & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Processing indicator */}
          <AnimatePresence>
            {phase === "sorting" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{
                  background: "rgba(132,155,135,0.1)",
                  border: "1px solid rgba(132,155,135,0.2)",
                }}
              >
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="block rounded-full"
                  style={{ width: "6px", height: "6px", background: "var(--color-sage)" }}
                />
                <span
                  className="text-[10px] sm:text-[11px] font-semibold"
                  style={{ color: "var(--color-sage)" }}
                >
                  AI Processing... {progress}%
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trigger button (chaos phase) */}
          {phase === "chaos" && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTrigger}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md cursor-pointer text-[11px] font-semibold border-none"
              style={{
                background: "var(--color-accent)",
                color: "#fff",
              }}
            >
              <Sparkles size={12} />
              <span className="hidden sm:inline">Organize</span>
            </motion.button>
          )}

          {/* Replay button (done phase) */}
          {phase === "done" && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReplay}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md cursor-pointer text-[11px] font-semibold border-none"
              style={{
                background: "var(--color-accent)",
                color: "#fff",
              }}
            >
              <RotateCcw size={11} />
              Replay
            </motion.button>
          )}

          {/* Phase badge */}
          <div
            className="px-2.5 py-1 rounded-md"
            style={{
              background: phase === "done" ? "rgba(132,155,135,0.1)" : "var(--color-bg-tertiary)",
              border: `1px solid ${phase === "done" ? "rgba(132,155,135,0.2)" : "var(--color-border-subtle)"}`,
            }}
          >
            <span
              className="text-[10px] font-semibold uppercase"
              style={{
                letterSpacing: "0.08em",
                color: phase === "done" ? "var(--color-sage)" : "var(--color-text-tertiary)",
              }}
            >
              {phase === "chaos" ? "Unprocessed" : phase === "sorting" ? "Classifying" : "✓ Organized"}
            </span>
          </div>
        </div>
      </div>

      {/* ══════════ MAIN AREA ══════════ */}
      <div className="relative" style={{ height: "calc(100% - 49px)" }}>

        {/* ── Chaotic Email Pills ── */}
        <AnimatePresence>
          {EMAIL_PILLS.map((pill, i) => {
            const isSorted = sortedIds.has(pill.id);
            const isFlying = flyingPill === pill.id;
            const pos = chaosPositions[i];
            const PillIcon = pill.icon;

            if (isSorted) return null;

            // Calculate target position when flying
            let targetPos = { x: pos.x, y: pos.y };
            if (isFlying) {
              const bucketPos = getBucketPosition(pill.category);
              if (bucketPos) {
                targetPos = bucketPos;
              }
            }

            return (
              <motion.div
                key={pill.id}
                initial={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  rotate: pos.rotate,
                  opacity: 0,
                  scale: 0.5,
                }}
                animate={
                  isFlying
                    ? {
                        left: `${targetPos.x}%`,
                        top: `${targetPos.y}%`,
                        rotate: 0,
                        opacity: 0,
                        scale: 0.3,
                      }
                    : phase === "chaos"
                    ? {
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        rotate: pos.rotate,
                        opacity: 1,
                        scale: 1,
                        x: [0, pos.driftX, 0, -pos.driftX * 0.6, 0],
                        y: [0, pos.driftY, 0, -pos.driftY * 0.7, 0],
                      }
                    : {
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        rotate: pos.rotate,
                        opacity: 1,
                        scale: 1,
                      }
                }
                exit={{
                  opacity: 0,
                  scale: 0.2,
                  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                }}
                transition={
                  isFlying
                    ? {
                        duration: 0.45,
                        ease: [0.25, 0.46, 0.45, 0.94],
                        opacity: { duration: 0.45, ease: "easeIn" },
                      }
                    : phase === "chaos"
                    ? {
                        opacity: { duration: 0.6, delay: i * 0.06 },
                        scale: { duration: 0.6, delay: i * 0.06 },
                        x: { duration: 5 + (i % 4) * 1.2, repeat: Infinity, ease: "easeInOut" },
                        y: { duration: 6 + (i % 3) * 1.5, repeat: Infinity, ease: "easeInOut" },
                      }
                    : { duration: 0.3 }
                }
                className="absolute z-10 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg cursor-default whitespace-nowrap"
                style={{
                  background: pill.gradient,
                  border: `1px solid ${pill.color}22`,
                  boxShadow: `0 4px 16px ${pill.color}10, 0 1px 3px rgba(0,0,0,0.04)`,
                  backdropFilter: "blur(8px)",
                }}
              >
                <PillIcon size={12} style={{ color: pill.color, flexShrink: 0 }} />
                <span
                  className="text-[10px] sm:text-[11px] font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {pill.label}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* ── Category Buckets ── */}
        <div
          className="absolute bottom-0 left-0 right-0 grid gap-1.5 sm:gap-2 p-3 sm:p-4"
          style={{
            gridTemplateColumns: "repeat(6, 1fr)",
            background: "var(--color-bg-primary)",
            borderTop: "1px solid var(--color-border-subtle)",
          }}
        >
          {CATEGORIES.map((cat) => {
            const count = bucketCounts[cat.name] || 0;
            const isFlashing = flashBucket === cat.name;
            const CatIcon = cat.icon;

            return (
              <motion.div
                key={cat.name}
                ref={(el) => { bucketRefs.current[cat.name] = el; }}
                animate={{
                  borderColor: isFlashing ? cat.color : `${cat.color}30`,
                  boxShadow: isFlashing
                    ? `0 0 24px ${cat.color}25, inset 0 0 20px ${cat.color}08`
                    : `0 2px 8px rgba(0,0,0,0.02)`,
                  scale: isFlashing ? 1.04 : 1,
                }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-1 sm:gap-2 py-2.5 sm:py-4 px-1 sm:px-2 rounded-xl"
                style={{
                  border: `1px solid ${cat.color}30`,
                  background: count > 0 ? cat.gradient : "var(--color-bg-secondary)",
                  transition: "background 0.4s ease",
                }}
              >
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    width: "clamp(28px, 4vw, 36px)",
                    height: "clamp(28px, 4vw, 36px)",
                    background: count > 0 ? `${cat.color}15` : "var(--color-bg-tertiary)",
                    transition: "background 0.3s",
                  }}
                >
                  <CatIcon
                    size={16}
                    style={{ color: cat.color }}
                    strokeWidth={1.5}
                  />
                </div>
                <span
                  className="text-[9px] sm:text-[11px] font-semibold text-center leading-tight"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {cat.name}
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={count}
                    initial={{ scale: 1.8, opacity: 0, y: -4 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="text-sm sm:text-lg font-extrabold tabular-nums"
                    style={{
                      color: count > 0 ? cat.color : "var(--color-text-tertiary)",
                    }}
                  >
                    {count}
                  </motion.span>
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* ── Progress bar during sorting ── */}
        <AnimatePresence>
          {phase === "sorting" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-[140px] sm:bottom-[170px] left-4 right-4 sm:left-6 sm:right-6"
            >
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: "var(--color-border-default)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "var(--color-sage)" }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════ DONE STATE: MINI ANALYTICS DASHBOARD ══════════ */}
        <AnimatePresence>
          {phase === "done" && (
            <motion.div
              initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-start sm:items-center justify-center px-3 sm:px-6 pt-4 sm:pt-0"
              style={{ bottom: "clamp(140px, 20vw, 175px)" }}
            >
              <div className="w-full max-w-[560px]">
                {/* Success header */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.6 }}
                  className="flex items-center justify-center gap-2 mb-4"
                >
                  <CheckCircle2 size={16} style={{ color: "var(--color-sage)" }} />
                  <span
                    className="text-xs font-semibold uppercase"
                    style={{
                      letterSpacing: "0.1em",
                      color: "var(--color-sage)",
                    }}
                  >
                    All emails classified
                  </span>
                </motion.div>

                {/* Stat cards grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {[
                    { icon: TrendingUp, label: "Sorted", value: "16", color: "var(--color-sage)" },
                    { icon: PieChart, label: "Categories", value: "6", color: "var(--color-slate)" },
                    { icon: BarChart3, label: "Accuracy", value: "98%", color: "var(--color-ochre)" },
                    { icon: Zap, label: "Speed", value: "4.2s", color: "var(--color-dusty-rose)" },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 24, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: 0.3 + i * 0.1,
                        duration: 0.65,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="text-center py-4 sm:py-5 px-2 rounded-xl"
                      style={{
                        border: "1px solid var(--color-border-default)",
                        background: "var(--color-bg-secondary)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                      }}
                    >
                      <stat.icon
                        size={18}
                        style={{ color: stat.color, margin: "0 auto 8px" }}
                        strokeWidth={1.5}
                      />
                      <div
                        className="text-xl sm:text-2xl font-extrabold tabular-nums"
                        style={{
                          letterSpacing: "-0.03em",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {stat.value}
                      </div>
                      <div
                        className="text-[10px] font-semibold uppercase mt-1"
                        style={{
                          letterSpacing: "0.08em",
                          color: "var(--color-text-tertiary)",
                        }}
                      >
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Bottom insight bar */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="flex items-center justify-center gap-2 mt-3 py-2.5 px-4 rounded-lg"
                  style={{
                    background: "rgba(132,155,135,0.06)",
                    border: "1px solid rgba(132,155,135,0.12)",
                  }}
                >
                  <ArrowDownToLine size={12} style={{ color: "var(--color-sage)" }} />
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: "var(--color-sage)" }}
                  >
                    Your inbox is now organized with AI-powered intelligence
                  </span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
