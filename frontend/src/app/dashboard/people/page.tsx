"use client";

import { useEffect, useState } from "react";
import { Users, Filter } from "lucide-react";
import { people as peopleApi } from "@/lib/api";

export default function PeoplePage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"frequency" | "recency">("frequency");

  useEffect(() => { loadContacts(); }, [sort]);

  async function loadContacts() {
    setLoading(true);
    try { const d = await peopleApi.list(sort, 50); setContacts(d.contacts); }
    catch {} finally { setLoading(false); }
  }

  const max = contacts[0]?.emailCount || 1;

  return (
    <div style={{ paddingBottom: "40px" }}>
      <h1 className="glass-heading" style={{ fontSize: "32px", marginBottom: "32px" }}>Network Intelligence</h1>
      
      <div className="glass-card" style={{ display: "flex", gap: "12px", marginBottom: "32px", padding: "16px", alignItems: "center" }}>
        <Filter size={18} style={{ color: "var(--color-text-tertiary)", marginLeft: "8px" }} />
        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-secondary)", marginRight: "12px" }}>Sort By:</span>
        <div style={{ background: "rgba(255,255,255,0.5)", padding: "4px", borderRadius: "100px", display: "flex", gap: "4px" }}>
          {(["frequency", "recency"] as const).map(s => (
            <button key={s} onClick={() => setSort(s)} style={{ padding: "8px 16px", fontSize: "13px", fontWeight: 600, borderRadius: "100px", border: "none", background: sort === s ? "#fff" : "transparent", color: sort === s ? "var(--color-accent)" : "var(--color-text-secondary)", boxShadow: sort === s ? "0 2px 8px rgba(0,0,0,0.05)" : "none", cursor: "pointer", transition: "all 0.2s" }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
        {loading ? (
          Array.from({length: 8}).map((_, i) => <div key={i} className="glass-card skeleton" style={{ height: "140px" }} />)
        ) : contacts.map((c, i) => (
          <div key={c.email} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "20px", background: "linear-gradient(135deg, var(--color-accent), #a855f7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 700, boxShadow: "0 8px 16px rgba(79, 70, 229, 0.2)" }}>
                {(c.name || c.email)[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "4px" }}>{c.name || c.email}</div>
                <div style={{ fontSize: "13px", color: "var(--color-text-tertiary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.email}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--color-accent)" }}>{c.emailCount}</div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase" }}>Emails</div>
              </div>
            </div>
            <div style={{ height: "6px", background: "rgba(0,0,0,0.05)", borderRadius: "100px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(c.emailCount / max) * 100}%`, background: "linear-gradient(90deg, var(--color-accent), #a855f7)", borderRadius: "100px" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
