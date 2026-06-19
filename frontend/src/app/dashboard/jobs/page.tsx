"use client";

import { useEffect, useState } from "react";
import { Briefcase, ArrowRight, BarChart3, Clock, CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import { jobs as jobsApi } from "@/lib/api";

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any }> = {
  applied: { color: "hsl(217 91% 70%)", bg: "hsl(217 91% 60% / 0.12)", icon: ArrowRight },
  replied: { color: "hsl(38 92% 65%)", bg: "hsl(38 92% 50% / 0.12)", icon: MessageSquare },
  interview: { color: "hsl(280 65% 70%)", bg: "hsl(280 65% 60% / 0.12)", icon: Clock },
  offer: { color: "hsl(142 71% 60%)", bg: "hsl(142 71% 45% / 0.12)", icon: CheckCircle2 },
  rejected: { color: "hsl(0 84% 65%)", bg: "hsl(0 84% 60% / 0.12)", icon: XCircle },
};

const STATUS_ORDER = ["applied", "replied", "interview", "offer", "rejected"];

interface Job {
  id: string;
  company_name: string;
  role: string;
  status: string;
  applied_date: string;
  last_update_date: string;
}

interface Stats {
  total: number;
  statusCounts: Record<string, number>;
  responseRate: number;
}

export default function JobsPage() {
  const [jobsList, setJobsList] = useState<Job[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [jobData, statsData] = await Promise.all([
        jobsApi.list(),
        jobsApi.getStats(),
      ]);
      setJobsList(jobData.jobs);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load jobs:", error);
    } finally {
      setLoading(false);
    }
  }

  // Group jobs by status for Kanban view
  const jobsByStatus: Record<string, Job[]> = {};
  STATUS_ORDER.forEach((s) => (jobsByStatus[s] = []));
  jobsList.forEach((job) => {
    if (jobsByStatus[job.status]) {
      jobsByStatus[job.status].push(job);
    }
  });

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "28px" }}>Job Tracker</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
          {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: "100px" }} />)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton" style={{ height: "300px" }} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "6px" }}>
        Job Application Tracker
      </h1>
      <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "24px" }}>
        Auto-detected from your emails • Track your application pipeline
      </p>

      {/* Stats */}
      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            marginBottom: "28px",
          }}
        >
          <div className="stat-card">
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
              Total Applications
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800 }}>{stats.total}</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
              Response Rate
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--color-success)" }}>{stats.responseRate}%</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
              Interviews
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "hsl(280 65% 65%)" }}>
              {stats.statusCounts?.interview || 0}
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${STATUS_ORDER.length}, minmax(200px, 1fr))`,
          gap: "12px",
          overflowX: "auto",
        }}
      >
        {STATUS_ORDER.map((status) => {
          const config = STATUS_CONFIG[status];
          const StatusIcon = config.icon;
          return (
            <div key={status}>
              {/* Column header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  marginBottom: "8px",
                  borderRadius: "var(--radius-md)",
                  background: config.bg,
                }}
              >
                <StatusIcon size={14} style={{ color: config.color }} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: config.color, textTransform: "capitalize" }}>
                  {status}
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: config.color,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {jobsByStatus[status].length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {jobsByStatus[status].map((job) => (
                  <div
                    key={job.id}
                    className="glass-card"
                    style={{ padding: "14px" }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "4px" }}>
                      {job.company_name}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginBottom: "8px" }}>
                      {job.role || "Position not specified"}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>
                      {job.applied_date ? new Date(job.applied_date).toLocaleDateString() : ""}
                    </div>
                  </div>
                ))}
                {jobsByStatus[status].length === 0 && (
                  <div
                    style={{
                      padding: "24px 14px",
                      textAlign: "center",
                      fontSize: "12px",
                      color: "var(--color-text-tertiary)",
                      border: "1px dashed var(--color-border-subtle)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    No applications
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {jobsList.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--color-text-secondary)", marginTop: "20px" }}>
          <Briefcase size={40} style={{ color: "var(--color-text-tertiary)", marginBottom: "16px" }} />
          <p style={{ fontSize: "16px", fontWeight: 600 }}>No job applications detected</p>
          <p style={{ fontSize: "13px" }}>Job-related emails will be auto-tracked after syncing.</p>
        </div>
      )}
    </div>
  );
}
