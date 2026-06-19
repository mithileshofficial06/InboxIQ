"use client";

import { Sparkles, Star, Trophy, GraduationCap } from "lucide-react";

const MEMORIES = [
  { id: "1", type: "FIRST", icon: Star, color: "#f59e0b", title: "First Contact", desc: "Awaiting data synchronization to detect your oldest email interactions." },
  { id: "2", type: "OFFER", icon: Trophy, color: "#10b981", title: "Career Offers", desc: "Awaiting data synchronization to detect historic job offers and promotions." },
  { id: "3", type: "EDU", icon: GraduationCap, color: "#a855f7", title: "Academic Milestones", desc: "Awaiting data synchronization to detect university acceptances and degrees." },
  { id: "4", type: "MILE", icon: Sparkles, color: "#0ea5e9", title: "System Milestones", desc: "Awaiting data synchronization to detect major platform achievements." }
];

export default function MemoriesPage() {
  return (
    <div style={{ paddingBottom: "40px" }}>
      <h1 className="glass-heading" style={{ fontSize: "32px", marginBottom: "32px" }}>Archive Highlights</h1>
      
      <div className="glass-card" style={{ marginBottom: "48px", background: "linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.3))", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", background: "var(--color-accent)", filter: "blur(80px)", opacity: 0.2, borderRadius: "50%" }} />
        
        <div style={{ position: "relative", zIndex: 10 }}>
          <div className="glass-badge" style={{ background: "rgba(79, 70, 229, 0.1)", color: "var(--color-accent)", borderColor: "rgba(79, 70, 229, 0.2)", marginBottom: "20px", padding: "6px 16px" }}>
            <Sparkles size={14} style={{ marginRight: "6px" }} /> On This Day
          </div>
          <h2 className="glass-heading" style={{ fontSize: "40px", marginBottom: "16px" }}>
            {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
          </h2>
          <p style={{ fontSize: "16px", color: "var(--color-text-secondary)", lineHeight: 1.6, maxWidth: "600px" }}>
            Your historical archive is currently pending synchronization. Once the system has fully indexed your inbox, significant interactions and memories from this exact date in previous years will beautifully surface here.
          </p>
        </div>
      </div>

      <h2 className="glass-heading" style={{ fontSize: "24px", marginBottom: "24px" }}>Detected Milestones</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
        {MEMORIES.map(m => (
          <div key={m.id} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: `${m.color}15`, color: m.color, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${m.color}20` }}>
              <m.icon size={24} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-text-primary)" }}>{m.title}</h3>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
              {m.desc}
            </p>
            <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
              <span className="glass-badge" style={{ background: "rgba(0,0,0,0.03)", color: "var(--color-text-tertiary)", border: "none", fontSize: "11px" }}>
                Status: Pending
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
