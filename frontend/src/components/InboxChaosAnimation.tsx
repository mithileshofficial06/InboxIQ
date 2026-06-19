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
const CATEGORY_THEMES: Record<string, { bg: string; text: string; border: string; hex: string }> = {
  Orders: { bg: "bg-[#FDE047]", text: "text-black", border: "border-black", hex: "#FDE047" },
  Jobs: { bg: "bg-[#93C5FD]", text: "text-black", border: "border-black", hex: "#93C5FD" },
  Academic: { bg: "bg-[#A7F3D0]", text: "text-black", border: "border-black", hex: "#A7F3D0" },
  Bills: { bg: "bg-[#FCA5A5]", text: "text-black", border: "border-black", hex: "#FCA5A5" },
  Travel: { bg: "bg-[#C084FC]", text: "text-black", border: "border-black", hex: "#C084FC" },
  Personal: { bg: "bg-[#F472B6]", text: "text-black", border: "border-black", hex: "#F472B6" },
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
  { id: 1, label: "Amazon Order", category: "Orders", icon: ShoppingCart, color: "#FDE047", gradient: "#FDE047" },
  { id: 2, label: "OTP Code", category: "Personal", icon: Key, color: "#F472B6", gradient: "#F472B6" },
  { id: 3, label: "LinkedIn Update", category: "Jobs", icon: Briefcase, color: "#93C5FD", gradient: "#93C5FD" },
  { id: 4, label: "Interview Invite", category: "Jobs", icon: Briefcase, color: "#93C5FD", gradient: "#93C5FD" },
  { id: 5, label: "Newsletter", category: "Personal", icon: Newspaper, color: "#F472B6", gradient: "#F472B6" },
  { id: 6, label: "Bank Statement", category: "Bills", icon: CreditCard, color: "#FCA5A5", gradient: "#FCA5A5" },
  { id: 7, label: "GitHub PR Link", category: "Personal", icon: GitPullRequest, color: "#F472B6", gradient: "#F472B6" },
  { id: 8, label: "College Circular", category: "Academic", icon: GraduationCap, color: "#A7F3D0", gradient: "#A7F3D0" },
  { id: 9, label: "Flight Booking", category: "Travel", icon: Plane, color: "#C084FC", gradient: "#C084FC" },
  { id: 10, label: "Recruiter Email", category: "Jobs", icon: Briefcase, color: "#93C5FD", gradient: "#93C5FD" },
  { id: 11, label: "Electricity Bill", category: "Bills", icon: CreditCard, color: "#FCA5A5", gradient: "#FCA5A5" },
  { id: 12, label: "Exam Results", category: "Academic", icon: GraduationCap, color: "#A7F3D0", gradient: "#A7F3D0" },
  { id: 13, label: "Flipkart Delivery", category: "Orders", icon: ShoppingCart, color: "#FDE047", gradient: "#FDE047" },
  { id: 14, label: "Hotel Confirm", category: "Travel", icon: Plane, color: "#C084FC", gradient: "#C084FC" },
  { id: 15, label: "Internship Update", category: "Jobs", icon: Briefcase, color: "#93C5FD", gradient: "#93C5FD" },
  { id: 16, label: "Credit Card Due", category: "Bills", icon: CreditCard, color: "#FCA5A5", gradient: "#FCA5A5" },
];

