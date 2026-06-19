"use client";

import { useEffect, useState } from "react";
import { emails as emailsApi } from "@/lib/api";

const CATEGORY_COLORS: Record<string, string> = {
  "Bills & Invoices": "badge-bills",
  "Job Applications": "badge-jobs",
  "Orders & Deliveries": "badge-orders",
  "OTPs & Notifications": "badge-otps",
  "Newsletters": "badge-newsletters",
  "Real People": "badge-people",
  "Academic": "badge-academic",
  "Promotions": "badge-promos",
  "Travel & Bookings": "badge-travel",
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
      const d = await emailsApi.list({ page, limit: 20, category: category || undefined, search: search || undefined });
      setEmails(d.emails); setTotalPages(d.pagination.totalPages);
    } catch {} finally { setLoading(false); }
  }

  const handleSearch = () => { setPage(1); loadEmails(); };

  return (
    <div>
      <h1 className="brutal-text" style={{ fontSize: "40px", marginBottom: "32px", borderBottom: "4px solid #fff", paddingBottom: "16px" }}>INBOX_DATASTREAM</h1>
      
      {/* Filters */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
        <input 
          type="text" 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          onKeyDown={e => e.key === "Enter" && handleSearch()} 
          placeholder="SEARCH_INDEX..." 
          className="brutal-input" 
          style={{ flex: 1 }} 
        />
        <select 
          value={category} 
          onChange={e => { setCategory(e.target.value); setPage(1); }} 
          className="brutal-input" 
          style={{ cursor: "pointer", textTransform: "uppercase" }}
        >
          <option value="">ALL_CATEGORIES</option>
          {Object.keys(CATEGORY_COLORS).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="brutal-btn" onClick={handleSearch}>QUERY</button>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {loading ? <div className="brutal-text">FETCHING_RECORDS...</div> : emails.length === 0 ? <div className="brutal-text">0_RECORDS_FOUND</div> : emails.map(e => (
          <div key={e.id} className="brutal-card" style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <div style={{ width: "48px", height: "48px", background: "#fff", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #000", fontFamily: "var(--font-sans)", fontWeight: "bold", fontSize: "20px" }}>
              {(e.sender_name || e.sender_email)[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: "bold", fontSize: "14px", whiteSpace: "nowrap" }}>{e.sender_name || e.sender_email}</span>
                {e.category && <span className={`badge ${CATEGORY_COLORS[e.category]}`}>{e.category}</span>}
              </div>
              <div style={{ fontFamily: "var(--font-sans)", fontWeight: 900, fontSize: "16px", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "4px" }}>
                {e.subject || "NO_SUBJECT"}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#aaa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {e.snippet}
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: "bold", background: "#222", padding: "8px", border: "2px solid #555" }}>
              {new Date(e.date).toISOString().split('T')[0]}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "40px", alignItems: "center" }}>
          <button className="brutal-btn-ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>PREV</button>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: "bold" }}>PAGE_{page}_OF_{totalPages}</span>
          <button className="brutal-btn-ghost" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>NEXT</button>
        </div>
      )}
    </div>
  );
}
