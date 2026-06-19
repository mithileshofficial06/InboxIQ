"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from "recharts";
import { analytics } from "@/lib/api";

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
  "Uncategorized": "#f2f0ea",
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
      {Array.from({length:4}).map((_,i) => <div key={i} className="editorial-card skeleton" style={{ height: "140px" }} />)}
    </div>
  );

  const STATS = [
    { label: "Total Indexed", value: overview?.totalEmails || 0 },
    { label: "Received Today", value: overview?.todayEmails || 0 },
    { label: "Daily Average", value: overview?.avgPerDay || 0 },
    { label: "Unread Count", value: overview?.unreadCount || 0 },
  ];

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const maxHeat = Math.max(...(heatmapData.flat() || [1]));

  return (
    <div style={{ paddingBottom: "40px" }}>
      <h1 className="editorial-heading" style={{ fontSize: "36px", marginBottom: "40px" }}>Overview</h1>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px", marginBottom: "40px" }}>
        {STATS.map((s, i) => (
          <div key={s.label} className="editorial-card" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "32px 24px" }}>
            <div className="editorial-subheading">{s.label}</div>
            <div className="editorial-heading" style={{ fontSize: "40px", color: i === 0 ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}>{s.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "24px" }}>
        <div className="editorial-card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px", alignItems: "center" }}>
            <h3 className="editorial-heading" style={{ fontSize: "20px" }}>Volume History</h3>
            <div style={{ display: "flex", gap: "4px" }}>
              {(["daily", "weekly", "monthly"] as const).map(p => (
                <button key={p} onClick={() => setVolumePeriod(p)} style={{ padding: "4px 12px", fontSize: "12px", fontWeight: p === volumePeriod ? 600 : 400, borderRadius: "4px", border: "1px solid", borderColor: p === volumePeriod ? "var(--color-border-default)" : "transparent", background: p === volumePeriod ? "var(--color-bg-primary)" : "transparent", color: p === volumePeriod ? "var(--color-text-primary)" : "var(--color-text-tertiary)", cursor: "pointer" }}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={volume}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
              <XAxis dataKey="date" stroke="var(--color-text-tertiary)" tick={{ fill: "var(--color-text-secondary)", fontSize: 12, fontFamily: "var(--font-sans)" }} axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="var(--color-text-tertiary)" tick={{ fill: "var(--color-text-secondary)", fontSize: 12, fontFamily: "var(--font-sans)" }} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid var(--color-border-default)", borderRadius: "4px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", fontFamily: "var(--font-sans)" }} />
              <Area type="monotone" dataKey="count" stroke="var(--color-text-primary)" strokeWidth={2} fill="var(--color-bg-tertiary)" fillOpacity={1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="editorial-card">
          <h3 className="editorial-heading" style={{ fontSize: "20px", marginBottom: "32px" }}>Categories</h3>
          <ResponsiveContainer width="100%" height={180}>
            <RechartsPie>
              <Pie data={categories} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="count" stroke="none">
                {categories.map(e => <Cell key={e.name} fill={CATEGORY_COLORS[e.name] || "#e5e2db"} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid var(--color-border-default)", borderRadius: "4px" }} />
            </RechartsPie>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "24px", justifyContent: "center" }}>
            {categories.slice(0, 5).map(cat => (
              <span key={cat.name} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--color-text-secondary)" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: CATEGORY_COLORS[cat.name] || "#e5e2db" }} />
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        <div className="editorial-card">
          <h3 className="editorial-heading" style={{ fontSize: "20px", marginBottom: "32px" }}>Top Senders</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {topSenders.map((s, i) => {
              const max = topSenders[0]?.count || 1;
              return (
                <div key={s.email} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div className="editorial-subheading" style={{ width: "20px", textAlign: "right" }}>0{i+1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name || s.email}</span>
                      <span style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>{s.count}</span>
                    </div>
                    <div style={{ height: "4px", background: "var(--color-border-subtle)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(s.count / max) * 100}%`, background: "var(--color-text-primary)" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="editorial-card">
          <h3 className="editorial-heading" style={{ fontSize: "20px", marginBottom: "32px" }}>Activity Heatmap</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {days.map((day, dIdx) => (
              <div key={day} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="editorial-subheading" style={{ width: "32px" }}>{day}</span>
                {Array.from({ length: 24 }, (_, h) => {
                  const val = heatmapData[dIdx]?.[h] || 0;
                  const int = maxHeat > 0 ? val / maxHeat : 0;
                  return (
                    <div key={h} title={`${day} ${h}:00 - ${val}`} style={{ flex: 1, height: "24px", borderRadius: "2px", background: int === 0 ? "var(--color-border-subtle)" : `rgba(28, 25, 23, ${0.1 + int * 0.9})` }} />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
