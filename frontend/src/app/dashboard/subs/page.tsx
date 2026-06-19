"use client";

import { useEffect, useState } from "react";
import { Bell, AlertTriangle, Mail, Tag, Calendar } from "lucide-react";
import { subs as subsApi } from "@/lib/api";

const CATEGORY_COLORS: Record<string, string> = {
  SaaS: "hsl(217 91% 60%)",
  Food: "hsl(25 95% 55%)",
  Finance: "hsl(142 71% 45%)",
  Shopping: "hsl(280 65% 60%)",
  Travel: "hsl(199 89% 48%)",
  Other: "hsl(215 20% 55%)",
};

interface Subscription {
  id: string;
  sender_domain: string;
  sender_email: string;
  service_name: string;
  category: string;
  last_email_date: string;
  first_email_date: string;
  email_count: number;
  frequency: string;
  is_dead: boolean;
}

export default function SubsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [deadSubs, setDeadSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [subsData, deadData] = await Promise.all([
        subsApi.list(),
        subsApi.getDead(),
      ]);
      setSubscriptions(subsData.subscriptions);
      setDeadSubs(deadData.deadSubscriptions);
    } catch (error) {
      console.error("Failed to load subscriptions:", error);
    } finally {
      setLoading(false);
    }
  }

  const activeSubs = subscriptions.filter((s) => !s.is_dead);
  const filteredActive = filter ? activeSubs.filter((s) => s.category === filter) : activeSubs;
  const categories = [...new Set(subscriptions.map((s) => s.category).filter(Boolean))];

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "28px" }}>Subscriptions</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
          {Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton" style={{ height: "140px" }} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "6px" }}>
        Subscription Tracker
      </h1>
      <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "24px" }}>
        Auto-detected recurring senders and marketing emails
      </p>

      {/* Category filter */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "24px", flexWrap: "wrap" }}>
        <button
          onClick={() => setFilter("")}
          style={{
            padding: "6px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "var(--radius-full)",
            border: "none", cursor: "pointer",
            background: !filter ? "hsl(217 91% 60% / 0.15)" : "var(--color-bg-tertiary)",
            color: !filter ? "hsl(217 91% 70%)" : "var(--color-text-secondary)",
          }}
        >
          All ({activeSubs.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: "6px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "var(--radius-full)",
              border: "none", cursor: "pointer",
              background: filter === cat ? `${CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other}20` : "var(--color-bg-tertiary)",
              color: filter === cat ? CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other : "var(--color-text-secondary)",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Active Subscriptions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "12px",
          marginBottom: "40px",
        }}
      >
        {filteredActive.map((sub, i) => (
          <div
            key={sub.id}
            className="glass-card"
            style={{
              padding: "20px",
              opacity: 0,
              animation: `fadeIn 0.3s ease-out ${i * 40}ms forwards`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: `${CATEGORY_COLORS[sub.category] || CATEGORY_COLORS.Other}15`,
                  }}
                >
                  <Mail size={16} style={{ color: CATEGORY_COLORS[sub.category] || CATEGORY_COLORS.Other }} />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700 }}>
                    {sub.service_name || sub.sender_domain}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>
                    {sub.sender_domain}
                  </div>
                </div>
              </div>
              {sub.category && (
                <span
                  style={{
                    padding: "3px 10px", fontSize: "10px", fontWeight: 700, borderRadius: "var(--radius-full)",
                    background: `${CATEGORY_COLORS[sub.category] || CATEGORY_COLORS.Other}15`,
                    color: CATEGORY_COLORS[sub.category] || CATEGORY_COLORS.Other,
                  }}
                >
                  {sub.category}
                </span>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--color-text-secondary)" }}>
              <span>{sub.email_count} emails</span>
              <span>{sub.frequency}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Dead Subscriptions */}
      {deadSubs.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <AlertTriangle size={18} style={{ color: "var(--color-warning)" }} />
            <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Dead Subscriptions</h2>
            <span
              style={{
                padding: "2px 10px", fontSize: "12px", fontWeight: 700, borderRadius: "var(--radius-full)",
                background: "hsl(38 92% 50% / 0.12)", color: "hsl(38 92% 65%)",
              }}
            >
              {deadSubs.length}
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "12px",
            }}
          >
            {deadSubs.map((sub) => (
              <div
                key={sub.id}
                style={{
                  padding: "16px 20px",
                  background: "hsl(38 92% 50% / 0.05)",
                  border: "1px solid hsl(38 92% 50% / 0.15)",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
                  {sub.service_name || sub.sender_domain}
                </div>
                <div style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>
                  Last email: {sub.last_email_date ? new Date(sub.last_email_date).toLocaleDateString() : "Unknown"}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {subscriptions.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--color-text-secondary)" }}>
          <Bell size={40} style={{ color: "var(--color-text-tertiary)", marginBottom: "16px" }} />
          <p style={{ fontSize: "16px", fontWeight: 600 }}>No subscriptions detected</p>
          <p style={{ fontSize: "13px" }}>Sync your inbox to auto-detect subscription services.</p>
        </div>
      )}
    </div>
  );
}
