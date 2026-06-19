"use client";

import { useEffect, useState } from "react";
import { subs as subsApi } from "@/lib/api";

const CAT_COLORS: Record<string, string> = {
  SaaS: "#00ff41", Food: "#ffb800", Finance: "#ff003c", Shopping: "#bc13fe", Travel: "#00e5ff", Other: "#ffffff"
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

  if (loading) return <div className="brutal-text" style={{ fontSize: "32px" }}>SCANNING_SUBSCRIPTIONS...</div>;

  return (
    <div>
      <h1 className="brutal-text" style={{ fontSize: "40px", marginBottom: "32px", borderBottom: "4px solid #fff", paddingBottom: "16px" }}>RECURRING_TRANSMISSIONS</h1>
      
      <div style={{ display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
        <button onClick={() => setFilter("")} className={!filter ? "brutal-btn" : "brutal-btn-ghost"} style={{ padding: "8px 16px", fontSize: "12px" }}>ALL [{active.length}]</button>
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)} className={filter === c ? "brutal-btn" : "brutal-btn-ghost"} style={{ padding: "8px 16px", fontSize: "12px", borderColor: CAT_COLORS[c], color: filter === c ? "#000" : CAT_COLORS[c], background: filter === c ? CAT_COLORS[c] : "transparent" }}>
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px", marginBottom: "48px" }}>
        {filtered.map(s => (
          <div key={s.id} className="brutal-card" style={{ borderColor: CAT_COLORS[s.category] || "#fff" }}>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 900, fontSize: "18px", textTransform: "uppercase", marginBottom: "8px", wordBreak: "break-all" }}>{s.service_name || s.sender_domain}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#aaa", marginBottom: "16px" }}>{s.sender_domain}</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: "bold", background: "#222", padding: "8px", border: "2px solid #555" }}>
              <span>{s.email_count} EMAILS</span>
              <span style={{ color: CAT_COLORS[s.category] || "#fff" }}>{s.frequency}</span>
            </div>
          </div>
        ))}
      </div>

      {dead.length > 0 && (
        <>
          <h2 className="brutal-text" style={{ fontSize: "24px", marginBottom: "24px", color: "var(--color-danger)" }}>DEAD_TRANSMISSIONS [{dead.length}]</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
            {dead.map(s => (
              <div key={s.id} style={{ padding: "16px", border: "3px solid var(--color-danger)", background: "#1a0006", boxShadow: "4px 4px 0px 0px var(--color-danger)" }}>
                <div style={{ fontFamily: "var(--font-sans)", fontWeight: 900, fontSize: "16px", textTransform: "uppercase", marginBottom: "8px", color: "var(--color-danger)" }}>{s.service_name || s.sender_domain}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#ff6685" }}>LAST: {s.last_email_date ? s.last_email_date.split('T')[0] : "UNKNOWN"}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
