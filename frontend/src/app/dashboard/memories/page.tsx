"use client";

import { Sparkles, Calendar, Heart, Star, Briefcase, GraduationCap } from "lucide-react";

const SAMPLE_MEMORIES = [
  {
    type: "first_email",
    icon: Heart,
    color: "hsl(340 75% 55%)",
    title: "First email from someone special",
    description: "Memories are populated after your inbox is synced and processed",
    date: "",
  },
  {
    type: "offer_letter",
    icon: Briefcase,
    color: "hsl(142 71% 45%)",
    title: "Your first offer letter",
    description: "Job offer emails are detected and highlighted here",
    date: "",
  },
  {
    type: "admission",
    icon: GraduationCap,
    color: "hsl(217 91% 60%)",
    title: "University admission confirmation",
    description: "Academic milestones from your email history",
    date: "",
  },
  {
    type: "milestone",
    icon: Star,
    color: "hsl(38 92% 50%)",
    title: "First internship application",
    description: "Career milestones detected from job-related emails",
    date: "",
  },
];

export default function MemoriesPage() {
  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "6px" }}>
        Memories & Highlights
      </h1>
      <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "32px" }}>
        Milestone emails and &quot;on this day&quot; highlights from your inbox
      </p>

      {/* On This Day Card */}
      <div
        className="glass-card"
        style={{
          padding: "32px",
          marginBottom: "32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, hsl(340 75% 55%), hsl(280 65% 60%), hsl(217 91% 60%))",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, hsl(340 75% 55% / 0.2), hsl(280 65% 60% / 0.2))",
            }}
          >
            <Calendar size={24} style={{ color: "hsl(340 75% 70%)" }} />
          </div>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700 }}>On This Day</h2>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
              {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
          Once your inbox is synced, you&apos;ll see emails from this date in previous years.
          Think of it as your email time machine! 🚀
        </p>
      </div>

      {/* Milestone Types */}
      <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>
        Email Milestones
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "12px",
        }}
      >
        {SAMPLE_MEMORIES.map((memory, i) => (
          <div
            key={memory.type}
            className="glass-card"
            style={{
              padding: "24px",
              opacity: 0,
              animation: `fadeIn 0.4s ease-out ${i * 100}ms forwards`,
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${memory.color}15`,
                marginBottom: "16px",
              }}
            >
              <memory.icon size={20} style={{ color: memory.color }} />
            </div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px" }}>
              {memory.title}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
              {memory.description}
            </p>
          </div>
        ))}
      </div>

      {/* Coming Soon */}
      <div
        style={{
          marginTop: "40px",
          padding: "40px",
          textAlign: "center",
          border: "1px dashed var(--color-border-default)",
          borderRadius: "var(--radius-xl)",
        }}
      >
        <Sparkles size={32} style={{ color: "var(--color-accent)", marginBottom: "12px" }} />
        <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
          Memories are built from your data
        </h3>
        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", maxWidth: "480px", margin: "0 auto" }}>
          Sync your inbox to unlock personalized memories. InboxIQ detects milestones like your first offer letter,
          admission confirmations, and more — surfaced as highlights you&apos;ll love revisiting.
        </p>
      </div>
    </div>
  );
}
