"use client";

import { useEffect, useState } from "react";
import { jobs as jobsApi } from "@/lib/api";
import { Briefcase, Activity, CheckCircle, XCircle } from "lucide-react";

const STATUS_ORDER = ["applied", "replied", "interview", "offer", "rejected"];
const STATUS_COLORS: Record<string, string> = {
  applied: "#64748b", replied: "#f59e0b", interview: "#a855f7", offer: "#10b981", rejected: "#ef4444"
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

  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "40px" }}>
      {Array.from({length:3}).map((_,i) => <div key={i} className="glass-card skeleton" style={{ height: "120px" }} />)}
    </div>
  );

  return (
    <div style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
      <h1 className="glass-heading" style={{ fontSize: "32px", marginBottom: "32px" }}>Career Pipeline</h1>
      
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-secondary)" }}>Total Applications</span>
              <div style={{ padding: "8px", background: "rgba(100, 116, 139, 0.1)", borderRadius: "12px", color: "#64748b" }}><Briefcase size={20} /></div>
            </div>
            <div className="glass-heading" style={{ fontSize: "36px", color: "#64748b" }}>{stats.total}</div>
          </div>
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-secondary)" }}>Response Rate</span>
              <div style={{ padding: "8px", background: "rgba(79, 70, 229, 0.1)", borderRadius: "12px", color: "var(--color-accent)" }}><Activity size={20} /></div>
            </div>
            <div className="glass-heading" style={{ fontSize: "36px", color: "var(--color-accent)" }}>{stats.responseRate}%</div>
          </div>
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-secondary)" }}>Interviews Secured</span>
              <div style={{ padding: "8px", background: "rgba(168, 85, 247, 0.1)", borderRadius: "12px", color: "#a855f7" }}><CheckCircle size={20} /></div>
            </div>
            <div className="glass-heading" style={{ fontSize: "36px", color: "#a855f7" }}>{stats.statusCounts?.interview || 0}</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "24px", overflowX: "auto", paddingBottom: "24px", flex: 1 }}>
        {STATUS_ORDER.map(status => (
          <div key={status} className="glass-card" style={{ minWidth: "300px", maxWidth: "300px", display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: STATUS_COLORS[status] }} />
              <span style={{ fontWeight: 700, fontSize: "15px", color: "var(--color-text-primary)", textTransform: "capitalize" }}>{status}</span>
              <span style={{ marginLeft: "auto", background: "rgba(255,255,255,0.7)", padding: "2px 10px", borderRadius: "100px", fontSize: "12px", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                {jobsByStatus[status].length}
              </span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", flex: 1, paddingRight: "8px" }}>
              {jobsByStatus[status].map(job => (
                <div key={job.id} style={{ background: "rgba(255,255,255,0.7)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", cursor: "pointer", transition: "transform 0.2s" }} className="hover:-translate-y-1">
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--color-text-primary)", marginBottom: "4px" }}>{job.company_name}</div>
                  <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "16px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job.role || "Role unspecified"}</div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {job.applied_date ? new Date(job.applied_date).toLocaleDateString() : "Date unknown"}
                  </div>
                </div>
              ))}
              {jobsByStatus[status].length === 0 && (
                <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--color-text-tertiary)", fontSize: "13px", fontWeight: 500 }}>
                  No applications in this stage.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
