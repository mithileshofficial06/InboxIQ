"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import {
  Inbox, ArrowRight, Shield, ShieldCheck, Lock, Eye, EyeOff,
  Search, Users, Briefcase, Bell, Sparkles, PieChart,
  Mail, TrendingUp, Zap, ExternalLink, ChevronRight, MessagesSquare
} from "lucide-react";
import { auth } from "@/lib/api";

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: { duration: 1, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
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
  { title: "AI Search", desc: "Natural language queries across your entire email history. Ask anything.", icon: Search, color: "var(--color-slate)", size: "large" },
  { title: "Job Tracker", desc: "Automatically track applications, interviews, and offers from your inbox.", icon: Briefcase, color: "var(--color-ochre)", size: "medium" },
  { title: "People Intelligence", desc: "Understand your network. See who you communicate with most.", icon: Users, color: "var(--color-dusty-rose)", size: "medium" },
  { title: "Subscriptions", desc: "Detect active and dormant subscriptions automatically.", icon: Bell, color: "var(--color-terracotta)", size: "small" },
  { title: "Privacy First", desc: "Read-only access. We never modify your data.", icon: Shield, color: "var(--color-sage)", size: "small" },
  { title: "9 Categories", desc: "Intelligent classification into precise, useful categories.", icon: PieChart, color: "var(--color-text-primary)", size: "small" },
];

/* ─── Counter Component ─── */
function StatCounter({ end, suffix = "", label }: { end: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div ref={ref} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
      style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: "clamp(40px, 5vw, 64px)", letterSpacing: "-0.04em", color: "var(--color-text-primary)", lineHeight: 1 }}
        className="stat-counter">
        {inView ? <CountUp end={end} duration={2.5} separator="," /> : "0"}
        {suffix}
      </div>
      <div style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-tertiary)", marginTop: "12px" }}>
        {label}
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

