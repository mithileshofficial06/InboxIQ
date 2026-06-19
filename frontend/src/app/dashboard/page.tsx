"use client";

import { useEffect, useState } from "react";
import { Mail, TrendingUp, Calendar, Eye } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from "recharts";
import { analytics } from "@/lib/api";

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
  "Uncategorized": "#94a3b8",
};

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [volume, setVolume] = useState<any[]>([]);
  const [topSenders, setTopSenders] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<number[][]>([]);
  const [sentiment, setSentiment] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [volumePeriod, setVolumePeriod] = useState<"daily" | "weekly" | "monthly">("weekly");

  useEffect(() => { loadDashboardData(); }, []);
  useEffect(() => { analytics.volume(volumePeriod).then(d => setVolume(d.volume)).catch(console.error); }, [volumePeriod]);

  async function loadDashboardData() {
    try {
      const [o, c, v, s, h, se] = await Promise.all([
        analytics.overview(), analytics.categories(), analytics.volume("weekly"),
        analytics.topSenders(8), analytics.heatmap(), analytics.sentiment()
      ]);
      setOverview(o); setCategories(c.categories); setVolume(v.volume);
      setTopSenders(s.topSenders); setHeatmapData(h.heatmap); setSentiment(se.distribution);
    } catch {} finally { setLoading(false); }
  }

  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
      {Array.from({length:4}).map((_,i) => <div key={i} className="glass-card skeleton" style={{ height: "120px" }} />)}
    </div>
  );

  const STATS = [
    { label: "Total Indexed", value: overview?.totalEmails || 0, icon: Mail, color: "#4f46e5" },
    { label: "Received Today", value: overview?.todayEmails || 0, icon: Calendar, color: "#0ea5e9" },
    { label: "Daily Average", value: overview?.avgPerDay || 0, icon: TrendingUp, color: "#10b981" },
    { label: "Unread Count", value: overview?.unreadCount || 0, icon: Eye, color: "#f59e0b" },
  ];

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const maxHeat = Math.max(...(heatmapData.flat() || [1]));

  return (
    <div style={{ paddingBottom: "40px" }}>
      <h1 className="glass-heading" style={{ fontSize: "32px", marginBottom: "32px" }}>Overview</h1>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        {STATS.map(s => (
          <div key={s.label} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-secondary)" }}>{s.label}</span>
              <div style={{ padding: "8px", background: `${s.color}15`, borderRadius: "12px", color: s.color }}>
                <s.icon size={20} />
              </div>
            </div>
            <div className="glass-heading" style={{ fontSize: "36px" }}>{s.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "24px" }}>
        <div className="glass-card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", alignItems: "center" }}>
            <h3 className="glass-heading" style={{ fontSize: "18px" }}>Volume History</h3>
            <div style={{ display: "flex", gap: "8px", background: "rgba(255,255,255,0.5)", padding: "4px", borderRadius: "100px" }}>
              {(["daily", "weekly", "monthly"] as const).map(p => (
                <button key={p} onClick={() => setVolumePeriod(p)} style={{ padding: "6px 12px", fontSize: "12px", fontWeight: 600, borderRadius: "100px", border: "none", background: volumePeriod === p ? "#fff" : "transparent", color: volumePeriod === p ? "var(--color-accent)" : "var(--color-text-secondary)", boxShadow: volumePeriod === p ? "0 2px 8px rgba(0,0,0,0.05)" : "none", cursor: "pointer", transition: "all 0.2s" }}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={volume}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="date" stroke="var(--color-text-tertiary)" tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="var(--color-text-tertiary)" tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip contentStyle={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.5)", borderRadius: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }} />
              <Area type="monotone" dataKey="count" stroke="var(--color-accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card">
          <h3 className="glass-heading" style={{ fontSize: "18px", marginBottom: "24px" }}>Categories</h3>
          <ResponsiveContainer width="100%" height={180}>
            <RechartsPie>
              <Pie data={categories} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="count" stroke="none">
                {categories.map(e => <Cell key={e.name} fill={CATEGORY_COLORS[e.name] || "#94a3b8"} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }} />
            </RechartsPie>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px", justifyContent: "center" }}>
            {categories.slice(0, 5).map(cat => (
              <span key={cat.name} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: CATEGORY_COLORS[cat.name] || "#94a3b8" }} />
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        <div className="glass-card">
          <h3 className="glass-heading" style={{ fontSize: "18px", marginBottom: "24px" }}>Top Senders</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {topSenders.map((s, i) => {
              const max = topSenders[0]?.count || 1;
              return (
                <div key={s.email} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(79, 70, 229, 0.1)", color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>{i+1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name || s.email}</span>
                      <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: 500 }}>{s.count}</span>
                    </div>
                    <div style={{ height: "6px", background: "rgba(0,0,0,0.05)", borderRadius: "100px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(s.count / max) * 100}%`, background: "var(--color-accent)", borderRadius: "100px" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card">
          <h3 className="glass-heading" style={{ fontSize: "18px", marginBottom: "24px" }}>Activity Heatmap</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {days.map((day, dIdx) => (
              <div key={day} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "32px", fontSize: "12px", fontWeight: 600, color: "var(--color-text-secondary)" }}>{day}</span>
                {Array.from({ length: 24 }, (_, h) => {
                  const val = heatmapData[dIdx]?.[h] || 0;
                  const int = maxHeat > 0 ? val / maxHeat : 0;
                  return (
                    <div key={h} title={`${day} ${h}:00 - ${val}`} style={{ flex: 1, height: "18px", borderRadius: "4px", background: int === 0 ? "rgba(0,0,0,0.03)" : `rgba(79, 70, 229, ${0.1 + int * 0.9})`, transition: "transform 0.1s" }} className="hover:scale-110" />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sentiment Overview */}
      <div className="glass-card">
        <h3 className="glass-heading" style={{ fontSize: "18px", marginBottom: "24px" }}>Sentiment Analysis</h3>
        <div style={{ display: "flex", gap: "24px", justifyContent: "center" }}>
          {[
            { k: "positive", l: "Positive", c: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
            { k: "neutral", l: "Neutral", c: "#64748b", bg: "rgba(100, 116, 139, 0.1)" },
            { k: "negative", l: "Negative", c: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" }
          ].map(s => (
            <div key={s.k} style={{ flex: 1, padding: "24px", borderRadius: "20px", background: s.bg, textAlign: "center" }}>
              <div style={{ fontSize: "36px", fontWeight: 800, color: s.c, marginBottom: "8px" }}>{sentiment[s.k] || 0}</div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-secondary)" }}>{s.l} Emails</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
