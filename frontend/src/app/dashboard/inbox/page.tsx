"use client";

import { useEffect, useState } from "react";
import { emails as emailsApi } from "@/lib/api";

const CATEGORY_COLORS: Record<string, string> = {
  "Bills & Invoices": "var(--color-terracotta)",
  "Job Applications": "var(--color-sage)",
  "Orders & Deliveries": "var(--color-ochre)",
  "OTPs & Notifications": "var(--color-dusty-rose)",
  "Newsletters": "var(--color-slate)",
  "Real People": "#1c1917",
  "Academic": "#57534e",
  "Promotions": "#a8a29e",
  "Travel & Bookings": "#e5e2db",
};

export default function InboxExplorerPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => { loadEmails(); }, [page, category]);

  async function loadEmails() {
    setLoading(true);
    try {
      const d = await emailsApi.list({ page, limit: 15, category: category || undefined, search: search || undefined });
      setEmails(d.emails); setTotalPages(d.pagination.totalPages);
    } catch {} finally { setLoading(false); }
  }

  const handleSearch = () => { setPage(1); loadEmails(); };

  return (
    <div style={{ paddingBottom: "40px" }}>
      <h1 className="editorial-heading" style={{ fontSize: "36px", marginBottom: "40px" }}>Inbox Explorer</h1>
      
      {/* Filters */}
      <div className="editorial-card" style={{ padding: "24px", display: "flex", gap: "16px", marginBottom: "40px", flexWrap: "wrap", alignItems: "center" }}>
        <input 
          type="text" 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          onKeyDown={e => e.key === "Enter" && handleSearch()} 
          placeholder="Search subjects, senders..." 
          className="editorial-input" 
          style={{ flex: 1, minWidth: "250px" }} 
        />
        <select 
          value={category} 
          onChange={e => { setCategory(e.target.value); setPage(1); }} 
          className="editorial-input" 
          style={{ minWidth: "200px", appearance: "none", cursor: "pointer", backgroundImage: "linear-gradient(45deg, transparent 50%, gray 50%), linear-gradient(135deg, gray 50%, transparent 50%)", backgroundPosition: "calc(100% - 20px) calc(1em + 2px), calc(100% - 15px) calc(1em + 2px)", backgroundSize: "5px 5px, 5px 5px", backgroundRepeat: "no-repeat" }}
        >
          <option value="">All Categories</option>
          {Object.keys(CATEGORY_COLORS).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="editorial-btn-primary" onClick={handleSearch}>Filter</button>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid var(--color-border-default)" }}>
        {loading ? (
          Array.from({length: 5}).map((_, i) => <div key={i} className="skeleton" style={{ height: "80px", margin: "16px 0" }} />)
        ) : emails.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--color-text-secondary)", fontSize: "16px" }}>
            No records found.
          </div>
        ) : emails.map(e => (
          <div key={e.id} style={{ display: "flex", gap: "24px", alignItems: "center", padding: "24px 0", borderBottom: "1px solid var(--color-border-subtle)" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "4px", background: "var(--color-bg-tertiary)", color: "var(--color-text-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontFamily: "var(--font-serif)" }}>
              {(e.sender_name || e.sender_email)[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "baseline", marginBottom: "4px" }}>
                <span style={{ fontWeight: 600, fontSize: "15px", color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>{e.sender_name || e.sender_email}</span>
                {e.category && (
                  <span className="editorial-subheading" style={{ color: CATEGORY_COLORS[e.category] }}>
                    {e.category}
                  </span>
                )}
              </div>
              <div className="editorial-heading" style={{ fontSize: "16px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "6px" }}>
                {e.subject || "No Subject"}
              </div>
              <div style={{ fontSize: "14px", color: "var(--color-text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {e.snippet}
              </div>
            </div>
            <div className="editorial-subheading" style={{ color: "var(--color-text-tertiary)", textAlign: "right", minWidth: "100px" }}>
              {new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "24px", justifyContent: "center", marginTop: "40px", alignItems: "center" }}>
          <button className="editorial-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Previous</button>
          <span className="editorial-subheading">Page {page} of {totalPages}</span>
          <button className="editorial-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
        </div>
      )}
    </div>
  );
}
