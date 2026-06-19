"use client";

import { useEffect, useState } from "react";
import { subs as subsApi } from "@/lib/api";
import { AlertCircle } from "lucide-react";

const CAT_COLORS: Record<string, string> = {
  SaaS: "#10b981", Food: "#f59e0b", Finance: "#ef4444", Shopping: "#a855f7", Travel: "#0ea5e9", Other: "#94a3b8"
};

export default function SubsPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [dead, setDead] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try { const [s, d] = await Promise.all([subsApi.list(), subsApi.getDead()]); setSubs(s.subscriptions); setDead(d.deadSubscriptions); }
    catch {} finally { setLoading(false); }
  }

  const active = subs.filter(s => !s.is_dead);
  const filtered = filter ? active.filter(s => s.category === filter) : active;
  const cats = [...new Set(subs.map(s => s.category).filter(Boolean))];

  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
      {Array.from({length: 8}).map((_, i) => <div key={i} className="glass-card skeleton" style={{ height: "160px" }} />)}
    </div>
  );

  return (
    <div style={{ paddingBottom: "40px" }}>
      <h1 className="glass-heading" style={{ fontSize: "32px", marginBottom: "32px" }}>Active Subscriptions</h1>
      
      <div className="glass-card" style={{ padding: "16px", display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
        <button onClick={() => setFilter("")} className={!filter ? "glass-btn-primary" : "glass-btn"} style={{ padding: "8px 16px", fontSize: "13px" }}>All ({active.length})</button>
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)} className={filter === c ? "glass-btn-primary" : "glass-btn"} style={{ padding: "8px 16px", fontSize: "13px" }}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px", marginBottom: "48px" }}>
        {filtered.map(s => (
          <div key={s.id} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 700, color: CAT_COLORS[s.category] || "#94a3b8", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                {(s.service_name || s.sender_domain)[0].toUpperCase()}
              </div>
              <span className="glass-badge" style={{ color: CAT_COLORS[s.category] || "#94a3b8", background: `${CAT_COLORS[s.category]}15`, borderColor: `${CAT_COLORS[s.category]}30` }}>
                {s.category || "Uncategorized"}
              </span>
            </div>
            
            <div>
              <div style={{ fontWeight: 700, fontSize: "18px", color: "var(--color-text-primary)", marginBottom: "4px" }}>{s.service_name || s.sender_domain}</div>
              <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{s.sender_domain}</div>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "16px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase" }}>Emails</span>
                <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-primary)" }}>{s.email_count}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase" }}>Frequency</span>
                <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-accent)", textTransform: "capitalize" }}>{s.frequency}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {dead.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <h2 className="glass-heading" style={{ fontSize: "24px" }}>Dead Subscriptions</h2>
            <div className="glass-badge" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.2)" }}>{dead.length} Found</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
            {dead.map(s => (
              <div key={s.id} className="glass-card" style={{ background: "rgba(254, 242, 242, 0.5)", borderColor: "rgba(239, 68, 68, 0.2)" }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--color-text-primary)", marginBottom: "4px" }}>{s.service_name || s.sender_domain}</div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>Last received: {s.last_email_date ? new Date(s.last_email_date).toLocaleDateString() : "Unknown"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
