"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import {
  Inbox, ArrowRight, Shield, ShieldCheck, Lock, Eye, EyeOff,
  Search, Users, Briefcase, Bell, Sparkles, PieChart,
  Mail, TrendingUp, Zap, ExternalLink, ChevronRight, MessagesSquare,
  BarChart3, Globe, FileText, Layers, Clock
} from "lucide-react";
import { auth } from "@/lib/api";
import InboxChaosAnimation from "@/components/InboxChaosAnimation";

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as const }
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: { duration: 1, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] as const }
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] as const }
  },
};

/* ─── Email Particles ─── */
const PARTICLES = [
  "✉ GitHub", "✉ Google", "✉ Amazon", "✉ LinkedIn",
  "✉ Interview Invite", "✉ Internship Update", "✉ Netflix",
  "✉ AWS Billing", "✉ Recruiter", "✉ Stripe Invoice",
  "✉ Flight Booking", "✉ University", "✉ Slack",
  "✉ DocuSign", "✉ Figma", "✉ Notion",
];

/* ─── Rotating Words ─── */
const ROTATING_WORDS = [
  "understand your email.",
  "understand your career.",
  "understand your relationships.",
  "understand your digital life.",
];

/* ─── Search Queries ─── */
const SEARCH_QUERIES = [
  "Show all internship applications",
  "Which recruiter replied fastest?",
  "Summarize my Amazon emails",
  "How many subscriptions do I have?",
];

/* ─── Bento Features ─── */
const BENTO_FEATURES = [
  { title: "AI-Powered Search", desc: "Natural language queries across your entire email history. Ask anything — 'Show my Amazon orders from last month' or 'Which recruiter replied fastest?'", icon: Search, color: "var(--color-slate)", size: "large", extra: "Powered by Gemini + RAG Pipeline" },
  { title: "Career Pipeline", desc: "Automatically detect and track job applications, interview invitations, and offer letters across your inbox.", icon: Briefcase, color: "var(--color-ochre)", size: "medium", extra: "5 stages tracked" },
  { title: "People Intelligence", desc: "Visualize your communication network. See who you email most, response patterns, and relationship strength.", icon: Users, color: "var(--color-dusty-rose)", size: "medium", extra: "Top senders ranked" },
  { title: "Subscription Tracker", desc: "Detect active and dormant subscriptions. Find forgotten services you're still paying for.", icon: Bell, color: "var(--color-terracotta)", size: "small", extra: "Dead subs detected" },
  { title: "Privacy Shield", desc: "Strict read-only OAuth. We never send, modify, or delete any of your emails.", icon: Shield, color: "var(--color-sage)", size: "small", extra: "Zero-write access" },
  { title: "Smart Categories", desc: "Every email is classified into one of nine intelligent categories automatically.", icon: PieChart, color: "var(--color-text-primary)", size: "small", extra: "9 precise buckets" },
];

/* ─── Counter Component ─── */
function StatCounter({ end, suffix = "", label, desc }: { end: number; suffix?: string; label: string; desc: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div ref={ref} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
      style={{ textAlign: "center", padding: "32px 16px" }}>
      <div style={{ fontWeight: 800, fontSize: "clamp(40px, 5vw, 56px)", letterSpacing: "-0.04em", color: "var(--color-text-primary)", lineHeight: 1 }}
        className="stat-counter">
        {inView ? <CountUp end={end} duration={2.5} separator="," /> : "0"}
        {suffix}
      </div>
      <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--color-text-primary)", marginTop: "12px" }}>
        {label}
      </div>
      <div style={{ fontWeight: 400, fontSize: "13px", color: "var(--color-text-tertiary)", marginTop: "4px" }}>
        {desc}
      </div>
    </motion.div>
  );
}

