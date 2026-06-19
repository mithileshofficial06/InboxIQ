"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
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
    <div>
      <h1 className="brutal-text" style={{ fontSize: "40px", marginBottom: "32px", borderBottom: "4px solid #fff", paddingBottom: "16px" }}>NODE_RELATIONSHIPS</h1>
      
      <div style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
        {(["frequency", "recency"] as const).map(s => (
          <button key={s} onClick={() => setSort(s)} className={sort === s ? "brutal-btn" : "brutal-btn-ghost"}>
            SORT_BY_{s.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
        {loading ? <div className="brutal-text">ANALYZING_NODES...</div> : contacts.map((c, i) => (
          <div key={c.email} className="brutal-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div style={{ width: "48px", height: "48px", background: "var(--color-accent)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #fff", fontFamily: "var(--font-sans)", fontWeight: "bold", fontSize: "24px", boxShadow: "3px 3px 0px 0px #fff" }}>
                {(c.name || c.email)[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontFamily: "var(--font-sans)", fontWeight: 900, fontSize: "16px", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name || c.email}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#aaa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.email}</div>
              </div>
              <div className="brutal-text" style={{ fontSize: "24px", color: "var(--color-accent)", textShadow: "none" }}>{c.emailCount}</div>
            </div>
            <div style={{ height: "8px", background: "#222", border: "2px solid #555" }}>
              <div style={{ height: "100%", width: `${(c.emailCount / max) * 100}%`, background: "var(--color-accent)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
