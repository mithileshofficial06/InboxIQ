"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, Zap, Shield, TrendingUp, Lock, ArrowUpRight } from "lucide-react";
import { auth } from "@/lib/api";

const CATEGORIES = [
  { name: "Bills & Invoices", color: "badge-bills" },
  { name: "Job Applications", color: "badge-jobs" },
  { name: "Orders & Deliveries", color: "badge-orders" },
  { name: "Real People", color: "badge-people" },
  { name: "Academic", color: "badge-academic" },
  { name: "Newsletters", color: "badge-newsletters" },
  { name: "Promotions", color: "badge-promos" },
  { name: "Travel & Bookings", color: "badge-travel" },
  { name: "OTPs & Notifications", color: "badge-otps" },
];

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("inboxiq_token");
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLogin = () => {
    window.location.href = auth.getLoginUrl();
  };

  return (
    <div className="min-h-screen">
      {/* ========== Navigation ========== */}
      <nav
        style={{
          padding: "24px 32px",
          borderBottom: "4px solid var(--color-border-default)",
          background: "var(--color-bg-primary)",
        }}
        className="sticky top-0 z-50"
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", background: "var(--color-accent)", border: "3px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "3px 3px 0px 0px #fff" }}>
              <Mail size={24} color="#000" />
            </div>
            <span className="brutal-text" style={{ fontSize: "28px" }}>InboxIQ</span>
          </div>
          {isLoggedIn ? (
            <button className="brutal-btn" onClick={() => router.push("/dashboard")}>
              Dashboard <ArrowRight size={20} />
            </button>
          ) : (
            <button className="brutal-btn" onClick={handleLogin}>
              SIGN IN
            </button>
          )}
        </div>
      </nav>

      {/* ========== Hero Section ========== */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "100px 32px", borderBottom: "4px solid var(--color-border-default)" }}>
        <div style={{ display: "inline-block", background: "var(--color-accent)", color: "#000", padding: "8px 16px", border: "3px solid #fff", fontFamily: "var(--font-mono)", fontWeight: 800, textTransform: "uppercase", marginBottom: "32px", boxShadow: "4px 4px 0px 0px #fff" }}>
          * SYSTEM ONLINE *
        </div>
        <h1 className="brutal-text" style={{ fontSize: "clamp(60px, 10vw, 120px)", lineHeight: 0.9, marginBottom: "32px" }}>
          YOUR INBOX <br />
          <span className="brutal-text-accent">DECODED.</span>
        </h1>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "20px", maxWidth: "700px", marginBottom: "48px", borderLeft: "6px solid var(--color-accent)", paddingLeft: "24px" }}>
          InboxIQ rips your Gmail data out of the standard UI and forces it into an AI-powered, RAG-indexed analytical powerhouse. No soft edges. Just data.
        </p>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <button className="brutal-btn" style={{ padding: "20px 40px", fontSize: "20px" }} onClick={isLoggedIn ? () => router.push("/dashboard") : handleLogin}>
            {isLoggedIn ? "OPEN DASHBOARD" : "CONNECT GMAIL"}
            <ArrowUpRight size={28} />
          </button>
          <button className="brutal-btn-ghost" style={{ padding: "20px 40px", fontSize: "20px" }}>
            <Lock size={20} /> READ-ONLY
          </button>
        </div>
      </section>

      {/* ========== Marquee (Fake) ========== */}
      <div style={{ borderBottom: "4px solid #fff", background: "var(--color-accent)", color: "#000", padding: "16px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
        <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "24px", fontWeight: 900, letterSpacing: "2px" }}>
          // VECTOR SEARCH // LLM CLASSIFICATION // SENTIMENT ANALYSIS // READ-ONLY ACCESS // 100% PRIVATE // PGVECTOR ENGINE //
        </h2>
      </div>

      {/* ========== Features Grid ========== */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "40px" }}>
          {[
            { title: "AI Categorization", desc: "Every email aggressively sorted into 9 exact categories. No exceptions.", icon: Zap },
            { title: "RAG Pipeline", desc: "Chat directly with your inbox. Ask questions, get brutal, accurate answers.", icon: ArrowRight },
            { title: "Analytics", desc: "Heatmaps, volume charts, sender rankings. Raw statistics of your life.", icon: TrendingUp },
            { title: "Privacy First", desc: "Read-only OAuth scope. We pull data, we never mutate. It's yours.", icon: Shield },
          ].map((f, i) => (
            <div key={i} className="brutal-card">
              <f.icon size={48} style={{ color: "var(--color-accent)", marginBottom: "24px" }} />
              <h3 className="brutal-text" style={{ fontSize: "24px", marginBottom: "16px" }}>{f.title}</h3>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "16px", color: "var(--color-text-secondary)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== Categories Block ========== */}
      <section style={{ borderTop: "4px solid #fff", borderBottom: "4px solid #fff", background: "var(--color-bg-secondary)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 32px" }}>
          <h2 className="brutal-text" style={{ fontSize: "48px", marginBottom: "40px" }}>CLASSIFICATIONS</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            {CATEGORIES.map(c => (
              <span key={c.name} className={`badge ${c.color}`} style={{ fontSize: "20px", padding: "12px 24px" }}>
                {c.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========== Footer ========== */}
      <footer style={{ padding: "40px 32px", textAlign: "center", fontFamily: "var(--font-mono)" }}>
        <h3 className="brutal-text" style={{ fontSize: "24px", marginBottom: "12px" }}>INBOXIQ</h3>
        <p style={{ color: "var(--color-text-secondary)" }}>BUILT WITH NEXT.JS, FASTAPI & PGVECTOR.</p>
      </footer>
    </div>
  );
}
