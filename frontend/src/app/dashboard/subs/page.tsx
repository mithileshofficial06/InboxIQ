"use client";

import { useEffect, useState } from "react";
import { subs as subsApi } from "@/lib/api";

const CAT_COLORS: Record<string, string> = {
  SaaS: "var(--color-sage)", Food: "var(--color-ochre)", Finance: "var(--color-terracotta)", Shopping: "var(--color-dusty-rose)", Travel: "var(--color-slate)", Other: "var(--color-text-secondary)"
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
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
      {Array.from({length: 8}).map((_, i) => <div key={i} className="editorial-card skeleton" style={{ height: "160px" }} />)}
    </div>
  );

  return (
    <div style={{ paddingBottom: "40px" }}>
      <h1 className="editorial-heading" style={{ fontSize: "36px", marginBottom: "40px", borderBottom: "1px solid var(--color-border-default)", paddingBottom: "24px" }}>Subscriptions</h1>
      
      <div style={{ display: "flex", gap: "12px", marginBottom: "40px", flexWrap: "wrap", alignItems: "center" }}>
        <span className="editorial-subheading" style={{ marginRight: "8px" }}>Categories</span>
        <button onClick={() => setFilter("")} className={!filter ? "editorial-btn-primary" : "editorial-btn"} style={{ padding: "6px 16px", fontSize: "12px" }}>All</button>
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)} className={filter === c ? "editorial-btn-primary" : "editorial-btn"} style={{ padding: "6px 16px", fontSize: "12px" }}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "32px", marginBottom: "64px" }}>
        {filtered.map(s => (
          <div key={s.id} className="editorial-card" style={{ display: "flex", flexDirection: "column", padding: "32px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
              <div className="editorial-heading" style={{ fontSize: "20px", color: "var(--color-text-primary)" }}>{s.service_name || s.sender_domain}</div>
              <span className="editorial-subheading" style={{ color: CAT_COLORS[s.category] || "var(--color-text-secondary)" }}>
                {s.category || "Uncategorized"}
              </span>
            </div>
            
            <div style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "32px" }}>{s.sender_domain}</div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", borderTop: "1px solid var(--color-border-subtle)", paddingTop: "16px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
                <span className="editorial-heading" style={{ fontSize: "20px" }}>{s.email_count}</span>
                <span className="editorial-subheading" style={{ textTransform: "lowercase", fontSize: "11px" }}>emails</span>
              </div>
              <div className="editorial-subheading" style={{ color: "var(--color-text-primary)" }}>
                {s.frequency}
              </div>
            </div>
          </div>
        ))}
      </div>

      {dead.length > 0 && (
        <>
          <h2 className="editorial-heading" style={{ fontSize: "28px", color: "var(--color-terracotta)", marginBottom: "32px", borderBottom: "1px solid var(--color-border-default)", paddingBottom: "16px" }}>
            Dormant Accounts
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "32px" }}>
            {dead.map(s => (
              <div key={s.id} className="editorial-card" style={{ borderLeft: "4px solid var(--color-terracotta)", padding: "24px" }}>
                <div className="editorial-heading" style={{ fontSize: "18px", color: "var(--color-text-primary)", marginBottom: "8px" }}>{s.service_name || s.sender_domain}</div>
                <div style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>Last activity: {s.last_email_date ? new Date(s.last_email_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : "Unknown"}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
