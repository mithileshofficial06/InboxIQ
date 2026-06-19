"use client";

import { useEffect, useState } from "react";
import { jobs as jobsApi } from "@/lib/api";

const STATUS_ORDER = ["applied", "replied", "interview", "offer", "rejected"];
const STATUS_COLORS: Record<string, string> = {
  applied: "#fff", replied: "#ffb800", interview: "#bc13fe", offer: "#00ff41", rejected: "#ff003c"
};

export default function JobsPage() {
  const [jobsList, setJobsList] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [j, s] = await Promise.all([jobsApi.list(), jobsApi.getStats()]);
      setJobsList(j.jobs); setStats(s);
    } catch {} finally { setLoading(false); }
  }

  const jobsByStatus: Record<string, any[]> = {};
  STATUS_ORDER.forEach(s => jobsByStatus[s] = []);
  jobsList.forEach(j => { if (jobsByStatus[j.status]) jobsByStatus[j.status].push(j); });

  if (loading) return <div className="brutal-text" style={{ fontSize: "32px" }}>COMPILING_JOB_DATA...</div>;

  return (
    <div>
      <h1 className="brutal-text" style={{ fontSize: "40px", marginBottom: "32px", borderBottom: "4px solid #fff", paddingBottom: "16px" }}>CAREER_PIPELINE</h1>
      
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          <div className="brutal-card">
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: "bold", marginBottom: "8px" }}>[TOTAL_APPS]</div>
            <div className="brutal-text" style={{ fontSize: "40px" }}>{stats.total}</div>
          </div>
          <div className="brutal-card" style={{ borderColor: "var(--color-accent)", boxShadow: "var(--shadow-brutal-accent)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: "bold", marginBottom: "8px", color: "var(--color-accent)" }}>[RESPONSE_RATE]</div>
            <div className="brutal-text" style={{ fontSize: "40px", color: "var(--color-accent)" }}>{stats.responseRate}%</div>
          </div>
          <div className="brutal-card" style={{ borderColor: "#bc13fe", boxShadow: "6px 6px 0px 0px #bc13fe" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: "bold", marginBottom: "8px", color: "#bc13fe" }}>[INTERVIEWS]</div>
            <div className="brutal-text" style={{ fontSize: "40px", color: "#bc13fe" }}>{stats.statusCounts?.interview || 0}</div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${STATUS_ORDER.length}, minmax(240px, 1fr))`, gap: "24px", overflowX: "auto", paddingBottom: "24px" }}>
        {STATUS_ORDER.map(status => (
          <div key={status} style={{ minWidth: "240px" }}>
            <div style={{ padding: "12px", border: `3px solid ${STATUS_COLORS[status]}`, background: "#000", fontFamily: "var(--font-mono)", fontWeight: "bold", textTransform: "uppercase", display: "flex", justifyContent: "space-between", marginBottom: "16px", boxShadow: `4px 4px 0px 0px ${STATUS_COLORS[status]}`, color: STATUS_COLORS[status] }}>
              <span>{status}</span>
              <span>[{jobsByStatus[status].length}]</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {jobsByStatus[status].map(job => (
                <div key={job.id} className="brutal-card" style={{ padding: "16px" }}>
                  <div style={{ fontFamily: "var(--font-sans)", fontWeight: 900, fontSize: "16px", textTransform: "uppercase", marginBottom: "8px", wordBreak: "break-word" }}>{job.company_name}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#aaa", marginBottom: "16px" }}>{job.role || "UNKNOWN_ROLE"}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: "bold", background: "#222", padding: "4px 8px", border: "2px solid #555", display: "inline-block" }}>
                    {job.applied_date ? job.applied_date.split('T')[0] : "NO_DATE"}
                  </div>
                </div>
              ))}
              {jobsByStatus[status].length === 0 && (
                <div style={{ padding: "24px", border: "3px dashed #444", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "12px", color: "#666" }}>
                  NO_DATA
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
