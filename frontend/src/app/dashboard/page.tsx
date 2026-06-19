"use client";

import { useEffect, useState } from "react";
import { Mail, TrendingUp, Calendar, Eye, BarChart3, PieChart, Activity, Clock, Users } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from "recharts";
import { analytics } from "@/lib/api";

const CATEGORY_COLORS: Record<string, string> = {
  "Bills & Invoices": "#bc13fe",
  "Job Applications": "#00ff41",
  "Orders & Deliveries": "#ffb800",
  "OTPs & Notifications": "#ff007f",
  "Newsletters": "#00e5ff",
  "Real People": "#00ff41",
  "Academic": "#ff5e00",
  "Promotions": "#ff003c",
  "Travel & Bookings": "#0055ff",
  "Uncategorized": "#ffffff",
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

  if (loading) return <div className="brutal-text" style={{ fontSize: "32px" }}>INITIALIZING_DASHBOARD...</div>;

  const STATS = [
    { label: "TOTAL", value: overview?.totalEmails || 0, icon: Mail },
    { label: "TODAY", value: overview?.todayEmails || 0, icon: Calendar },
    { label: "AVG/DAY", value: overview?.avgPerDay || 0, icon: TrendingUp },
    { label: "UNREAD", value: overview?.unreadCount || 0, icon: Eye },
  ];

  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const maxHeat = Math.max(...(heatmapData.flat() || [1]));

  return (
    <div>
      <h1 className="brutal-text" style={{ fontSize: "40px", marginBottom: "32px", borderBottom: "4px solid #fff", paddingBottom: "16px" }}>OVERVIEW</h1>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px", marginBottom: "40px" }}>
        {STATS.map(s => (
          <div key={s.label} className="brutal-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: "bold", fontSize: "16px" }}>[{s.label}]</span>
              <s.icon size={24} style={{ color: "var(--color-accent)" }} />
            </div>
            <div className="brutal-text" style={{ fontSize: "48px" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "24px" }}>
        <div className="brutal-card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", alignItems: "center" }}>
            <h3 className="brutal-text" style={{ fontSize: "20px" }}>VOLUME_HISTORY</h3>
            <div style={{ display: "flex", gap: "8px" }}>
              {(["daily", "weekly", "monthly"] as const).map(p => (
                <button key={p} onClick={() => setVolumePeriod(p)} className={volumePeriod === p ? "brutal-btn" : "brutal-btn-ghost"} style={{ padding: "4px 8px", fontSize: "12px" }}>{p}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={volume}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#fff" tick={{ fontFamily: "var(--font-mono)", fill: "#fff", fontSize: 12 }} />
              <YAxis stroke="#fff" tick={{ fontFamily: "var(--font-mono)", fill: "#fff", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "#000", border: "2px solid #fff", borderRadius: 0, fontFamily: "var(--font-mono)", fontWeight: "bold" }} />
              <Area type="step" dataKey="count" stroke="var(--color-accent)" strokeWidth={4} fill="var(--color-accent)" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="brutal-card">
          <h3 className="brutal-text" style={{ fontSize: "20px", marginBottom: "24px" }}>CATEGORIES</h3>
          <ResponsiveContainer width="100%" height={180}>
            <RechartsPie>
              <Pie data={categories} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" stroke="#000" strokeWidth={2}>
                {categories.map(e => <Cell key={e.name} fill={CATEGORY_COLORS[e.name] || "#fff"} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#000", border: "2px solid #fff", borderRadius: 0, fontFamily: "var(--font-mono)" }} />
            </RechartsPie>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
            {categories.slice(0, 6).map(cat => (
              <span key={cat.name} style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "bold", background: CATEGORY_COLORS[cat.name] || "#fff", color: "#000", padding: "2px 6px" }}>
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        <div className="brutal-card">
          <h3 className="brutal-text" style={{ fontSize: "20px", marginBottom: "24px" }}>TOP_SENDERS</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {topSenders.map((s, i) => {
              const max = topSenders[0]?.count || 1;
              return (
                <div key={s.email} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: "bold", width: "24px" }}>{i+1}.</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name || s.email}</div>
                    <div style={{ height: "8px", background: "#333", border: "1px solid #fff", marginTop: "4px" }}>
                      <div style={{ height: "100%", width: `${(s.count / max) * 100}%`, background: "var(--color-accent)" }} />
                    </div>
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: "bold" }}>[{s.count}]</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="brutal-card">
          <h3 className="brutal-text" style={{ fontSize: "20px", marginBottom: "24px" }}>ACTIVITY_HEATMAP</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontFamily: "var(--font-mono)" }}>
            {days.map((day, dIdx) => (
              <div key={day} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "32px", fontSize: "12px", fontWeight: "bold" }}>{day}</span>
                {Array.from({ length: 24 }, (_, h) => {
                  const val = heatmapData[dIdx]?.[h] || 0;
                  const int = maxHeat > 0 ? val / maxHeat : 0;
                  return (
                    <div key={h} title={`${day} ${h}:00 - ${val}`} style={{ width: "16px", height: "16px", border: "1px solid #333", background: int === 0 ? "transparent" : `rgba(0, 255, 65, ${0.2 + int * 0.8})` }} />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="brutal-card">
        <h3 className="brutal-text" style={{ fontSize: "20px", marginBottom: "24px" }}>SENTIMENT_ANALYSIS</h3>
        <div style={{ display: "flex", gap: "24px", justifyContent: "center" }}>
          {[
            { k: "positive", l: "POSITIVE", c: "var(--color-success)" },
            { k: "neutral", l: "NEUTRAL", c: "#fff" },
            { k: "negative", l: "NEGATIVE", c: "var(--color-danger)" }
          ].map(s => (
            <div key={s.k} style={{ padding: "24px 48px", border: `4px solid ${s.c}`, background: "#000", textAlign: "center", boxShadow: `4px 4px 0px 0px ${s.c}` }}>
              <div className="brutal-text" style={{ fontSize: "40px", color: s.c }}>{sentiment[s.k] || 0}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: "bold", color: s.c }}>[{s.l}]</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
