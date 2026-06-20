"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import { analytics } from "@/lib/api";
import { Mail, TrendingUp, TrendingDown, Minus, Clock, RefreshCcw, BarChart2, Users, ChevronRight } from "lucide-react";
import Link from "next/link";

/* ── Earth-tone palette ── */
const CATEGORY_COLORS: Record<string, string> = {
  "Bills & Invoices":      "#c46b5a",   // terracotta
  "Job Applications":      "#6b7a8f",   // slate
  "Orders & Deliveries":   "#c99a5c",   // ochre
  "OTPs & Notifications":  "#b5838d",   // dusty rose
  "Newsletters":           "#849b87",   // sage
  "Real People":           "#1c1917",   // ink
  "Academic":              "#6b7a8f",   // slate
  "Promotions":            "#d4a373",   // warm sand
  "Travel & Bookings":     "#7c9885",   // muted sage
  "Uncategorized":         "#d6d3d1",   // stone
};

const SENTIMENT_COLORS = {
  positive: "#849b87",    // sage
  neutral:  "#c99a5c",    // ochre
  negative: "#c46b5a",    // terracotta
};

/* ── Avatar color from name hash ── */
function getAvatarColor(name: string): string {
  const palette = ["#6b7a8f", "#849b87", "#c46b5a", "#c99a5c", "#b5838d", "#1c1917", "#d4a373"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

/* ── Custom chart tooltip (earth tones) ── */
const EarthTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e2db", borderRadius: 8,
      padding: "10px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 12,
    }}>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color || p.payload?.fill }} />
          <span style={{ color: "#57534e" }}>{p.name}</span>
          <span style={{ marginLeft: 8, fontWeight: 600, color: "#1c1917" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   Dashboard Overview Page
   ═══════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [overview, setOverview]     = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [sentiment, setSentiment]   = useState<any>({});
  const [topSenders, setTopSenders] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [syncing, setSyncing]       = useState(false);

  useEffect(() => {
    loadDashboardData();
    // Poll sync status every 10 seconds
    const interval = setInterval(loadDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  async function loadDashboardData() {
    try {
      const [o, c, s, ts] = await Promise.all([
        analytics.overview(),
        analytics.categories(),
        analytics.sentiment(),
        analytics.topSenders(5),
      ]);
      setOverview(o);
      setCategories(c.categories);
      setSentiment(s.distribution);
      setTopSenders(ts.topSenders);
      
      // Check if syncing
      if (o.syncStatus === 'syncing') {
        setSyncing(true);
      } else {
        setSyncing(false);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ width: 240, height: 28, borderRadius: 6, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 160, height: 14, borderRadius: 4, marginBottom: 32 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 8 }} />
          ))}
        </div>
      </div>
    );
  }

  /* ── Derived values ── */
  const weekTrend  = overview?.weekOverWeekChange || 0;
  const TrendIcon  = weekTrend > 0 ? TrendingUp : weekTrend < 0 ? TrendingDown : Minus;
  const trendColor = weekTrend > 0 ? "#849b87" : weekTrend < 0 ? "#c46b5a" : "#a8a29e";

  const lastSyncedText = overview?.lastSyncedAt
    ? new Date(overview.lastSyncedAt).toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      })
    : "Never";

  const totalSentiments   = (sentiment.positive || 0) + (sentiment.neutral || 0) + (sentiment.negative || 0);
  const totalCategoryCount = categories.reduce((sum: number, c: any) => sum + c.count, 0);

  return (
    <div style={{ paddingBottom: 48 }}>

      {/* ── Page Header ── */}
      <div className="reveal-up stagger-1" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1c1917", marginBottom: 6, letterSpacing: "-0.02em" }}>
          Dashboard Overview
        </h1>
        <p style={{ fontSize: 14, color: "#a8a29e", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
          <Clock size={14} />
          Last synced: {lastSyncedText}
          {syncing && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#c99a5c", fontWeight: 500 }}>
              <RefreshCcw size={13} className="spin-slow" /> Syncing…
            </span>
          )}
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="reveal-up stagger-2" style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 32,
      }}>

        {/* Total Emails */}
        <div className="dash-stat-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#a8a29e" }}>
              Total Emails
            </span>
            <Mail size={16} color="#a8a29e" />
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#1c1917", lineHeight: 1 }}>
            {(overview?.totalEmails || 0).toLocaleString()}
          </div>
        </div>

        {/* This Week */}
        <div className="dash-stat-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#a8a29e" }}>
              This Week
            </span>
            <TrendIcon size={16} color={trendColor} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: "#1c1917", lineHeight: 1 }}>
              {(overview?.thisWeekEmails || 0).toLocaleString()}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: trendColor }}>
              {weekTrend > 0 && "+"}{weekTrend}%
              <span style={{ fontWeight: 400, color: "#a8a29e", marginLeft: 4, fontSize: 11 }}>vs last week</span>
            </span>
          </div>
        </div>

        {/* Unread */}
        <div className="dash-stat-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#a8a29e" }}>
              Unread
            </span>
            <div style={{
              width: 18, height: 18, borderRadius: "50%", background: "#dbeafe",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6" }} />
            </div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#1c1917", lineHeight: 1 }}>
            {(overview?.unreadCount || 0).toLocaleString()}
          </div>
        </div>

        {/* Last Week */}
        <div className="dash-stat-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#a8a29e" }}>
              Last Week
            </span>
            <Minus size={16} color="#a8a29e" />
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#1c1917", lineHeight: 1 }}>
            {(overview?.lastWeekEmails || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="reveal-up stagger-3" style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32,
      }}>

        {/* Category Breakdown */}
        <div className="dash-section-card">
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1c1917", marginBottom: 20 }}>
            Category Breakdown
          </h3>

          {categories.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <RechartsPie>
                  <Pie
                    data={categories}
                    cx="50%" cy="50%"
                    innerRadius={75} outerRadius={105}
                    paddingAngle={3} dataKey="count" stroke="none"
                  >
                    {categories.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#d6d3d1"} />
                    ))}
                  </Pie>
                  <Tooltip content={<EarthTooltip />} />
                </RechartsPie>
              </ResponsiveContainer>

              {/* Legend */}
              <div style={{ marginTop: 16 }}>
                {categories.slice(0, 6).map((cat, idx) => {
                  const pct = totalCategoryCount > 0 ? Math.round((cat.count / totalCategoryCount) * 100) : 0;
                  return (
                    <div key={cat.name} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "7px 0",
                      borderBottom: idx < Math.min(categories.length, 6) - 1 ? "1px solid #f0ede8" : "none",
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                        background: CATEGORY_COLORS[cat.name] || "#d6d3d1",
                      }} />
                      <span style={{ fontSize: 13, color: "#57534e", flex: 1 }}>{cat.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1c1917", marginRight: 8 }}>{cat.count}</span>
                      <span style={{ fontSize: 11, color: "#a8a29e", minWidth: 32, textAlign: "right" }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={{ padding: "8px 0" }}>
              <div className="dash-pill-pulse" style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8,
              }}>
                {[
                  { name: "Bills & Invoices", dot: "#c46b5a" },
                  { name: "Job Applications", dot: "#6b7a8f" },
                  { name: "Orders & Deliveries", dot: "#c99a5c" },
                  { name: "OTPs & Notifications", dot: "#849b87" },
                  { name: "Newsletters", dot: "#b5838d" },
                  { name: "Real People", dot: "#6b7a8f" },
                  { name: "Academic", dot: "#849b87" },
                  { name: "Promotions", dot: "#c99a5c" },
                  { name: "Travel & Bookings", dot: "#c46b5a" },
                ].map((cat) => (
                  <div key={cat.name} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 10px", borderRadius: 9999,
                    background: "#ede9e3", border: "1px solid #e5e2db",
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: cat.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "#a8a29e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cat.name}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "#a8a29e", textAlign: "center", marginTop: 16 }}>
                Sync your inbox to see counts
              </p>
            </div>
          )}
        </div>

        {/* Sentiment Distribution */}
        <div className="dash-section-card">
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1c1917", marginBottom: 20 }}>
            Sentiment Distribution
          </h3>

          {totalSentiments > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 8 }}>
              {([
                { key: "positive", label: "Positive", color: SENTIMENT_COLORS.positive },
                { key: "neutral",  label: "Neutral",  color: SENTIMENT_COLORS.neutral  },
                { key: "negative", label: "Negative", color: SENTIMENT_COLORS.negative },
              ] as const).map(({ key, label, color }, idx) => {
                const val = sentiment[key] || 0;
                const pct = totalSentiments > 0 ? Math.round((val / totalSentiments) * 100) : 0;
                return (
                  <div key={key}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#57534e" }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1c1917" }}>{pct}%</span>
                    </div>
                    <div style={{
                      height: 8, background: "#f0ede8", borderRadius: 6, overflow: "hidden",
                    }}>
                      <div
                        className="dash-bar-fill"
                        style={{
                          height: "100%", borderRadius: 6, background: color,
                          width: `${pct}%`,
                          animationDelay: `${idx * 150}ms`,
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 11, color: "#a8a29e", marginTop: 4 }}>
                      {val} {val === 1 ? "email" : "emails"}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 8 }}>
              {[
                { label: "Positive", dot: "#849b87" },
                { label: "Neutral",  dot: "#c99a5c" },
                { label: "Negative", dot: "#c46b5a" },
              ].map((row) => (
                <div key={row.label}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#a8a29e" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: row.dot, display: "inline-block" }} />
                      {row.label}
                    </span>
                    <span style={{ fontSize: 12, color: "#a8a29e" }}>—</span>
                  </div>
                  <div className="dash-shimmer-bar" style={{ height: 8, borderRadius: 9999 }} />
                </div>
              ))}
              <p style={{ fontSize: 12, color: "#a8a29e", textAlign: "center", marginTop: 4 }}>
                Sync your inbox to see sentiment data
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Most Active Senders ── */}
      <div className="dash-section-card reveal-up stagger-4">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1c1917", letterSpacing: "-0.01em" }}>
            Most Active Senders
          </h3>
          <Link href="/dashboard/people" className="dash-view-all-link">
            View All <ChevronRight size={14} />
          </Link>
        </div>

        {topSenders.length > 0 ? (
          <div>
            {topSenders.map((sender, index) => {
              const name    = sender.name || sender.email.split("@")[0];
              const initial = name.charAt(0).toUpperCase();
              const color   = getAvatarColor(sender.email);

              return (
                <div key={sender.email}>
                  {index > 0 && <div style={{ height: 1, background: "#f0ede8" }} />}
                  <div className="dash-sender-row">
                    {/* Avatar */}
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", background: color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 600, color: "#fff", flexShrink: 0,
                    }}>
                      {initial}
                    </div>

                    {/* Name & Email */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1c1917" }}>
                        {name}
                      </div>
                      <div style={{
                        fontSize: 12, color: "#a8a29e",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {sender.email}
                      </div>
                    </div>

                    {/* Count Badge */}
                    <span style={{
                      fontSize: 11, fontWeight: 500, color: "#57534e",
                      background: "#f0ede8", border: "1px solid #e5e2db",
                      borderRadius: 100, padding: "3px 10px",
                      whiteSpace: "nowrap",
                    }}>
                      {sender.count} {sender.count === 1 ? "email" : "emails"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: 120, gap: 10,
          }}>
            <Users size={28} color="#d6d3d1" />
            <span style={{ fontSize: 13, color: "#a8a29e" }}>Sync your inbox to discover top senders</span>
          </div>
        )}
      </div>
    </div>
  );
}
