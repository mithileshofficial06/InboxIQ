"use client";

import { useEffect, useState } from "react";
import { jobs as jobsApi } from "@/lib/api";

const STATUS_ORDER = ["applied", "replied", "interview", "offer", "rejected"];
const STATUS_COLORS: Record<string, string> = {
  applied: "var(--color-slate)", replied: "var(--color-ochre)", interview: "var(--color-dusty-rose)", offer: "var(--color-sage)", rejected: "var(--color-terracotta)"
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
      {Array.from({length:3}).map((_,i) => <div key={i} className="editorial-card skeleton" style={{ height: "120px" }} />)}
    </div>
  );

  return (
    <div style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
      <h1 className="editorial-heading" style={{ fontSize: "36px", borderBottom: "1px solid var(--color-border-default)", paddingBottom: "24px", marginBottom: "40px" }}>Careers</h1>
      
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "48px" }}>
          <div style={{ padding: "24px", borderLeft: "2px solid var(--color-text-primary)" }}>
            <div className="editorial-subheading" style={{ marginBottom: "12px" }}>Applications</div>
            <div className="editorial-heading" style={{ fontSize: "40px" }}>{stats.total}</div>
          </div>
          <div style={{ padding: "24px", borderLeft: "2px solid var(--color-sage)" }}>
            <div className="editorial-subheading" style={{ marginBottom: "12px", color: "var(--color-sage)" }}>Response Rate</div>
            <div className="editorial-heading" style={{ fontSize: "40px", color: "var(--color-sage)" }}>{stats.responseRate}%</div>
          </div>
          <div style={{ padding: "24px", borderLeft: "2px solid var(--color-dusty-rose)" }}>
            <div className="editorial-subheading" style={{ marginBottom: "12px", color: "var(--color-dusty-rose)" }}>Interviews</div>
            <div className="editorial-heading" style={{ fontSize: "40px", color: "var(--color-dusty-rose)" }}>{stats.statusCounts?.interview || 0}</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "32px", overflowX: "auto", paddingBottom: "24px", flex: 1 }}>
        {STATUS_ORDER.map(status => (
          <div key={status} style={{ minWidth: "300px", maxWidth: "300px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", paddingBottom: "12px", borderBottom: `2px solid ${STATUS_COLORS[status]}` }}>
              <span className="editorial-subheading" style={{ color: "var(--color-text-primary)" }}>{status}</span>
              <span style={{ marginLeft: "auto", fontSize: "14px", color: "var(--color-text-secondary)" }}>
                {jobsByStatus[status].length}
              </span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", flex: 1, paddingRight: "8px" }}>
              {jobsByStatus[status].map(job => (
                <div key={job.id} className="editorial-card" style={{ padding: "24px", borderRadius: "4px" }}>
                  <div className="editorial-heading" style={{ fontSize: "18px", marginBottom: "8px" }}>{job.company_name}</div>
                  <div style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "24px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job.role || "Role unspecified"}</div>
                  <div className="editorial-subheading" style={{ color: "var(--color-text-tertiary)" }}>
                    {job.applied_date ? new Date(job.applied_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Date unknown"}
                  </div>
                </div>
              ))}
              {jobsByStatus[status].length === 0 && (
                <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--color-text-tertiary)", fontStyle: "italic", fontSize: "14px" }}>
                  No records.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