/* ─── Typewriter Component ─── */
function Typewriter({ queries }: { queries: string[] }) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = queries[idx];
    const speed = deleting ? 30 : 60;

    if (!deleting && text === current) {
      const t = setTimeout(() => setDeleting(true), 2000);
      return () => clearTimeout(t);
    }
    if (deleting && text === "") {
      setDeleting(false);
      setIdx((idx + 1) % queries.length);
      return;
    }

    const t = setTimeout(() => {
      setText(deleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1));
    }, speed);
    return () => clearTimeout(t);
  }, [text, deleting, idx, queries]);

  return (
    <span>
      {text}
      <span className="typing-cursor" />
    </span>
  );
}

/* HeroCanvas removed — replaced by InboxChaosAnimation component */

/* ═══════════════════════════════
   MAIN PAGE
   ═══════════════════════════════ */
export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -500, y: -500 });
  const [wordIdx, setWordIdx] = useState(0);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  useEffect(() => {
    const token = localStorage.getItem("inboxiq_token");
    if (token) setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setWordIdx(i => (i + 1) % ROTATING_WORDS.length), 3000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const handleLogin = () => { window.location.href = auth.getLoginUrl(); };
  const handleCTA = isLoggedIn ? () => router.push("/dashboard") : handleLogin;

  /* ─── Section style helpers ─── */
  const sectionLight = { background: "var(--color-bg-primary)" };
  const sectionWhite = { background: "var(--color-bg-secondary)", borderTop: "1px solid var(--color-border-default)", borderBottom: "1px solid var(--color-border-default)" };
  const sectionWarm = { background: "var(--color-bg-tertiary)", borderTop: "1px solid var(--color-border-default)", borderBottom: "1px solid var(--color-border-default)" };

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>

      {/* ─── Aurora Background ─── */}
      <div className="aurora-bg">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
      </div>

      {/* ─── Cursor Glow ─── */}
      <div className="cursor-glow" style={{ left: cursorPos.x, top: cursorPos.y }} />

      {/* ─── Floating Email Particles ─── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        {PARTICLES.map((p, i) => (
          <div key={i} className="email-particle" style={{
            left: `${5 + (i * 6.25) % 90}%`,
            top: `${100 + (i * 17) % 40}%`,
            animationDelay: `${i * 2.2}s`,
            animationDuration: `${25 + (i % 5) * 5}s`,
            opacity: 0,
          }}>
            {p}
          </div>
        ))}
      </div>

      {/* ═══════ NAVIGATION ═══════ */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          padding: "16px 48px",
          background: "rgba(250, 249, 246, 0.8)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(229, 226, 219, 0.6)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "28px", height: "28px", background: "var(--color-text-primary)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Inbox size={14} color="#faf9f6" />
            </div>
            <span style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text-primary)" }}>InboxIQ</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <a href="#features" style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-secondary)", textDecoration: "none" }}>Features</a>
            <a href="#demo" style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-secondary)", textDecoration: "none" }}>Demo</a>
            <a href="#privacy" style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-secondary)", textDecoration: "none" }}>Privacy</a>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleCTA}
              style={{ padding: "8px 20px", background: "var(--color-accent)", color: "#fff", fontSize: "13px", fontWeight: 500, border: "none", borderRadius: "6px", cursor: "pointer" }}
            >
              {isLoggedIn ? "Dashboard" : "Get Started"}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* ═══════ HERO SECTION (with live canvas) ═══════ */}
      <motion.section style={{ y: heroY, opacity: heroOpacity, position: "relative", zIndex: 2, paddingTop: "140px", paddingBottom: "60px", textAlign: "center", overflow: "hidden" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 32px", position: "relative", zIndex: 1 }}>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", borderRadius: "100px", background: "rgba(255,255,255,0.7)", border: "1px solid var(--color-border-default)", marginBottom: "32px", fontSize: "13px", fontWeight: 500, color: "var(--color-text-secondary)", backdropFilter: "blur(8px)" }}>
            <Sparkles size={14} color="var(--color-sage)" />
            AI-powered email intelligence
          </motion.div>

          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
            style={{ fontSize: "clamp(40px, 6.5vw, 76px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.04em", color: "var(--color-text-primary)", marginBottom: "0" }}>
            The elegant way to
          </motion.h1>

          <div style={{ height: "clamp(48px, 7vw, 86px)", overflow: "hidden", marginBottom: "24px" }}>
            <AnimatePresence mode="wait">
              <motion.h1
                key={wordIdx}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ fontSize: "clamp(40px, 6.5vw, 76px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.04em", fontStyle: "italic", color: "var(--color-slate)" }}
              >
                {ROTATING_WORDS[wordIdx]}
              </motion.h1>
            </AnimatePresence>
          </div>

          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={3}
            style={{ fontSize: "17px", lineHeight: 1.7, color: "var(--color-text-secondary)", maxWidth: "560px", margin: "0 auto 36px" }}>
            InboxIQ applies refined machine learning to categorize, analyze, and surface insights from your communication data — securely and privately.
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
            style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "16px" }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 12px 40px rgba(28, 25, 23, 0.15)" }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCTA}
              style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "14px 32px", fontSize: "15px", fontWeight: 600, background: "var(--color-accent)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}
            >
              {isLoggedIn ? "Open Dashboard" : "Connect with Google"}
              <ArrowRight size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "14px 32px", fontSize: "15px", fontWeight: 500, background: "rgba(255,255,255,0.7)", color: "var(--color-text-primary)", border: "1px solid var(--color-border-default)", borderRadius: "8px", cursor: "pointer", backdropFilter: "blur(8px)" }}
            >
              <Lock size={14} /> Read-Only Access
            </motion.button>
          </motion.div>

          {/* Trusted by line */}
          <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={5}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "24px", fontSize: "12px", fontWeight: 500, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <span style={{ width: "32px", height: "1px", background: "var(--color-border-default)" }} />
            Powered by Google OAuth & Gemini AI
            <span style={{ width: "32px", height: "1px", background: "var(--color-border-default)" }} />
          </motion.div>

        </div>
      </motion.section>

      {/* ═══════ INBOX CHAOS ANIMATION ═══════ */}
      <section style={{ ...sectionWhite, position: "relative", zIndex: 2, padding: "80px 32px" }}>
        <motion.div
          variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
          style={{ maxWidth: "1100px", margin: "0 auto" }}
        >
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-tertiary)", marginBottom: "12px" }}>See It In Action</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--color-text-primary)" }}>From chaos to <span style={{ fontStyle: "italic", color: "var(--color-slate)" }}>organized intelligence.</span></h2>
          </div>
          <InboxChaosAnimation />
        </motion.div>
      </section>

      {/* ═══════ SCROLL STORYTELLING ═══════ */}
      <section style={{ ...sectionLight, position: "relative", zIndex: 2, padding: "80px 32px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "48px 64px" }}>
          {[
            { num: "01", title: "Your inbox is chaos.", desc: "Thousands of emails. No structure. No insights. Critical messages buried under promotions and automated alerts.", icon: Inbox },
            { num: "02", title: "InboxIQ organizes everything.", desc: "Every email is automatically classified into one of nine precise categories — bills, jobs, newsletters, real people, and more.", icon: Layers },
            { num: "03", title: "InboxIQ understands everything.", desc: "A RAG pipeline powered by Gemini processes and indexes every message, enabling conversational queries across your entire history.", icon: Globe },
            { num: "04", title: "InboxIQ helps you take action.", desc: "Track job applications. Monitor subscriptions. Identify your most important contacts. Get AI-powered insights instantly.", icon: Zap },
          ].map((s, i) => (
            <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} custom={0}
              style={{ padding: "32px", borderRadius: "12px", border: "1px solid var(--color-border-default)", background: "var(--color-bg-secondary)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--color-bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <s.icon size={18} style={{ color: "var(--color-text-primary)" }} strokeWidth={1.5} />
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-tertiary)" }}>Step {s.num}</div>
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-text-primary)", marginBottom: "12px", lineHeight: 1.3 }}>{s.title}</h3>
              <p style={{ fontSize: "15px", lineHeight: 1.7, color: "var(--color-text-secondary)" }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ BENTO FEATURES ═══════ */}
      <section id="features" style={{ ...sectionWhite, position: "relative", zIndex: 2, padding: "80px 32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} custom={0}
            style={{ textAlign: "center", marginBottom: "56px" }}>
            <div style={{ fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-tertiary)", marginBottom: "12px" }}>Features</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--color-text-primary)", lineHeight: 1.2 }}>
              Everything your inbox <span style={{ fontStyle: "italic", color: "var(--color-slate)" }}>should have been.</span>
            </h2>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gridAutoRows: "minmax(180px, auto)", gap: "20px" }}>
            {BENTO_FEATURES.map((f, i) => {
              const span = f.size === "large" ? "span 4" : f.size === "medium" ? "span 3" : "span 2";
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} custom={i}
                  className="bento-card"
                  style={{ gridColumn: span, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "32px" }}
                >
                  <div>
                    <f.icon size={24} style={{ color: f.color, marginBottom: "20px" }} strokeWidth={1.5} />
                    <h3 style={{ fontSize: f.size === "large" ? "24px" : "18px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-text-primary)", marginBottom: "8px" }}>{f.title}</h3>
                    <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--color-text-secondary)", maxWidth: "500px" }}>{f.desc}</p>
                  </div>
                  <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--color-border-subtle)" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-tertiary)" }}>{f.extra}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ AI SEARCH DEMO ═══════ */}
      <section id="demo" style={{ ...sectionLight, position: "relative", zIndex: 2, padding: "80px 32px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} custom={0}
            style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-tertiary)", marginBottom: "12px" }}>Live Demo</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--color-text-primary)", lineHeight: 1.2 }}>
              Ask your inbox <span style={{ fontStyle: "italic", color: "var(--color-slate)" }}>anything.</span>
            </h2>
          </motion.div>

          <motion.div variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
            style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border-default)", borderRadius: "12px", padding: "32px", textAlign: "left", boxShadow: "0 20px 60px -15px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid var(--color-border-subtle)" }}>
              <Search size={18} style={{ color: "var(--color-text-tertiary)" }} />
              <div style={{ fontSize: "16px", fontWeight: 500, color: "var(--color-text-primary)" }}>
                <Typewriter queries={SEARCH_QUERIES} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { subj: "Software Engineer Intern — Google", from: "careers@google.com", match: "94.2%", date: "Jun 14" },
                { subj: "Application Update: Frontend Developer", from: "talent@stripe.com", match: "89.7%", date: "Jun 12" },
                { subj: "Interview Scheduled — SWE Internship", from: "hr@notion.so", match: "86.1%", date: "Jun 10" },
              ].map((r, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", border: "1px solid var(--color-border-subtle)", borderRadius: "8px", background: "var(--color-bg-primary)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "2px" }}>{r.subj}</div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>{r.from} · {r.date}</div>
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-sage)", background: "rgba(132, 155, 135, 0.1)", padding: "4px 10px", borderRadius: "4px", marginLeft: "16px" }}>{r.match}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ STATISTICS ═══════ */}
      <section style={{ ...sectionWarm, position: "relative", zIndex: 2, padding: "80px 32px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-tertiary)", marginBottom: "12px" }}>By The Numbers</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--color-text-primary)" }}>
              Built for <span style={{ fontStyle: "italic", color: "var(--color-slate)" }}>serious scale.</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
            <StatCounter end={50000} suffix="+" label="Emails Processed" desc="Indexed and analyzed" />
            <StatCounter end={98} suffix="%" label="Classification Accuracy" desc="Across all categories" />
            <StatCounter end={9} label="Smart Categories" desc="Precise sorting buckets" />
            <StatCounter end={0} label="Emails Modified" desc="Strict read-only access" />
          </div>
        </div>
      </section>

      {/* ═══════ PRIVACY SECTION ═══════ */}
      <section id="privacy" style={{ ...sectionWhite, position: "relative", zIndex: 2, padding: "80px 32px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} custom={0}
            style={{ textAlign: "center", marginBottom: "56px" }}>
            <div style={{ fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-tertiary)", marginBottom: "12px" }}>Trust & Privacy</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--color-text-primary)", lineHeight: 1.2 }}>
              Your data stays <span style={{ fontStyle: "italic", color: "var(--color-sage)" }}>fundamentally yours.</span>
            </h2>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "48px" }}>
            {[
              { icon: ShieldCheck, title: "Google OAuth", desc: "Industry-standard secure authentication protocol." },
              { icon: Eye, title: "Read-Only Access", desc: "We can only read. Never send, modify, or delete." },
              { icon: Lock, title: "Encrypted Storage", desc: "All indexed data is encrypted at rest and in transit." },
              { icon: EyeOff, title: "User-Controlled", desc: "Delete all your data at any time. Full control." },
            ].map((p, i) => (
              <motion.div key={p.title} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} custom={i}
                style={{ textAlign: "center", padding: "36px 24px", background: "var(--color-bg-primary)", borderRadius: "10px", border: "1px solid var(--color-border-default)" }}>
                <div className="shield-pulse" style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(132, 155, 135, 0.08)", color: "var(--color-sage)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <p.icon size={22} strokeWidth={1.5} />
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "8px" }}>{p.title}</h3>
                <p style={{ fontSize: "13px", lineHeight: 1.5, color: "var(--color-text-secondary)" }}>{p.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
            style={{ textAlign: "center" }}>
            <div style={{ display: "inline-flex", flexDirection: "column", gap: "6px", padding: "20px 36px", borderRadius: "10px", background: "rgba(132, 155, 135, 0.05)", border: "1px solid rgba(132, 155, 135, 0.15)" }}>
              {["We never send emails.", "We never modify emails.", "Read-only access only."].map((t, i) => (
                <div key={i} style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-sage)" }}>{t}</div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section style={{ ...sectionLight, position: "relative", zIndex: 2, padding: "80px 32px", textAlign: "center" }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
          style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--color-text-primary)", marginBottom: "16px", lineHeight: 1.1 }}>
            Ready to understand<br />your inbox?
          </h2>
          <p style={{ fontSize: "16px", lineHeight: 1.7, color: "var(--color-text-secondary)", maxWidth: "480px", margin: "0 auto 36px" }}>
            Connect your Gmail account in seconds. Read-only access. Cancel anytime.
          </p>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 12px 40px rgba(28, 25, 23, 0.15)" }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCTA}
            style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "16px 36px", fontSize: "16px", fontWeight: 600, background: "var(--color-accent)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}
          >
            {isLoggedIn ? "Open Dashboard" : "Get Started Free"}
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer style={{ position: "relative", zIndex: 2, borderTop: "1px solid var(--color-border-default)", background: "var(--color-bg-secondary)", padding: "40px 32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "24px", height: "24px", background: "var(--color-text-primary)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Inbox size={12} color="#faf9f6" />
            </div>
            <span style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>InboxIQ</span>
          </div>
          <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
            {["Product", "Privacy", "Contact"].map(l => (
              <a key={l} href="#" style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-secondary)", textDecoration: "none" }}>{l}</a>
            ))}
            <a href="#" style={{ color: "var(--color-text-secondary)" }}>
              <ExternalLink size={16} />
            </a>
          </div>
          <div style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>
            © {new Date().getFullYear()} InboxIQ
          </div>
        </div>
      </footer>

    </div>
  );
}
