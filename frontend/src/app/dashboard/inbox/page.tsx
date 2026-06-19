"use client";

import { useEffect, useState } from "react";
import { emails as emailsApi } from "@/lib/api";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  "Bills & Invoices": "#a855f7",
  "Job Applications": "#3b82f6",
  "Orders & Deliveries": "#f59e0b",
  "OTPs & Notifications": "#ec4899",
  "Newsletters": "#06b6d4",
  "Real People": "#10b981",
  "Academic": "#f97316",
  "Promotions": "#ef4444",
  "Travel & Bookings": "#6366f1",
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
      <h1 className="glass-heading" style={{ fontSize: "32px", marginBottom: "32px" }}>Inbox Explorer</h1>
      
      {/* Filters */}
      <div className="glass-card" style={{ padding: "20px", display: "flex", gap: "16px", marginBottom: "32px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
          <input 
            type="text" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            onKeyDown={e => e.key === "Enter" && handleSearch()} 
            placeholder="Search subjects, senders, or content..." 
            className="glass-input" 
            style={{ width: "100%", paddingLeft: "44px", borderRadius: "100px" }} 
          />
        </div>
        <div style={{ position: "relative", minWidth: "200px" }}>
          <Filter size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)", pointerEvents: "none" }} />
          <select 
            value={category} 
            onChange={e => { setCategory(e.target.value); setPage(1); }} 
            className="glass-input" 
            style={{ width: "100%", paddingLeft: "44px", borderRadius: "100px", appearance: "none", cursor: "pointer", background: "rgba(255,255,255,0.7)" }}
          >
            <option value="">All Categories</option>
            {Object.keys(CATEGORY_COLORS).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button className="glass-btn-primary" onClick={handleSearch} style={{ borderRadius: "100px" }}>Search</button>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {loading ? (
          Array.from({length: 5}).map((_, i) => <div key={i} className="glass-card skeleton" style={{ height: "100px", padding: "20px" }} />)
        ) : emails.length === 0 ? (
          <div className="glass-card" style={{ textAlign: "center", padding: "60px" }}>
            <Inbox size={48} style={{ margin: "0 auto 16px", color: "var(--color-text-tertiary)" }} />
            <h3 className="glass-heading" style={{ fontSize: "20px", marginBottom: "8px" }}>No emails found</h3>
            <p style={{ color: "var(--color-text-secondary)" }}>Try adjusting your search or filters.</p>
          </div>
        ) : emails.map(e => (
          <div key={e.id} className="glass-card" style={{ display: "flex", gap: "20px", alignItems: "center", padding: "20px", borderRadius: "20px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)", color: "var(--color-text-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700, boxShadow: "inset 0 2px 4px rgba(255,255,255,0.5)" }}>
              {(e.sender_name || e.sender_email)[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontWeight: 600, fontSize: "15px", color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>{e.sender_name || e.sender_email}</span>
                {e.category && (
                  <span className="glass-badge" style={{ color: CATEGORY_COLORS[e.category], borderColor: `${CATEGORY_COLORS[e.category]}40`, background: `${CATEGORY_COLORS[e.category]}10` }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor", marginRight: "6px" }} />
                    {e.category}
                  </span>
                )}
              </div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "4px" }}>
                {e.subject || "No Subject"}
              </div>
              <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {e.snippet}
              </div>
            </div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-tertiary)", background: "rgba(255,255,255,0.5)", padding: "6px 12px", borderRadius: "100px" }}>
              {new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "40px", alignItems: "center" }}>
          <button className="glass-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} style={{ padding: "10px", borderRadius: "50%" }}>
            <ChevronLeft size={20} />
          </button>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-secondary)" }}>Page {page} of {totalPages}</span>
          <button className="glass-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={{ padding: "10px", borderRadius: "50%" }}>
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