const CATEGORIES: CategoryBucketData[] = [
  { name: "Orders", icon: ShoppingCart, color: "#000", gradient: "#FDE047", lightBg: "#FFF" },
  { name: "Jobs", icon: Briefcase, color: "#000", gradient: "#93C5FD", lightBg: "#FFF" },
  { name: "Academic", icon: GraduationCap, color: "#000", gradient: "#A7F3D0", lightBg: "#FFF" },
  { name: "Bills", icon: CreditCard, color: "#000", gradient: "#FCA5A5", lightBg: "#FFF" },
  { name: "Travel", icon: Plane, color: "#000", gradient: "#C084FC", lightBg: "#FFF" },
  { name: "Personal", icon: User, color: "#000", gradient: "#F472B6", lightBg: "#FFF" },
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
        ? 6 + ((i * 11 + 3) % 24)   // Restricted Y range to avoid touching category boxes
        : 6 + ((i * 9 + 5) % 32);   // Restricted Y range to avoid touching category boxes

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
  const bucketsContainerRef = useRef<HTMLDivElement>(null);
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
      
      const headerEl = containerRef.current?.querySelector("div");
      const headerHeight = headerEl ? headerEl.offsetHeight : 64;
      const mainAreaHeight = h - headerHeight;

      const bucketsEl = bucketsContainerRef.current;
      const bucketsHeight = bucketsEl ? bucketsEl.offsetHeight : (isMobile ? 103 : 146);
      const pillHeight = isMobile ? 34 : 44;
      const boundaryY = mainAreaHeight - bucketsHeight - pillHeight;

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
        } else if (p.y > boundaryY) { // boundary to bounce above category buckets
          p.y = boundaryY;
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
        borderRadius: "12px",
        border: "3px solid #000",
        background: "#FFFDF9",
        boxShadow: "8px 8px 0px 0px #000",
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
        className="flex justify-between items-center"
        style={{
          borderBottom: "3px solid #000",
          background: "#FEF08A",
          borderRadius: "9px 9px 0 0",
          paddingLeft: isMobile ? "12px" : "24px",
          paddingRight: isMobile ? "12px" : "24px",
          paddingTop: isMobile ? "10px" : "14px",
          paddingBottom: isMobile ? "10px" : "14px",
        }}
      >
        {/* Left: Title */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center"
            style={{
              width: "32px", height: "32px",
              background: "#ffffff",
              border: "2px solid #000",
              borderRadius: "6px",
            }}
          >
            <Mail size={16} className="text-black stroke-[2.5]" />
          </div>
          <span
            className="text-sm sm:text-base font-extrabold text-black"
            style={{ letterSpacing: "-0.01em" }}
          >
            InboxIQ Classifier
          </span>
        </div>

        {/* Right: Status & Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Processing indicator */}
          <AnimatePresence>
            {phase === "sorting" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="hidden sm:flex items-center gap-2"
                style={{
                  background: "#fff",
                  border: "2px solid #000",
                  borderRadius: "6px",
                  padding: isMobile ? "6px 12px" : "8px 16px",
                }}
              >
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="block rounded-full bg-emerald-500"
                  style={{ width: "8px", height: "8px" }}
                />
                <span
                  className="text-xs font-extrabold text-black"
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
              whileHover={{ x: -1, y: -1, boxShadow: "3px 3px 0px #000" }}
              whileTap={{ x: 1, y: 1, boxShadow: "1px 1px 0px #000" }}
              onClick={handleTrigger}
              className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-extrabold"
              style={{
                background: "#FB923C", // Orange
                color: "#000",
                border: "2px solid #000",
                boxShadow: "2px 2px 0px #000",
                borderRadius: "6px",
                padding: isMobile ? "6px 12px" : "8px 18px",
              }}
            >
              <Sparkles size={14} className="stroke-[2.5]" />
              <span>Organize Now</span>
            </motion.button>
          )}

          {/* Replay button (done or burst phase) */}
          {(phase === "done" || phase === "burst") && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ x: -1, y: -1, boxShadow: "3px 3px 0px #000" }}
              whileTap={{ x: 1, y: 1, boxShadow: "1px 1px 0px #000" }}
              onClick={handleReplay}
              className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-extrabold"
              style={{
                color: "#000",
                background: "#fff",
                border: "2px solid #000",
                boxShadow: "2px 2px 0px #000",
                borderRadius: "6px",
                padding: isMobile ? "6px 12px" : "8px 18px",
              }}
            >
              <RotateCcw size={13} className="stroke-[2.5]" />
              Replay
            </motion.button>
          )}

          {/* Phase badge */}
          <div
            className="flex items-center justify-center"
            style={{
              background: phase === "chaos" ? "#E5E7EB" : phase === "sorting" ? "#93C5FD" : phase === "burst" ? "#C084FC" : "#86EFAC",
              border: "2px solid #000",
              boxShadow: "2px 2px 0px #000",
              borderRadius: "6px",
              padding: isMobile ? "6px 12px" : "8px 18px",
            }}
          >
            <span
              className="text-[10px] sm:text-xs font-black uppercase text-black"
              style={{
                letterSpacing: "0.08em",
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
              className="flex flex-col items-center gap-3 px-8 py-6 rounded-xl min-w-[280px]"
              style={{
                position: "absolute",
                left: "50%",
                top: "40%",
                transform: "translate(-50%, -50%)",
                zIndex: 50,
                background: "#86EFAC", // Neubrutalist green
                border: "3px solid #000",
                boxShadow: "6px 6px 0px #000",
              }}
            >
              <div
                className="flex items-center justify-center rounded-full bg-white text-black"
                style={{
                  width: "44px",
                  height: "44px",
                  border: "2px solid #000",
                  boxShadow: "2.5px 2.5px 0px #000",
                }}
              >
                <CheckCircle2 size={22} className="stroke-[2.5] animate-bounce" />
              </div>
              <span className="text-sm sm:text-base font-black text-black tracking-tight leading-none mt-1">
                Scanning Successful!
              </span>
              <div
                className="px-3 py-1 mt-2 bg-white border-2 border-black rounded text-[9px] sm:text-[10px] font-black text-black uppercase tracking-wider shadow-[1.5px_1.5px_0px_#000]"
              >
                AI Pipeline Complete
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── AI Processing Core (Neubrutalist Centerpiece) ── */}
        <AnimatePresence>
          {phase !== "done" && phase !== "burst" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center justify-center"
            >
              {/* Rotating outer scanner line */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute border-2 border-dashed border-black rounded-full"
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

              {/* The Neubrutalist Core (Diamond shape) */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                className="relative z-10 w-16 h-16 flex flex-col items-center justify-center"
                style={{
                  background: "#FEF08A", // Neubrutalist yellow
                  border: "3px solid #000",
                  boxShadow: "4px 4px 0px #000",
                  borderRadius: "8px",
                }}
              >
                <Sparkles
                  size={24}
                  className="relative z-20 text-black transition-transform duration-300 stroke-[2.5]"
                  style={{
                    transform: "rotate(-360deg)",
                  }}
                />
              </motion.div>

              {/* Dynamic Refraction Sparkle Flash */}
              <AnimatePresence>
                {isRefracting && refractingColor && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: [0.5, 1.8, 0.5], opacity: [0, 1, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="absolute z-20 w-14 h-14"
                    style={{
                      background: refractingColor,
                      border: "2px solid #000",
                      borderRadius: "9999px",
                      boxShadow: "3px 3px 0px #000",
                    }}
                  />
                )}
              </AnimatePresence>
              
              <div 
                className="relative z-20 text-[10px] sm:text-xs font-black text-black uppercase tracking-wider border-2 border-black rounded bg-white shadow-[2px_2px_0px_#000] mt-5 whitespace-nowrap"
                style={{
                  padding: isMobile ? "5px 12px" : "8px 18px",
                }}
              >
                {phase === "sorting" ? (showSuccessBanner ? "Successful" : "Scanning") : "AI Prism"}
              </div>
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
                className={`absolute z-10 flex items-center bg-white border-2 border-black shadow-[3px_3px_0px_#000] cursor-default whitespace-nowrap ${
                  isMobile
                    ? "rounded-md text-[11px] gap-1.5"
                    : "rounded-lg text-xs sm:text-sm gap-2.5"
                }`}
                style={{
                  paddingLeft: isMobile ? "6px" : "10px",
                  paddingRight: isMobile ? "14px" : "20px",
                  paddingTop: isMobile ? "6px" : "8px",
                  paddingBottom: isMobile ? "6px" : "8px",
                }}
              >
                {(() => {
                  const theme = CATEGORY_THEMES[pill.category] || CATEGORY_THEMES.Personal;
                  return (
                    <>
                      <div className={`flex items-center justify-center border border-black flex-shrink-0 ${
                        isMobile ? "h-5 w-5 rounded" : "h-7 w-7 rounded-md"
                      } ${theme.bg} ${theme.text} ${theme.border}`}>
                        <PillIcon size={isMobile ? 11 : 13} className="stroke-[2.5]" />
                      </div>
                      <span className="font-extrabold tracking-tight text-black text-[11px] sm:text-[13px]">
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
                  className={`absolute z-30 flex items-center bg-white border-2 border-black shadow-[3px_3px_0px_#000] whitespace-nowrap ${
                    isMobile
                      ? "rounded-md text-[11px] gap-1.5"
                      : "rounded-lg text-xs sm:text-sm gap-2.5"
                  }`}
                  style={{
                    left: 0,
                    top: 0,
                    transform: "translate3d(0, 0, 0)",
                    paddingLeft: isMobile ? "6px" : "10px",
                    paddingRight: isMobile ? "14px" : "20px",
                    paddingTop: isMobile ? "6px" : "8px",
                    paddingBottom: isMobile ? "6px" : "8px",
                  }}
                >
                  <div className={`flex items-center justify-center border border-black flex-shrink-0 ${
                    isMobile ? "h-5 w-5 pr-0 rounded" : "h-7 w-7 pr-0 rounded-md"
                  } ${theme.bg} ${theme.text} ${theme.border}`}>
                    <PillIcon size={isMobile ? 11 : 13} className="stroke-[2.5]" />
                  </div>
                  <span className="font-extrabold tracking-tight text-black text-[11px] sm:text-[13px]">
                    {pill.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Category Buckets ── */}
        <div
          ref={bucketsContainerRef}
          className="absolute bottom-0 left-0 right-0 grid gap-2 sm:gap-4 z-20"
          style={{
            gridTemplateColumns: "repeat(6, 1fr)",
            background: "#FFFDF9",
            borderTop: "3px solid #000",
            paddingLeft: isMobile ? "18px" : "28px",
            paddingRight: isMobile ? "18px" : "28px",
            paddingBottom: isMobile ? "20px" : "30px",
            paddingTop: isMobile ? "14px" : "22px",
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
                className={`flex flex-col items-center justify-center transition-all duration-200 ${
                  isMobile ? "py-2 px-1 gap-1" : "py-3 px-2 gap-2"
                }`}
                style={{
                  borderRadius: "8px",
                  border: "2px solid #000",
                  boxShadow: isFlashing ? "4px 4px 0px #000" : "2px 2px 0px #000",
                  transform: isFlashing ? "translate(-2px, -2px)" : "none",
                  background: count > 0 ? cat.gradient : "#FFF",
                  transition: "background-color 0.2s, transform 0.1s, box-shadow 0.1s",
                }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: isMobile ? "24px" : "32px",
                    height: isMobile ? "24px" : "32px",
                    background: "#FFF",
                    border: "1.5px solid #000",
                    borderRadius: "4px",
                  }}
                >
                  <CatIcon
                    size={isMobile ? 12 : 15}
                    style={{ color: "#000" }}
                    strokeWidth={2.5}
                  />
                </div>
                <span
                  className="font-black text-center leading-none tracking-tight text-black text-[11px] sm:text-[14px]"
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
                    className="font-black tabular-nums leading-none text-black text-sm sm:text-2xl mt-0.5"
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
              className="absolute bottom-[110px] sm:bottom-[150px] left-4 right-4 sm:left-6 sm:right-6 z-20"
            >
              <div
                className="overflow-hidden"
                style={{
                  height: isMobile ? "10px" : "16px",
                  background: "#FFF",
                  border: "2px solid #000",
                  borderRadius: "4px",
                  boxShadow: "2px 2px 0px #000",
                }}
              >
                <motion.div
                  className="h-full"
                  style={{
                    background: "#86EFAC",
                    borderRight: progress > 0 ? "2px solid #000" : "none",
                  }}
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
              className="absolute flex flex-col justify-start"
              style={{
                top: isMobile ? "16px" : "24px",
                bottom: isMobile ? "110px" : "170px",
                left: isMobile ? "12px" : "24px",
                right: isMobile ? "12px" : "24px",
                overflow: "hidden",
                zIndex: 25,
                paddingTop: isMobile ? "12px" : "18px",
                paddingBottom: isMobile ? "12px" : "18px",
              }}
            >
              {/* Dashboard Content Container */}
              <div className="flex-1 flex flex-col gap-4 sm:gap-5 w-full mx-auto" style={{ maxWidth: "1000px" }}>
                
                {/* Search Bar / Header */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-between bg-white"
                  style={{
                    border: "2px solid #000",
                    borderRadius: "8px",
                    boxShadow: "2px 2px 0px #000",
                    marginBottom: isMobile ? "4px" : "10px",
                    padding: isMobile ? "10px 16px" : "12px 24px",
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Search size={14} className="text-black flex-shrink-0" />
                    <span className="text-[11px] sm:text-xs text-stone-800 font-extrabold truncate mr-2">
                      Ask AI to search and analyze your sorted emails...
                    </span>
                  </div>
                  <div 
                    className="flex items-center gap-1.5 bg-[#86EFAC] text-black border-2 border-black text-[10px] sm:text-[11px] font-black flex-shrink-0 shadow-[1.5px_1.5px_0px_#000] rounded"
                    style={{
                      padding: "4px 8px",
                    }}
                  >
                    <CheckCircle2 size={10} className="stroke-[2.5]" />
                    <span>Real-time</span>
                  </div>
                </motion.div>

                {/* Staggered Stats Cards */}
                <div className="grid grid-cols-4 gap-3 sm:gap-5">
                  {[
                    { icon: TrendingUp, label: "Sorted", value: "16", bg: "#A7F3D0" },
                    { icon: PieChart, label: "Buckets", value: "6", bg: "#C084FC" },
                    { icon: BarChart3, label: "Accuracy", value: "98.5%", bg: "#FDE047" },
                    { icon: Zap, label: "Scan Time", value: "0.8s", bg: "#FCA5A5" },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
                      className="flex flex-col items-center justify-center text-center gap-0.5"
                      style={{
                        background: stat.bg,
                        border: "2px solid #000",
                        borderRadius: "8px",
                        boxShadow: "3px 3px 0px #000",
                        padding: isMobile ? "8px 4px" : "14px 8px",
                      }}
                    >
                      <stat.icon size={15} style={{ color: "#000" }} className="flex-shrink-0 stroke-[2.5]" />
                      <span className="text-sm sm:text-lg font-black text-black leading-none mt-1.5">{stat.value}</span>
                      <span className="text-[9px] sm:text-[10px] font-black uppercase text-black tracking-wider mt-1 leading-none">{stat.label}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Recently Sorted Emails Stream (Fills the space beautifully!) */}
                <div className="flex-1 flex flex-col gap-2 overflow-hidden mt-4 sm:mt-6">
                  <div className="text-[10px] sm:text-[11px] font-black text-black uppercase tracking-wider mb-1 px-1">Classified Activity Stream</div>
                  <div className="flex flex-col gap-2">
                    {activeEmails.map((email, i) => {
                      const theme = CATEGORY_THEMES[email.cat] || CATEGORY_THEMES.Personal;
                      return (
                        <motion.div
                          key={email.sender}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                          className="flex items-center justify-between rounded bg-white border-2 border-black text-xs sm:text-sm transition-colors hover:bg-stone-50"
                          style={{
                            boxShadow: "2px 2px 0px #000",
                            padding: isMobile ? "8px 12px" : "12px 18px",
                          }}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden mr-3">
                            <span className="font-extrabold text-black truncate text-[11px] sm:text-xs w-[70px] sm:w-[120px]">{email.sender}</span>
                            <span className="text-black font-extrabold truncate text-[10px] sm:text-xs">{email.subject}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[10px] sm:text-[11px] font-black text-black">{email.time}</span>
                            <span 
                              className={`rounded text-[9px] sm:text-[10px] font-black border-2 border-black ${theme.bg} ${theme.text} shadow-[1px_1px_0px_#000]`}
                              style={{
                                padding: "3px 8px",
                              }}
                            >
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
                  className="flex items-center justify-center gap-2 mt-1"
                  style={{
                    background: "#A7F3D0", // pastel green
                    border: "2px solid #000",
                    borderRadius: "6px",
                    boxShadow: "2px 2px 0px #000",
                    padding: isMobile ? "8px 12px" : "12px 18px",
                  }}
                >
                  <ArrowDownToLine size={12} style={{ color: "#000" }} className="stroke-[2.5] animate-bounce" />
                  <span
                    className="text-[11px] sm:text-xs font-black text-black uppercase tracking-wider"
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
