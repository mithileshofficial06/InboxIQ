"use client";

import { useEffect, useState } from "react";
import { people as peopleApi } from "@/lib/api";
import type { Contact } from "@/lib/types";

export default function PeoplePage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"frequency" | "recency">("frequency");

  // The loader is defined inside the effect so its setState calls all happen
  // after an await rather than synchronously in the effect body. Showing the
  // skeleton on a re-sort is handled by the click handler below, which is where
  // React wants state set in response to an interaction.
  useEffect(() => {
    let cancelled = false;

    const loadContacts = async () => {
      try {
        const d = await peopleApi.list(sort, 50);
        if (!cancelled) setContacts(d.contacts);
      } catch {
        // Leave the previous list in place; the empty state covers a first load.
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadContacts();
    return () => { cancelled = true; };
  }, [sort]);

  const changeSort = (next: "frequency" | "recency") => {
    if (next === sort) return;
    setLoading(true);
    setSort(next);
  };

  const max = contacts[0]?.emailCount || 1;

  return (
    <div style={{ paddingBottom: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid var(--color-border-default)", paddingBottom: "24px", marginBottom: "40px" }}>
        <h1 className="editorial-heading" style={{ fontSize: "36px" }}>Network</h1>
        
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span className="editorial-subheading" style={{ marginRight: "8px" }}>Sort By</span>
          {(["frequency", "recency"] as const).map(s => (
            <button key={s} onClick={() => changeSort(s)} className={sort === s ? "editorial-btn-primary" : "editorial-btn"} style={{ padding: "6px 16px", fontSize: "12px" }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "32px" }}>
        {loading ? (
          Array.from({length: 8}).map((_, i) => <div key={i} className="editorial-card skeleton" style={{ height: "120px" }} />)
        ) : contacts.map((c, i) => (
          <div key={c.email} className="editorial-card" style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "24px" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <div className="editorial-heading" style={{ width: "48px", height: "48px", borderRadius: "4px", background: "var(--color-bg-tertiary)", color: "var(--color-text-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                {(c.name || c.email)[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontWeight: 600, fontSize: "16px", color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "4px" }}>{c.name || c.email}</div>
                <div style={{ fontSize: "14px", color: "var(--color-text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.email}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="editorial-heading" style={{ fontSize: "24px", color: "var(--color-text-primary)" }}>{c.emailCount}</div>
              </div>
            </div>
            <div style={{ height: "2px", background: "var(--color-border-subtle)", width: "100%" }}>
              <div style={{ height: "100%", width: `${(c.emailCount / max) * 100}%`, background: "var(--color-text-primary)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