/* ─── Main Page ─── */
export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -500, y: -500 });
  const [wordIdx, setWordIdx] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  useEffect(() => {
    const token = localStorage.getItem("inboxiq_token");
    if (token) setIsLoggedIn(true);
  }, []);

  /* Rotating words */
  useEffect(() => {
    const interval = setInterval(() => setWordIdx(i => (i + 1) % ROTATING_WORDS.length), 3000);
    return () => clearInterval(interval);
  }, []);

  /* Mouse cursor glow */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const handleLogin = () => { window.location.href = auth.getLoginUrl(); };
  const handleCTA = isLoggedIn ? () => router.push("/dashboard") : handleLogin;

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

      {/* ══════════════════════════════════════
           NAVIGATION
         ══════════════════════════════════════ */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          padding: "16px 48px",
          background: "rgba(250, 249, 246, 0.7)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(229, 226, 219, 0.5)",
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
            <a href="#features" style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-secondary)", textDecoration: "none", transition: "color 0.2s" }}>Features</a>
            <a href="#demo" style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-secondary)", textDecoration: "none", transition: "color 0.2s" }}>Demo</a>
            <a href="#privacy" style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-secondary)", textDecoration: "none", transition: "color 0.2s" }}>Privacy</a>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleCTA}
              style={{
                padding: "8px 20px", background: "var(--color-accent)", color: "#fff",
                fontSize: "13px", fontWeight: 500, border: "none", borderRadius: "6px", cursor: "pointer",
              }}
            >
              {isLoggedIn ? "Dashboard" : "Get Started"}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* ══════════════════════════════════════
           HERO SECTION
         ══════════════════════════════════════ */}
      <motion.section ref={heroRef} style={{ y: heroY, opacity: heroOpacity, position: "relative", zIndex: 2, paddingTop: "180px", paddingBottom: "120px", textAlign: "center" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 32px" }}>

          {/* Badge */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", borderRadius: "100px", background: "rgba(255,255,255,0.6)", border: "1px solid var(--color-border-default)", marginBottom: "40px", fontSize: "13px", fontWeight: 500, color: "var(--color-text-secondary)", backdropFilter: "blur(8px)" }}>
            <Sparkles size={14} color="var(--color-sage)" />
            AI-powered email intelligence
          </motion.div>

          {/* Main Heading */}
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
            style={{ fontSize: "clamp(44px, 7vw, 80px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.04em", color: "var(--color-text-primary)", marginBottom: "0" }}>
            The elegant way to
          </motion.h1>

          {/* Rotating word */}
          <div style={{ height: "clamp(52px, 8vw, 92px)", overflow: "hidden", marginBottom: "32px" }}>
            <AnimatePresence mode="wait">
              <motion.h1
                key={wordIdx}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ fontSize: "clamp(44px, 7vw, 80px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.04em", fontStyle: "italic", color: "var(--color-slate)" }}
              >
                {ROTATING_WORDS[wordIdx]}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* Subtitle */}
          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={3}
            style={{ fontSize: "18px", lineHeight: 1.7, color: "var(--color-text-secondary)", maxWidth: "580px", margin: "0 auto 48px" }}>
            InboxIQ applies refined machine learning to categorize, analyze, and surface insights from your communication data — securely and privately.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
            style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 12px 40px rgba(28, 25, 23, 0.15)" }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCTA}
              style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                padding: "16px 36px", fontSize: "16px", fontWeight: 600,
                background: "var(--color-accent)", color: "#fff",
                border: "none", borderRadius: "8px", cursor: "pointer",
              }}
            >
              {isLoggedIn ? "Open Dashboard" : "Connect with Google"}
              <ArrowRight size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                padding: "16px 36px", fontSize: "16px", fontWeight: 500,
                background: "rgba(255,255,255,0.6)", color: "var(--color-text-primary)",
                border: "1px solid var(--color-border-default)", borderRadius: "8px", cursor: "pointer",
                backdropFilter: "blur(8px)",
              }}
            >
              <Lock size={16} /> Read-Only Access
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* ══════════════════════════════════════
           DASHBOARD PREVIEW
         ══════════════════════════════════════ */}
      <motion.section
        variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
        style={{ position: "relative", zIndex: 2, maxWidth: "1100px", margin: "0 auto 160px", padding: "0 32px" }}
      >
        <div className="dashboard-preview" style={{ padding: "32px", position: "relative" }}>
          {/* Browser chrome */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid var(--color-border-subtle)" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#f87171" }} />
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#fbbf24" }} />
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#4ade80" }} />
            <div style={{ flex: 1, textAlign: "center", fontSize: "12px", color: "var(--color-text-tertiary)", fontWeight: 500 }}>inboxiq.app/dashboard</div>
          </div>
          {/* Fake dashboard grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "20px" }}>
            {[
              { label: "Total Indexed", val: "12,847", color: "var(--color-text-primary)" },
              { label: "Received Today", val: "34", color: "var(--color-slate)" },
              { label: "Daily Average", val: "47", color: "var(--color-sage)" },
              { label: "Unread", val: "128", color: "var(--color-ochre)" },
            ].map(s => (
              <div key={s.label} style={{ padding: "24px 20px", background: "var(--color-bg-primary)", borderRadius: "8px", border: "1px solid var(--color-border-subtle)" }}>
                <div style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-tertiary)", marginBottom: "8px" }}>{s.label}</div>
                <div style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em", color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>
          {/* Chart area */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
            <div style={{ padding: "24px", background: "var(--color-bg-primary)", borderRadius: "8px", border: "1px solid var(--color-border-subtle)", height: "180px", display: "flex", alignItems: "flex-end", gap: "6px" }}>
              {[40, 55, 38, 62, 48, 70, 58, 75, 52, 80, 65, 90, 72, 85, 78, 68, 88, 60, 72, 95].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  style={{ flex: 1, background: i === 19 ? "var(--color-text-primary)" : "var(--color-border-default)", borderRadius: "3px 3px 0 0" }}
                />
              ))}
            </div>
            <div style={{ padding: "24px", background: "var(--color-bg-primary)", borderRadius: "8px", border: "1px solid var(--color-border-subtle)", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { cat: "Real People", pct: 32, color: "var(--color-text-primary)" },
                { cat: "Newsletters", pct: 24, color: "var(--color-slate)" },
                { cat: "Promotions", pct: 18, color: "var(--color-terracotta)" },
                { cat: "Bills", pct: 14, color: "var(--color-ochre)" },
                { cat: "Jobs", pct: 12, color: "var(--color-sage)" },
              ].map(c => (
                <div key={c.cat}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "4px" }}>
                    <span>{c.cat}</span><span>{c.pct}%</span>
                  </div>
                  <div style={{ height: "4px", background: "var(--color-border-subtle)", borderRadius: "2px", overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${c.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      style={{ height: "100%", background: c.color, borderRadius: "2px" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ══════════════════════════════════════
           SCROLL STORYTELLING
         ══════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 2, maxWidth: "800px", margin: "0 auto", padding: "0 32px 160px" }}>
        {[
          { num: "01", title: "Your inbox is chaos.", desc: "Thousands of emails. No structure. No insights. Critical messages buried under promotions and automated alerts." },
          { num: "02", title: "InboxIQ organizes everything.", desc: "Every email is automatically classified into one of nine precise categories—bills, jobs, newsletters, real people, and more." },
          { num: "03", title: "InboxIQ understands everything.", desc: "A RAG pipeline powered by Gemini processes and indexes every message, enabling conversational queries across your entire history." },
          { num: "04", title: "InboxIQ helps you take action.", desc: "Track job applications. Monitor subscriptions. Identify your most important contacts. Get AI-powered insights instantly." },
        ].map((s, i) => (
          <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} custom={0}
            style={{ marginBottom: i < 3 ? "120px" : 0 }}>
            <div style={{ fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-tertiary)", marginBottom: "16px" }}>{s.num}</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text-primary)", marginBottom: "16px", lineHeight: 1.2 }}>{s.title}</h2>
            <p style={{ fontSize: "18px", lineHeight: 1.7, color: "var(--color-text-secondary)", maxWidth: "600px" }}>{s.desc}</p>
          </motion.div>
        ))}
      </section>

      <div className="section-divider" />

      {/* ══════════════════════════════════════
           BENTO FEATURES
         ══════════════════════════════════════ */}
      <section id="features" style={{ position: "relative", zIndex: 2, maxWidth: "1200px", margin: "0 auto", padding: "160px 32px" }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} custom={0}
          style={{ textAlign: "center", marginBottom: "80px" }}>
          <div style={{ fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-tertiary)", marginBottom: "16px" }}>Features</div>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--color-text-primary)", lineHeight: 1.1 }}>
            Everything your inbox<br />
            <span style={{ fontStyle: "italic", color: "var(--color-slate)" }}>should have been.</span>
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gridAutoRows: "minmax(200px, auto)", gap: "24px" }}>
          {BENTO_FEATURES.map((f, i) => {
            const span = f.size === "large" ? "span 4" : f.size === "medium" ? "span 3" : "span 2";
            return (
              <motion.div
                key={f.title}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} custom={i}
                className="bento-card"
                style={{ gridColumn: span, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
              >
                <div>
                  <f.icon size={28} style={{ color: f.color, marginBottom: "24px" }} strokeWidth={1.5} />
                  <h3 style={{ fontSize: f.size === "large" ? "28px" : "20px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-text-primary)", marginBottom: "12px" }}>{f.title}</h3>
                  <p style={{ fontSize: "15px", lineHeight: 1.6, color: "var(--color-text-secondary)", maxWidth: "500px" }}>{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <div className="section-divider" />

      {/* ══════════════════════════════════════
           AI SEARCH DEMO
         ══════════════════════════════════════ */}
      <section id="demo" style={{ position: "relative", zIndex: 2, maxWidth: "900px", margin: "0 auto", padding: "160px 32px", textAlign: "center" }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} custom={0}>
          <div style={{ fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-tertiary)", marginBottom: "16px" }}>Live Demo</div>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--color-text-primary)", marginBottom: "16px", lineHeight: 1.1 }}>
            Ask your inbox<br />
            <span style={{ fontStyle: "italic", color: "var(--color-slate)" }}>anything.</span>
          </h2>
        </motion.div>

        <motion.div variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
          style={{ marginTop: "60px", background: "rgba(255,255,255,0.7)", border: "1px solid var(--color-border-default)", borderRadius: "16px", padding: "40px", backdropFilter: "blur(12px)", textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
            <Search size={20} style={{ color: "var(--color-text-tertiary)" }} />
            <div style={{ fontSize: "18px", fontWeight: 500, color: "var(--color-text-primary)" }}>
              <Typewriter queries={SEARCH_QUERIES} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { subj: "Software Engineer Intern — Google", from: "careers@google.com", match: "94.2%" },
              { subj: "Application Update: Frontend Developer", from: "talent@stripe.com", match: "89.7%" },
              { subj: "Interview Scheduled — SWE Internship", from: "hr@notion.so", match: "86.1%" },
            ].map((r, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", border: "1px solid var(--color-border-subtle)", borderRadius: "8px", background: "rgba(255,255,255,0.5)" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "4px" }}>{r.subj}</div>
                  <div style={{ fontSize: "13px", color: "var(--color-text-tertiary)" }}>{r.from}</div>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-sage)", background: "rgba(132, 155, 135, 0.1)", padding: "4px 10px", borderRadius: "4px" }}>{r.match}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="section-divider" />

      {/* ══════════════════════════════════════
           STATISTICS
         ══════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 2, maxWidth: "1000px", margin: "0 auto", padding: "160px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "48px" }}>
          <StatCounter end={50000} suffix="+" label="Emails Processed" />
          <StatCounter end={98} suffix="%" label="Classification Accuracy" />
          <StatCounter end={9} label="Smart Categories" />
          <StatCounter end={0} label="Emails Modified" />
        </div>
      </section>

      <div className="section-divider" />

      {/* ══════════════════════════════════════
           PRIVACY SECTION
         ══════════════════════════════════════ */}
      <section id="privacy" style={{ position: "relative", zIndex: 2, maxWidth: "1000px", margin: "0 auto", padding: "160px 32px" }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} custom={0}
          style={{ textAlign: "center", marginBottom: "80px" }}>
          <div style={{ fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-tertiary)", marginBottom: "16px" }}>Trust & Privacy</div>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--color-text-primary)", lineHeight: 1.1 }}>
            Your data stays<br />
            <span style={{ fontStyle: "italic", color: "var(--color-sage)" }}>fundamentally yours.</span>
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "32px" }}>
          {[
            { icon: ShieldCheck, title: "Google OAuth", desc: "Industry-standard secure authentication." },
            { icon: Eye, title: "Read-Only Access", desc: "We can only read. Never send, modify, or delete." },
            { icon: Lock, title: "Encrypted Storage", desc: "All indexed data is encrypted at rest." },
            { icon: EyeOff, title: "User-Controlled", desc: "Delete all your data at any time. Full control." },
          ].map((p, i) => (
            <motion.div key={p.title} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} custom={i}
              className="bento-card" style={{ textAlign: "center", padding: "48px 32px" }}>
              <div className="shield-pulse" style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(132, 155, 135, 0.08)", color: "var(--color-sage)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <p.icon size={24} strokeWidth={1.5} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--color-text-primary)", marginBottom: "8px" }}>{p.title}</h3>
              <p style={{ fontSize: "14px", lineHeight: 1.5, color: "var(--color-text-secondary)" }}>{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
          style={{ marginTop: "64px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", flexDirection: "column", gap: "8px", padding: "24px 40px", borderRadius: "12px", background: "rgba(132, 155, 135, 0.05)", border: "1px solid rgba(132, 155, 135, 0.15)" }}>
            {["We never send emails.", "We never modify emails.", "Read-only access only."].map((t, i) => (
              <div key={i} style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-sage)" }}>{t}</div>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="section-divider" />

      {/* ══════════════════════════════════════
           FINAL CTA
         ══════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 2, maxWidth: "800px", margin: "0 auto", padding: "160px 32px", textAlign: "center" }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
          <h2 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--color-text-primary)", marginBottom: "24px", lineHeight: 1.1 }}>
            Ready to understand<br />your inbox?
          </h2>
          <p style={{ fontSize: "18px", lineHeight: 1.7, color: "var(--color-text-secondary)", maxWidth: "500px", margin: "0 auto 48px" }}>
            Connect your Gmail account in seconds. Read-only access. Cancel anytime.
          </p>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 12px 40px rgba(28, 25, 23, 0.15)" }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCTA}
            style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "18px 40px", fontSize: "17px", fontWeight: 600,
              background: "var(--color-accent)", color: "#fff",
              border: "none", borderRadius: "8px", cursor: "pointer",
            }}
          >
            {isLoggedIn ? "Open Dashboard" : "Get Started Free"}
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
           FOOTER
         ══════════════════════════════════════ */}
      <footer style={{ position: "relative", zIndex: 2, borderTop: "1px solid var(--color-border-default)", background: "rgba(255,255,255,0.5)", backdropFilter: "blur(10px)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "24px", height: "24px", background: "var(--color-text-primary)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Inbox size={12} color="#faf9f6" />
            </div>
            <span style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>InboxIQ</span>
          </div>
          <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
            {["Product", "Privacy", "Contact"].map(l => (
              <a key={l} href="#" style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-secondary)", textDecoration: "none", transition: "color 0.2s" }}>{l}</a>
            ))}
            <a href="#" style={{ color: "var(--color-text-secondary)", transition: "color 0.2s" }}>
              <ExternalLink size={18} />
            </a>
          </div>
          <div style={{ fontSize: "13px", color: "var(--color-text-tertiary)" }}>
            © {new Date().getFullYear()} InboxIQ
          </div>
        </div>
      </footer>

    </div>
  );
}
