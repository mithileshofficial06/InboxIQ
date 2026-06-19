"use client";

import { useEffect, useState } from "react";
import { Inbox, Search, Filter, Calendar, Tag, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { emails as emailsApi } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

const CATEGORY_BADGE: Record<string, string> = {
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

interface Email {
  id: string;
  gmail_id: string;
  sender_email: string;
  sender_name: string;
  subject: string;
  snippet: string;
  date: string;
  category: string;
  sentiment: string;
  is_read: boolean;
  has_attachments: boolean;
}

export default function InboxExplorerPage() {
  const [emailList, setEmailList] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const ALL_CATEGORIES = [
    "", "Bills & Invoices", "Job Applications", "Orders & Deliveries",
    "OTPs & Notifications", "Newsletters", "Real People",
    "Academic", "Promotions", "Travel & Bookings",
  ];

  useEffect(() => {
    loadEmails();
  }, [page, category]);

  async function loadEmails() {
    setLoading(true);
    try {
      const data = await emailsApi.list({ page, limit: 20, category: category || undefined, search: search || undefined });
      setEmailList(data.emails);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to load emails:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    setPage(1);
    loadEmails();
  }

  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "6px" }}>
        Inbox Explorer
      </h1>
      <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "24px" }}>
        Browse, search, and filter your emails
      </p>

      {/* Filters Bar */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <div
          style={{
            flex: 1,
            minWidth: "250px",
            display: "flex",
            gap: "8px",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border-default)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <Search size={16} style={{ color: "var(--color-text-tertiary)" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search subjects, snippets..."
              style={{
                flex: 1,
                background: "none",
                border: "none",
                color: "var(--color-text-primary)",
                fontSize: "13px",
                outline: "none",
                fontFamily: "var(--font-sans)",
              }}
            />
          </div>
        </div>

        {/* Category filter */}
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          style={{
            padding: "10px 14px",
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-primary)",
            fontSize: "13px",
            outline: "none",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
          }}
        >
          <option value="">All Categories</option>
          {ALL_CATEGORIES.filter(Boolean).map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Email List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {loading ? (
          Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="skeleton" style={{ height: "72px", marginBottom: "2px" }} />
          ))
        ) : emailList.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "var(--color-text-secondary)",
            }}
          >
            <Mail size={40} style={{ color: "var(--color-text-tertiary)", marginBottom: "16px" }} />
            <p style={{ fontSize: "16px", fontWeight: 600, marginBottom: "6px" }}>No emails found</p>
            <p style={{ fontSize: "13px" }}>Try adjusting your filters or sync your inbox.</p>
          </div>
        ) : (
          emailList.map((email) => (
            <div
              key={email.id}
              onClick={() => setSelectedEmail(selectedEmail?.id === email.id ? null : email)}
              style={{
                padding: "14px 18px",
                background: selectedEmail?.id === email.id ? "var(--color-bg-elevated)" : "var(--color-bg-card)",
                border: `1px solid ${selectedEmail?.id === email.id ? "hsl(217 91% 60% / 0.3)" : "var(--color-border-subtle)"}`,
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
              onMouseEnter={(e) => {
                if (selectedEmail?.id !== email.id) {
                  e.currentTarget.style.background = "var(--color-bg-hover)";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedEmail?.id !== email.id) {
                  e.currentTarget.style.background = "var(--color-bg-card)";
                }
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "hsl(217 91% 60% / 0.12)",
                  color: "hsl(217 91% 70%)",
                  fontSize: "14px",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {(email.sender_name || email.sender_email)?.[0]?.toUpperCase() || "?"}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: email.is_read ? 500 : 700,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {email.sender_name || email.sender_email}
                  </span>
                  {email.category && (
                    <span className={`badge ${CATEGORY_BADGE[email.category] || ""}`} style={{ fontSize: "10px", padding: "2px 8px" }}>
                      {email.category}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: email.is_read ? 400 : 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginBottom: "2px",
                  }}
                >
                  {email.subject || "(no subject)"}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text-tertiary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {email.snippet}
                </div>
              </div>

              {/* Date */}
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--color-text-tertiary)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {email.date
                  ? formatDistanceToNow(new Date(email.date), { addSuffix: true })
                  : ""}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          <button
            className="btn-ghost"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            style={{ padding: "8px 12px", opacity: page <= 1 ? 0.4 : 1 }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: 600 }}>
            Page {page} of {totalPages}
          </span>
          <button
            className="btn-ghost"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            style={{ padding: "8px 12px", opacity: page >= totalPages ? 0.4 : 1 }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
