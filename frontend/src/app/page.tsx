"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, Zap, Shield, TrendingUp, Lock, Sparkles } from "lucide-react";
import { auth } from "@/lib/api";

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
    <div className="min-h-screen relative overflow-hidden">
      <div className="mesh-gradient" />
      
      {/* ========== Navigation ========== */}
      <nav style={{ padding: "24px 32px", position: "relative", zIndex: 10 }}>
        <div className="glass-card" style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px 32px", borderRadius: "100px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid rgba(255,255,255,0.6)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, var(--color-accent), #818cf8)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)" }}>
              <Mail size={20} color="#fff" />
            </div>
            <span className="glass-heading" style={{ fontSize: "24px", letterSpacing: "-0.05em" }}>InboxIQ</span>
          </div>
          {isLoggedIn ? (
            <button className="glass-btn-primary" onClick={() => router.push("/dashboard")}>
              Dashboard <ArrowRight size={18} />
            </button>
          ) : (
            <button className="glass-btn" onClick={handleLogin}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* ========== Hero Section ========== */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "100px 32px", textAlign: "center", position: "relative", zIndex: 10 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.7)", padding: "8px 16px", borderRadius: "100px", fontSize: "14px", fontWeight: 600, color: "var(--color-accent)", border: "1px solid rgba(255,255,255,0.9)", marginBottom: "32px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <Sparkles size={16} /> Welcome to the next generation of email
        </div>
        
        <h1 className="glass-heading" style={{ fontSize: "clamp(48px, 8vw, 84px)", lineHeight: 1.1, marginBottom: "32px" }}>
          Transform your inbox into an<br />
          <span style={{ background: "linear-gradient(135deg, var(--color-accent), #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>intelligent workspace.</span>
        </h1>
        
        <p style={{ fontSize: "20px", color: "var(--color-text-secondary)", maxWidth: "700px", margin: "0 auto 48px", lineHeight: 1.6 }}>
          Experience a beautiful, highly polished dashboard that uses AI to decode, categorize, and analyze your digital life.
        </p>
        
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <button className="glass-btn-primary" style={{ padding: "16px 36px", fontSize: "18px" }} onClick={isLoggedIn ? () => router.push("/dashboard") : handleLogin}>
            {isLoggedIn ? "Open Dashboard" : "Connect with Google"}
            <ArrowRight size={20} />
          </button>
          <button className="glass-btn" style={{ padding: "16px 36px", fontSize: "18px" }}>
            <Lock size={18} /> Read-Only Access
          </button>
        </div>
      </section>

      {/* ========== Features Grid ========== */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 32px 120px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          {[
            { title: "AI Categorization", desc: "Every email elegantly sorted into perfectly structured categories.", icon: Zap, color: "#f59e0b" },
            { title: "RAG Pipeline", desc: "Chat fluidly with your inbox. Ask questions, get precise answers.", icon: Sparkles, color: "#a855f7" },
            { title: "Beautiful Analytics", desc: "Heatmaps, charts, and sender rankings wrapped in frosted glass.", icon: TrendingUp, color: "#10b981" },
            { title: "Absolute Privacy", desc: "Strict read-only OAuth scope. Your data is never mutated.", icon: Shield, color: "#3b82f6" },
          ].map((f, i) => (
            <div key={i} className="glass-card" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: `${f.color}15`, color: f.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <f.icon size={24} />
              </div>
              <h3 className="glass-heading" style={{ fontSize: "20px", marginBottom: "12px" }}>{f.title}</h3>
              <p style={{ fontSize: "15px", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
