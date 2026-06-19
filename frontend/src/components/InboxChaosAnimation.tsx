"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ShoppingCart, Key, Briefcase, GraduationCap, CreditCard,
  Plane, User, Mail, Newspaper, GitPullRequest, Building2,
  TrendingUp, BarChart3, PieChart, Sparkles, RotateCcw,
  Zap, CheckCircle2, ArrowDownToLine, Search
} from "lucide-react";

/* ─── Category Theme Mapping ─── */
const CATEGORY_THEMES: Record<string, { bg: string; text: string; border: string }> = {
  Orders: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100/50" },
  Jobs: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100/50" },
  Academic: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100/50" },
  Bills: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100/50" },
  Travel: { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-100/50" },
  Personal: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200/50" },
};

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
  { id: 3, label: "LinkedIn Update", category: "Jobs", icon: Briefcase, color: "#6b7a8f", gradient: "linear-gradient(135deg, rgba(107,122,143,0.15), rgba(107,122,143,0.05))" },
  { id: 4, label: "Interview Invite", category: "Jobs", icon: Briefcase, color: "#6b7a8f", gradient: "linear-gradient(135deg, rgba(107,122,143,0.15), rgba(107,122,143,0.05))" },
  { id: 5, label: "Newsletter", category: "Personal", icon: Newspaper, color: "#a8a29e", gradient: "linear-gradient(135deg, rgba(168,162,158,0.15), rgba(168,162,158,0.05))" },
  { id: 6, label: "Bank Statement", category: "Bills", icon: CreditCard, color: "#c46b5a", gradient: "linear-gradient(135deg, rgba(196,107,90,0.15), rgba(196,107,90,0.05))" },
  { id: 7, label: "GitHub PR Link", category: "Personal", icon: GitPullRequest, color: "#a8a29e", gradient: "linear-gradient(135deg, rgba(168,162,158,0.15), rgba(168,162,158,0.05))" },
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
function useChaosPositions(count: number, width: number) {
  return useMemo(() => {
    const isMobile = width < 640;
    return Array.from({ length: count }, (_, i) => {
      // Distribute pills dynamically based on container bounds to optimize spacing
      const x = isMobile
        ? 10 + ((i * 23 + 7) % 76)  // tighter X limits on mobile
        : 8 + ((i * 17 + 11) % 80); // wider X limits on desktop
      
      const y = isMobile
        ? 6 + ((i * 13 + 3) % 36)   // upper half Y limits on mobile
        : 6 + ((i * 11 + 5) % 42);  // upper/mid Y limits on desktop

      return {
        x,
        y,
        rotate: Math.sin(i * 1.7) * (isMobile ? 12 : 20),
        driftX: Math.sin(i * 2.3) * (isMobile ? 8 : 14),
        driftY: Math.cos(i * 1.9) * (isMobile ? 6 : 10),
      };
    });
  }, [count, width]);
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function InboxChaosAnimation() {
  const [phase, setPhase] = useState<"chaos" | "sorting" | "done" | "burst">("chaos");
  const [sortedIds, setSortedIds] = useState<Set<number>>(new Set());
  const [flyingPill, setFlyingPill] = useState<number | null>(null);
  const [bucketCounts, setBucketCounts] = useState<Record<string, number>>({});
  const [flashBucket, setFlashBucket] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState(1040);
  const [isShaking, setIsShaking] = useState(false);
  const [isRefracting, setIsRefracting] = useState(false);
  const [refractingColor, setRefractingColor] = useState<string | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const bucketRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Physics reference objects for burst phase
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<{
    id: number;
    label: string;
    category: string;
    icon: React.ElementType;
    color: string;
    gradient: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
  }[]>([]);

  // Resize observer to monitor layout bounds
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const isMobile = containerWidth < 640;
  const chaosPositions = useChaosPositions(EMAIL_PILLS.length, containerWidth);

  // Monitor if section is scrolled into view (sorting starts only when reached)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  /* ─── Auto-trigger sorting only when scrolled reached ─── */
  useEffect(() => {
    if (!isInView || phase !== "chaos") return;

    const timer = setTimeout(() => {
      setPhase("sorting");
    }, 1500); // 1.5s delay after scroll entering before sorting starts

    return () => clearTimeout(timer);
  }, [isInView, phase]);

  /* ─── Sorting sequence ─── */
  useEffect(() => {
    if (phase !== "sorting") return;

    const timeouts: NodeJS.Timeout[] = [];

    // Loop through each pill to schedule its center-crossover scan event
    EMAIL_PILLS.forEach((pill, i) => {
      // 1. Gather starting at i * 50ms (0s to 1.25s)
      // 2. Train travel starts at 1200ms + i * 220ms.
      // 3. Center crossover occurs 500ms after starting train travel: 1200 + i * 220 + 500 = 1700 + i * 220.
      const crossoverTime = 1700 + i * 220;

      // Scan event: flash centerpiece, increment count, and flash destination bucket
      const t1 = setTimeout(() => {
        setRefractingColor(pill.color);
        setIsRefracting(true);
        
        setSortedIds(prev => new Set(prev).add(pill.id));
        setBucketCounts(prev => ({
          ...prev,
          [pill.category]: (prev[pill.category] || 0) + 1,
        }));
        setFlashBucket(pill.category);

        const t2 = setTimeout(() => {
          setIsRefracting(false);
          setRefractingColor(null);
        }, 220); // flash duration
        timeouts.push(t2);

        const t3 = setTimeout(() => {
          setFlashBucket(null);
        }, 400); // bucket flash duration
        timeouts.push(t3);
      }, crossoverTime);
      timeouts.push(t1);
    });

    // Timeout to show Success Banner after all pills have finished train travel
    // The last pill (index 15) starts train travel at 1200 + 15 * 220 = 4500ms, and reaches left (15%) at 4500 + 1000 = 5500ms.
    const tSuccess = setTimeout(() => {
      setShowSuccessBanner(true);
    }, 5600);
    timeouts.push(tSuccess);

    // Timeout to hide Success Banner and transition to "done"
    const tDone = setTimeout(() => {
      setShowSuccessBanner(false);
      setPhase("done");
    }, 7200);
    timeouts.push(tDone);

    return () => {
      timeouts.forEach(clearTimeout);
      setIsRefracting(false);
      setRefractingColor(null);
      setFlashBucket(null);
      setShowSuccessBanner(false);
    };
  }, [phase]);

  /* ─── Done State: Timer to shake and burst ─── */
  useEffect(() => {
    if (phase !== "done") return;

    // Shake starts at 4.2s (800ms before burst)
    const shakeTimer = setTimeout(() => {
      setIsShaking(true);
    }, 4200);

    // Burst triggers at 5.0s
    const burstTimer = setTimeout(() => {
      setIsShaking(false);
      setPhase("burst");
    }, 5000);

    return () => {
      clearTimeout(shakeTimer);
      clearTimeout(burstTimer);
    };
  }, [phase]);

  /* ─── Burst State: Timer to auto-restart sorting 10s after bursting ─── */
  useEffect(() => {
    if (phase !== "burst") return;

    const restartTimer = setTimeout(() => {
      setPhase("sorting");
      setSortedIds(new Set());
      setBucketCounts({});
      setFlyingPill(null);
      setFlashBucket(null);
      setShowSuccessBanner(false);
    }, 10000);

    return () => clearTimeout(restartTimer);
  }, [phase]);

  /* ─── Physics Particle Initialization (Burst Phase) ─── */
  useEffect(() => {
    if (phase !== "burst") return;

    const w = containerRef.current?.clientWidth || containerWidth;
    const h = containerRef.current?.clientHeight || 500;
    
    // Position burst origin in the center of the stats dashboard
    const startX = w / 2 - (isMobile ? 40 : 60);
    const startY = h / 2 - 90;

    particlesRef.current = EMAIL_PILLS.map((pill) => {
      const angle = Math.random() * 2 * Math.PI;
      const speed = 7 + Math.random() * 9; // Explosion force velocity
      return {
        ...pill,
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      };
    });
  }, [phase, containerWidth, isMobile]);

  /* ─── Physics Simulation Loop (Burst Phase) ─── */
  useEffect(() => {
    if (phase !== "burst") return;

    let animId: number;

    const updatePhysics = () => {
      const w = containerRef.current?.clientWidth || containerWidth;
      const h = containerRef.current?.clientHeight || 500;
      
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      particles.forEach((p) => {
        // 1. Move particle
        p.x += p.vx;
        p.y += p.vy;

        // 2. Drag / air resistance
        p.vx *= 0.965;
        p.vy *= 0.965;

        // 3. Constant floating drift force
        p.vx += (Math.random() - 0.5) * 0.18;
        p.vy += (Math.random() - 0.5) * 0.18;

        // 4. Bound speeds
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const maxSpeed = 6;
        const minSpeed = 0.6;
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        } else if (speed < minSpeed && speed > 0.01) {
          p.vx = (p.vx / speed) * minSpeed;
          p.vy = (p.vy / speed) * minSpeed;
        }

        // 5. Cursor Repulsion (repel with mouse vector)
        const dx = p.x + (isMobile ? 40 : 60) - mouse.x;
        const dy = p.y + 18 - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 130;

        if (dist < repelRadius && dist > 0) {
          const force = (repelRadius - dist) / repelRadius;
          const pushForce = force * 1.6;
          p.vx += (dx / dist) * pushForce;
          p.vy += (dy / dist) * pushForce;
        }

        // 6. Box boundary collisions (bounce off borders)
        const marginX = isMobile ? 80 : 120;
        const marginY = 36;

        if (p.x < 10) {
          p.x = 10;
          p.vx = -p.vx * 0.75;
        } else if (p.x > w - marginX - 10) {
          p.x = w - marginX - 10;
          p.vx = -p.vx * 0.75;
        }

        if (p.y < 10) {
          p.y = 10;
          p.vy = -p.vy * 0.75;
        } else if (p.y > h - 165) { // boundary to bounce above category buckets
          p.y = h - 165;
          p.vy = -p.vy * 0.75;
        }

        // 7. Apply layout transform direct to DOM (bypassing state renders)
        const el = document.getElementById(`burst-pill-${p.id}`);
        if (el) {
          el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
        }
      });

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);

    return () => cancelAnimationFrame(animId);
  }, [phase, containerWidth, isMobile]);

  /* ─── Tracking mouse moves ─── */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current = { x: -1000, y: -1000 };
  };

  /* ─── Reset for replay ─── */
  const handleReplay = useCallback(() => {
    setPhase("chaos");
    setIsShaking(false);
    setSortedIds(new Set());
    setBucketCounts({});
    setFlashBucket(null);
    setFlyingPill(null);
    setShowSuccessBanner(false);
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

  // Dynamic slice of stream emails depending on device height to avoid clutter
  const streamEmails = [
    { sender: "Amazon.in", subject: "Your order #408-2910 has shipped", cat: "Orders", time: "Just now" },
    { sender: "LinkedIn Job Alert", subject: "Recruiter viewed your resume for Lead Engineer", cat: "Jobs", time: "1m ago" },
    { sender: "Stripe Billing", subject: "Invoice paid: $29.00 for InboxIQ Pro Plan", cat: "Bills", time: "3m ago" },
  ];
  const activeEmails = isMobile ? streamEmails.slice(0, 2) : streamEmails;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full mx-auto overflow-hidden select-none transition-all duration-300 ${isShaking ? "shake-active" : ""}`}
      style={{
        maxWidth: "1040px",
        height: "clamp(520px, 60vw, 600px)", // Increased height to make container look spacious and premium
        borderRadius: "24px",
        border: "1px solid var(--color-border-default)",
        background: "var(--color-bg-secondary)",
        boxShadow: "0 32px 80px -20px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.02)",
      }}
    >
      {/* ── Vibrating CSS keyframe shake inject ── */}
      <style>{`
        @keyframes container-shake {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          10%, 50%, 90% { transform: translate3d(-3px, -1px, 0) rotate(-0.4deg); }
          20%, 60% { transform: translate3d(3px, 1px, 0) rotate(0.4deg); }
          30%, 70% { transform: translate3d(-3px, 2px, 0) rotate(-0.8deg); }
          40%, 80% { transform: translate3d(3px, -2px, 0) rotate(0.8deg); }
        }
        .shake-active {
          animation: container-shake 0.15s infinite;
        }
      `}</style>

      {/* ══════════ HEADER BAR ══════════ */}
      <div
        className="flex justify-between items-center px-4 sm:px-6 py-3"
        style={{
          borderBottom: "1px solid var(--color-border-subtle)",
          background: "var(--color-bg-primary)",
          borderRadius: "24px 24px 0 0",
        }}
      >
        {/* Left: Title */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center rounded-md shadow-sm border border-stone-200"
            style={{
              width: "26px", height: "26px",
              background: "#ffffff",
            }}
          >
            <Mail size={12} className="text-stone-700" />
          </div>
          <span
            className="text-xs sm:text-sm font-bold"
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
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200"
              >
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="block rounded-full"
                  style={{ width: "6px", height: "6px", background: "var(--color-sage)" }}
                />
                <span
                  className="text-[10px] sm:text-[11px] font-bold text-stone-600"
                >
                  AI Classifying... {progress}%
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trigger button (chaos phase) */}
          {phase === "chaos" && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTrigger}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer text-[11px] font-bold border-none"
              style={{
                background: "var(--color-accent)",
                color: "#fff",
              }}
            >
              <Sparkles size={12} />
              <span>Organize Now</span>
            </motion.button>
          )}

          {/* Replay button (done or burst phase) */}
          {(phase === "done" || phase === "burst") && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReplay}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg cursor-pointer text-[10px] sm:text-[11px] font-bold border border-stone-200 shadow-sm bg-white hover:bg-stone-50"
              style={{
                color: "var(--color-text-primary)",
              }}
            >
              <RotateCcw size={11} />
              Replay
            </motion.button>
          )}

          {/* Phase badge */}
          <div
            className="px-2.5 py-1 rounded-lg"
            style={{
              background: (phase === "done" || phase === "burst") ? "rgba(132,155,135,0.1)" : "var(--color-bg-tertiary)",
              border: `1px solid ${(phase === "done" || phase === "burst") ? "rgba(132,155,135,0.2)" : "var(--color-border-subtle)"}`,
            }}
          >
            <span
              className="text-[10px] font-bold uppercase"
              style={{
                letterSpacing: "0.08em",
                color: (phase === "done" || phase === "burst") ? "var(--color-sage)" : "var(--color-text-tertiary)",
              }}
            >
              {phase === "chaos" ? "Unprocessed" : phase === "sorting" ? "Classifying" : phase === "burst" ? "⚡ Interactive" : "✓ Organized"}
            </span>
          </div>
        </div>
      </div>

      {/* ══════════ MAIN AREA ══════════ */}
      <div className="relative" style={{ height: "calc(100% - 49px)" }}>

        {/* Vertical Scanning Beam Line */}
        <AnimatePresence>
          {phase === "sorting" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.15, 0.4, 0.15] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 bottom-[96px] sm:bottom-[148px] left-1/2 -translate-x-1/2 w-[2px] z-0 pointer-events-none"
              style={{
                background: refractingColor
                  ? `linear-gradient(to bottom, transparent, ${refractingColor}, transparent)`
                  : "linear-gradient(to bottom, transparent, rgba(168, 162, 158, 0.3), transparent)",
                boxShadow: refractingColor
                  ? `0 0 12px ${refractingColor}, 0 0 24px ${refractingColor}`
                  : "none",
                transition: "background 0.2s, box-shadow 0.2s",
              }}
            />
          )}
        </AnimatePresence>

        {/* ── Scanning Successful Badge Overlay ── */}
        <AnimatePresence>
          {showSuccessBanner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3 px-10 py-8 rounded-2xl border shadow-2xl min-w-[300px]"
              style={{
                background: "rgba(255, 255, 255, 0.8)",
                borderColor: "rgba(132, 155, 135, 0.4)",
                boxShadow: "0 25px 60px rgba(0, 0, 0, 0.08), 0 0 35px rgba(132, 155, 135, 0.2)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <div
                className="flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100"
                style={{ width: "44px", height: "44px", boxShadow: "0 0 15px rgba(16, 185, 129, 0.2)" }}
              >
                <CheckCircle2 size={22} className="stroke-[2.5] animate-pulse" />
              </div>
              <span className="text-sm sm:text-base font-extrabold text-stone-800 tracking-tight leading-relaxed">
                Scanning Successful!
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-widest leading-none whitespace-nowrap mt-3">
                AI Pipeline Complete
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── AI Processing Core (Glass Prism Centerpiece) ── */}
        <AnimatePresence>
          {phase !== "done" && phase !== "burst" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 z-0 flex flex-col items-center justify-center"
            >
              {/* Rotating outer scanner line */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute border border-dashed border-stone-200/80 rounded-full"
                style={{ width: "150px", height: "150px" }}
              />

              {/* Ambient refraction spectrum glow */}
              <motion.div
                animate={{
                  scale: phase === "sorting" ? [1, 1.15, 1] : 1,
                  opacity: phase === "sorting" ? 0.35 : 0.15,
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-400 via-blue-500 to-indigo-500 blur-xl"
              />

              {/* The Glass Prism Core (Hexagonal Cut glassmorphic diamond) */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                className="relative z-10 w-16 h-16 bg-white/20 border border-white/40 shadow-[0_8px_32px_rgba(31,38,135,0.08)] backdrop-blur-md flex flex-col items-center justify-center"
                style={{
                  clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                }}
              >
                {/* Internal spectrum core */}
                <div className="absolute inset-[2px] bg-gradient-to-tr from-emerald-500/20 via-blue-500/20 to-indigo-500/20 mix-blend-color-dodge rounded-full animate-pulse" />
                
                <Sparkles
                  size={20}
                  className={`relative z-20 transition-transform duration-300 ${
                    phase === "sorting" ? "text-stone-700 animate-pulse scale-110" : "text-stone-400"
                  }`}
                />
              </motion.div>

              {/* Dynamic Refraction Sparkle Flash */}
              <AnimatePresence>
                {isRefracting && refractingColor && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: [0.5, 2, 0.5], opacity: [0, 0.9, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="absolute z-20 w-12 h-12 rounded-full blur-sm"
                    style={{
                      background: refractingColor,
                      boxShadow: `0 0 24px ${refractingColor}`,
                    }}
                  />
                )}
              </AnimatePresence>
              
              <span className="relative z-20 text-[9px] font-bold text-stone-500 uppercase tracking-wider mt-3">
                {phase === "sorting" ? (showSuccessBanner ? "Successful" : "Scanning") : "AI Prism"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Chaotic Email Pills (Only visible in chaos/sorting phases) ── */}
        <AnimatePresence>
          {phase !== "done" && phase !== "burst" && EMAIL_PILLS.map((pill, i) => {
            const isSorted = sortedIds.has(pill.id);
            const pos = chaosPositions[i];
            const PillIcon = pill.icon;

            // In sorting phase, keep them rendered so they complete their train journey
            if (phase === "chaos" && isSorted) return null;

            // 5.6s timeline mapping for Gather & Train animation
            const duration = 5.6;
            const t1 = (i * 0.05) / duration;
            const t2 = (i * 0.05 + 0.5) / duration;
            const t3 = (1.2 + i * 0.22) / duration;
            const t4 = (1.2 + i * 0.22 + 1.0) / duration;

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
                  phase === "sorting"
                    ? {
                        left: [`${pos.x}%`, `${pos.x}%`, "85%", "85%", "15%", "15%"],
                        top: [`${pos.y}%`, `${pos.y}%`, "40%", "40%", "40%", "40%"],
                        rotate: [pos.rotate, pos.rotate, 0, 0, 0, 0],
                        opacity: [1, 1, 1, 1, 0, 0],
                        scale: [
                          isMobile ? 0.8 : 1,
                          isMobile ? 0.8 : 1,
                          isMobile ? 0.8 : 0.85,
                          isMobile ? 0.8 : 0.85,
                          0.2,
                          0.2
                        ],
                      }
                    : phase === "chaos"
                    ? {
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        rotate: pos.rotate,
                        opacity: 1,
                        scale: isMobile ? 0.8 : 1,
                        x: [0, pos.driftX, 0, -pos.driftX * 0.6, 0],
                        y: [0, pos.driftY, 0, -pos.driftY * 0.7, 0],
                      }
                    : {
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        rotate: pos.rotate,
                        opacity: 1,
                        scale: isMobile ? 0.8 : 1,
                      }
                }
                exit={{
                  opacity: 0,
                  scale: 0.25,
                  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                }}
                transition={
                  phase === "sorting"
                    ? {
                        duration: duration,
                        times: [0, t1, t2, t3, t4, 1.0],
                        ease: "easeInOut",
                      }
                    : phase === "chaos"
                    ? {
                        opacity: { duration: 0.6, delay: i * 0.05 },
                        scale: { duration: 0.6, delay: i * 0.05 },
                        x: { duration: 7 + (i % 4) * 1.5, repeat: Infinity, ease: "easeInOut" },
                        y: { duration: 8 + (i % 3) * 1.8, repeat: Infinity, ease: "easeInOut" },
                      }
                    : { duration: 0.3 }
                }
                className={`absolute z-10 flex items-center bg-white border border-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.04)] cursor-default whitespace-nowrap transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] ${
                  isMobile
                    ? "px-2 py-1.5 rounded-lg text-[10px] gap-1.5"
                    : "px-3 py-2 rounded-xl text-xs gap-2.5"
                }`}
              >
                {(() => {
                  const theme = CATEGORY_THEMES[pill.category] || CATEGORY_THEMES.Personal;
                  return (
                    <>
                      <div className={`flex items-center justify-center rounded-lg border ${theme.bg} ${theme.text} ${theme.border} flex-shrink-0 ${
                        isMobile ? "h-6 w-6 rounded-md" : "h-8 w-8 rounded-lg"
                      }`}>
                        <PillIcon size={isMobile ? 12 : 14} className="stroke-[1.75]" />
                      </div>
                      <span className="font-semibold tracking-tight text-gray-700">
                        {pill.label}
                      </span>
                    </>
                  );
                })()}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* ── Bursting Interactive Email Pills (Only visible in burst phase, bypasses React render tree in physics loop) ── */}
        {phase === "burst" && (
          <div className="absolute inset-0 z-30 pointer-events-none">
            {EMAIL_PILLS.map((pill) => {
              const PillIcon = pill.icon;
              const theme = CATEGORY_THEMES[pill.category] || CATEGORY_THEMES.Personal;
              
              return (
                <div
                  key={pill.id}
                  id={`burst-pill-${pill.id}`}
                  className={`absolute z-30 flex items-center bg-white border border-gray-150 shadow-[0_6px_20px_rgba(0,0,0,0.04)] whitespace-nowrap ${
                    isMobile
                      ? "px-2 py-1.5 rounded-lg text-[10px] gap-1.5"
                      : "px-3 py-2 rounded-xl text-xs gap-2.5"
                  }`}
                  style={{
                    left: 0,
                    top: 0,
                    transform: "translate3d(0, 0, 0)",
                  }}
                >
                  <div className={`flex items-center justify-center rounded-lg border ${theme.bg} ${theme.text} ${theme.border} flex-shrink-0 ${
                    isMobile ? "h-6 w-6 rounded-md" : "h-8 w-8 rounded-lg"
                  }`}>
                    <PillIcon size={isMobile ? 12 : 14} className="stroke-[1.75]" />
                  </div>
                  <span className="font-semibold tracking-tight text-gray-700">
                    {pill.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Category Buckets ── */}
        <div
          className="absolute bottom-0 left-0 right-0 grid gap-2 sm:gap-3 p-4 sm:p-5 pb-5 sm:pb-6"
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
              <div
                key={cat.name}
                ref={(el) => { bucketRefs.current[cat.name] = el; }}
                className={`flex flex-col items-center justify-center rounded-xl transition-all duration-300 ${
                  isMobile ? "py-2.5 px-1.5 gap-1.5" : "py-5 px-3 gap-2.5"
                } ${
                  isFlashing ? "scale-105 border-stone-400" : "border-stone-200/40"
                }`}
                style={{
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: isFlashing ? cat.color : undefined,
                  boxShadow: isFlashing
                    ? `0 0 24px ${cat.color}25, inset 0 0 20px ${cat.color}08`
                    : `0 2px 8px rgba(0,0,0,0.02)`,
                  background: count > 0 ? cat.gradient : "var(--color-bg-secondary)",
                }}
              >
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    width: isMobile ? "24px" : "32px",
                    height: isMobile ? "24px" : "32px",
                    background: count > 0 ? `${cat.color}15` : "var(--color-bg-tertiary)",
                    transition: "background 0.3s",
                  }}
                >
                  <CatIcon
                    size={isMobile ? 12 : 15}
                    style={{ color: cat.color }}
                    strokeWidth={1.5}
                  />
                </div>
                <span
                  className="font-bold text-center leading-tight tracking-tight text-gray-500"
                  style={{ fontSize: isMobile ? "8px" : "10px" }}
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
                    className="font-extrabold tabular-nums leading-none"
                    style={{
                      fontSize: isMobile ? "11px" : "14px",
                      color: count > 0 ? cat.color : "var(--color-text-tertiary)",
                    }}
                  >
                    {count}
                  </motion.span>
                </AnimatePresence>
              </div>
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
              className="absolute bottom-[120px] sm:bottom-[160px] left-4 right-4 sm:left-6 sm:right-6"
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute flex flex-col justify-start p-6 sm:p-8"
              style={{
                top: isMobile ? "16px" : "24px",
                bottom: isMobile ? "110px" : "170px",
                left: 0,
                right: 0,
                overflow: "hidden"
              }}
            >
              {/* Dashboard Content Container */}
              <div className="flex-1 flex flex-col gap-4 sm:gap-5 max-w-[720px] mx-auto w-full">
                
                {/* Search Bar / Header */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-between border border-stone-200 rounded-xl bg-white px-4 sm:px-5 py-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] mb-4 sm:mb-6"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Search size={14} className="text-stone-400 flex-shrink-0" />
                    <span className="text-[11px] sm:text-xs text-stone-400 font-semibold truncate mr-2">
                      Ask AI to search and analyze your sorted emails...
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100 text-[9px] sm:text-[10px] font-bold flex-shrink-0">
                    <CheckCircle2 size={10} className="stroke-[2.5]" />
                    <span>Real-time</span>
                  </div>
                </motion.div>

                {/* Staggered Stats Cards */}
                <div className="grid grid-cols-4 gap-4 sm:gap-6"> {/* Increased gap between stat cards to gap-6 */}
                  {[
                    { icon: TrendingUp, label: "Sorted", value: "16", color: "var(--color-sage)" },
                    { icon: PieChart, label: "Buckets", value: "6", color: "var(--color-slate)" },
                    { icon: BarChart3, label: "Accuracy", value: "98.5%", color: "var(--color-ochre)" },
                    { icon: Zap, label: "Scan Time", value: "0.8s", color: "var(--color-terracotta)" },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
                      className="flex flex-col items-center justify-center py-4 px-3 sm:py-5 sm:px-6 rounded-xl bg-white border border-stone-200/80 shadow-[0_4px_12px_rgba(0,0,0,0.02)] text-center gap-1"
                    >
                      <stat.icon size={16} style={{ color: stat.color }} className="flex-shrink-0" />
                      <span className="text-sm sm:text-lg font-extrabold text-stone-800 leading-tight mt-1">{stat.value}</span>
                      <span className="text-[8px] sm:text-[10px] font-bold uppercase text-stone-400 tracking-widest mt-0.5 leading-none">{stat.label}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Recently Sorted Emails Stream (Fills the space beautifully!) */}
                <div className="flex-1 flex flex-col gap-2 overflow-hidden mt-6 sm:mt-8"> {/* Added mt-8 top margin separator */}
                  <div className="text-[9px] sm:text-[10px] font-bold uppercase text-stone-400 tracking-widest mb-1">Classified Activity Stream</div>
                  <div className="flex flex-col gap-2">
                    {activeEmails.map((email, i) => {
                      const theme = CATEGORY_THEMES[email.cat] || CATEGORY_THEMES.Personal;
                      return (
                        <motion.div
                          key={email.sender}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                          className="flex items-center justify-between py-3.5 px-4 rounded-lg bg-stone-50/50 hover:bg-stone-50 border border-stone-100 text-[11px] sm:text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2 overflow-hidden mr-2">
                            <span className="font-semibold text-stone-700 truncate w-[70px] sm:w-[120px]">{email.sender}</span>
                            <span className="text-stone-500 truncate text-[10px] sm:text-xs">{email.subject}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[9px] text-stone-400">{email.time}</span>
                            <span className={`px-2.5 py-1 rounded text-[8px] sm:text-[10px] font-bold border ${theme.bg} ${theme.text} ${theme.border}`}> {/* Smaller cleaner badges */}
                              {email.cat}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom insight bar */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="flex items-center justify-center gap-2 mt-1 py-2 px-3 sm:py-2.5 sm:px-4 rounded-lg bg-[rgba(132,155,135,0.06)] border border-[rgba(132,155,135,0.12)]"
                >
                  <ArrowDownToLine size={12} style={{ color: "var(--color-sage)" }} />
                  <span
                    className="text-[11px] font-medium text-[var(--color-sage)]"
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
