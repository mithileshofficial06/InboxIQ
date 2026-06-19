"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  TrendingUp,
  Calendar,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { analytics } from "@/lib/api";

const CATEGORY_COLORS: Record<string, string> = {
  "Bills & Invoices": "#9b59b6",
  "Job Applications": "#3b82f6",
  "Orders & Deliveries": "#f97316",
  "OTPs & Notifications": "#ec4899",
  "Newsletters": "#10b981",
  "Real People": "#22c55e",
  "Academic": "#eab308",
  "Promotions": "#ef4444",
  "Travel & Bookings": "#0ea5e9",
  "Uncategorized": "#6b7280",
};

interface OverviewData {
  totalEmails: number;
  todayEmails: number;
  unreadCount: number;
  avgPerDay: number;
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [volume, setVolume] = useState<{ date: string; count: number }[]>([]);
  const [topSenders, setTopSenders] = useState<{ email: string; name: string; count: number }[]>([]);
  const [heatmapData, setHeatmapData] = useState<number[][]>([]);
  const [sentiment, setSentiment] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [volumePeriod, setVolumePeriod] = useState<"daily" | "weekly" | "monthly">("weekly");

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    analytics.volume(volumePeriod).then((data) => setVolume(data.volume)).catch(console.error);
  }, [volumePeriod]);

  async function loadDashboardData() {
    try {
      const [overviewData, catData, volData, senderData, heatData, sentData] =
        await Promise.all([
          analytics.overview(),
          analytics.categories(),
          analytics.volume("weekly"),
          analytics.topSenders(8),
          analytics.heatmap(),
          analytics.sentiment(),
        ]);

      setOverview(overviewData);
      setCategories(catData.categories);
      setVolume(volData.volume);
      setTopSenders(senderData.topSenders);
      setHeatmapData(heatData.heatmap);
      setSentiment(sentData.distribution);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "28px", letterSpacing: "-0.02em" }}>
          Dashboard
        </h1>
        {/* Skeleton stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: "120px" }} />
          ))}
        </div>
        {/* Skeleton charts */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
          <div className="skeleton" style={{ height: "340px" }} />
          <div className="skeleton" style={{ height: "340px" }} />
        </div>
      </div>
    );
  }

  const STAT_CARDS = [
    {
      label: "Total Emails",
      value: overview?.totalEmails?.toLocaleString() || "0",
      icon: Mail,
      color: "hsl(217 91% 60%)",
      change: null,
    },
    {
      label: "Today",
      value: overview?.todayEmails?.toLocaleString() || "0",
      icon: Calendar,
      color: "hsl(142 71% 45%)",
      change: null,
    },
    {
      label: "Avg / Day",
      value: overview?.avgPerDay?.toString() || "0",
      icon: TrendingUp,
      color: "hsl(280 65% 60%)",
      change: null,
    },
    {
      label: "Unread",
      value: overview?.unreadCount?.toLocaleString() || "0",
      icon: Eye,
      color: "hsl(38 92% 50%)",
      change: null,
    },
  ];

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const maxHeat = Math.max(...(heatmapData.flat() || [1]));

  return (
    <div>
      <h1
        style={{
          fontSize: "28px",
          fontWeight: 800,
          marginBottom: "28px",
          letterSpacing: "-0.02em",
        }}
      >
        Dashboard
      </h1>

      {/* ========== Stat Cards ========== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        {STAT_CARDS.map((stat, i) => (
          <div
            key={stat.label}
            className="stat-card"
            style={{
              opacity: 0,
              animation: `fadeIn 0.4s ease-out ${i * 80}ms forwards`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {stat.label}
              </span>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${stat.color}15`,
                }}
              >
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
            </div>
            <div
              style={{
                fontSize: "32px",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* ========== Charts Row 1 ========== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        {/* Email Volume Chart */}
        <div className="chart-container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Activity size={18} style={{ color: "var(--color-accent)" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>
                Email Volume
              </h3>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              {(["daily", "weekly", "monthly"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setVolumePeriod(p)}
                  style={{
                    padding: "4px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    background:
                      volumePeriod === p
                        ? "hsl(217 91% 60% / 0.15)"
                        : "transparent",
                    color:
                      volumePeriod === p
                        ? "hsl(217 91% 70%)"
                        : "var(--color-text-tertiary)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={volume}>
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(215 20% 50%)" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(220 15% 18%)" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(215 20% 50%)" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(220 20% 14%)",
                  border: "1px solid hsl(220 15% 22%)",
                  borderRadius: "10px",
                  fontSize: "13px",
                  color: "hsl(210 40% 96%)",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(217 91% 60%)"
                strokeWidth={2}
                fill="url(#volumeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Donut */}
        <div className="chart-container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <PieChart size={18} style={{ color: "hsl(280 65% 60%)" }} />
            <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Categories</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <RechartsPie>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="count"
              >
                {categories.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={CATEGORY_COLORS[entry.name] || "#6b7280"}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(220 20% 14%)",
                  border: "1px solid hsl(220 15% 22%)",
                  borderRadius: "10px",
                  fontSize: "12px",
                  color: "hsl(210 40% 96%)",
                }}
              />
            </RechartsPie>
          </ResponsiveContainer>
          {/* Legend */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginTop: "8px",
            }}
          >
            {categories.slice(0, 6).map((cat) => (
              <span
                key={cat.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  color: "var(--color-text-secondary)",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: CATEGORY_COLORS[cat.name] || "#6b7280",
                  }}
                />
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ========== Charts Row 2 ========== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        {/* Top Senders */}
        <div className="chart-container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <Users size={18} style={{ color: "hsl(142 71% 45%)" }} />
            <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Top Senders</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {topSenders.map((sender, i) => {
              const maxCount = topSenders[0]?.count || 1;
              return (
                <div key={sender.email} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: 700,
                      background: "hsl(217 91% 60% / 0.12)",
                      color: "hsl(217 91% 70%)",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {sender.name || sender.email}
                    </div>
                    <div
                      style={{
                        height: "4px",
                        borderRadius: "2px",
                        background: "var(--color-bg-tertiary)",
                        marginTop: "4px",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: "2px",
                          background: `hsl(${217 - i * 15} 91% 60%)`,
                          width: `${(sender.count / maxCount) * 100}%`,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--color-text-secondary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {sender.count}
                  </span>
                </div>
              );
            })}
            {topSenders.length === 0 && (
              <p style={{ fontSize: "13px", color: "var(--color-text-tertiary)", textAlign: "center", padding: "20px 0" }}>
                No data yet. Sync your inbox to see top senders.
              </p>
            )}
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="chart-container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <Clock size={18} style={{ color: "hsl(25 95% 55%)" }} />
            <h3 style={{ fontSize: "16px", fontWeight: 700 }}>
              Activity Heatmap
            </h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {days.map((day, dayIdx) => (
                <div key={day} style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                  <span
                    style={{
                      width: "32px",
                      fontSize: "11px",
                      color: "var(--color-text-tertiary)",
                      fontWeight: 500,
                      textAlign: "right",
                      paddingRight: "4px",
                    }}
                  >
                    {day}
                  </span>
                  {Array.from({ length: 24 }, (_, hour) => {
                    const value = heatmapData[dayIdx]?.[hour] || 0;
                    const intensity = maxHeat > 0 ? value / maxHeat : 0;
                    return (
                      <div
                        key={hour}
                        title={`${day} ${hour}:00 — ${value} emails`}
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "3px",
                          background:
                            intensity === 0
                              ? "var(--color-bg-tertiary)"
                              : `hsl(217 91% 60% / ${0.1 + intensity * 0.8})`,
                          transition: "all 0.2s ease",
                          cursor: "pointer",
                        }}
                      />
                    );
                  })}
                </div>
              ))}
              {/* Hour labels */}
              <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <span style={{ width: "32px" }} />
                {Array.from({ length: 24 }, (_, hour) => (
                  <span
                    key={hour}
                    style={{
                      width: "16px",
                      fontSize: "8px",
                      textAlign: "center",
                      color: "var(--color-text-tertiary)",
                    }}
                  >
                    {hour % 6 === 0 ? hour : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== Sentiment Row ========== */}
      <div className="chart-container">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <BarChart3 size={18} style={{ color: "hsl(160 60% 50%)" }} />
          <h3 style={{ fontSize: "16px", fontWeight: 700 }}>
            Sentiment Overview
          </h3>
        </div>
        <div
          style={{
            display: "flex",
            gap: "24px",
            justifyContent: "center",
          }}
        >
          {[
            { key: "positive", label: "Positive", color: "hsl(142 71% 45%)", icon: ArrowUpRight },
            { key: "neutral", label: "Neutral", color: "hsl(215 20% 55%)", icon: Activity },
            { key: "negative", label: "Negative", color: "hsl(0 84% 60%)", icon: ArrowDownRight },
          ].map((s) => (
            <div
              key={s.key}
              style={{
                textAlign: "center",
                padding: "20px 32px",
                background: `${s.color}08`,
                borderRadius: "var(--radius-lg)",
                border: `1px solid ${s.color}20`,
              }}
            >
              <s.icon size={20} style={{ color: s.color, marginBottom: "8px" }} />
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: s.color,
                  marginBottom: "4px",
                }}
              >
                {sentiment[s.key] || 0}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--color-text-tertiary)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
