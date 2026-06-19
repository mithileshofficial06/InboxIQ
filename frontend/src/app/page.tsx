"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  BarChart3,
  Brain,
  Shield,
  Sparkles,
  MessageSquare,
  Users,
  Briefcase,
  Bell,
  ArrowRight,
  ChevronRight,
  Zap,
  TrendingUp,
  Lock,
} from "lucide-react";
import { auth } from "@/lib/api";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Smart Dashboard",
    desc: "Visualize your inbox with heatmaps, charts, and real-time analytics — like Spotify Wrapped for email.",
    color: "hsl(217 91% 60%)",
  },
  {
    icon: Brain,
    title: "AI Classification",
    desc: "Every email auto-sorted into 9 categories — Bills, Jobs, Academic, People, and more.",
    color: "hsl(280 65% 60%)",
  },
  {
    icon: MessageSquare,
    title: "RAG Chat",
    desc: "Ask questions about your inbox in plain English. Powered by vector search + LLM.",
    color: "hsl(160 60% 50%)",
  },
  {
    icon: Briefcase,
    title: "Job Tracker",
    desc: "Auto-detect applications and track status — Applied → Interview → Offer — all from your emails.",
    color: "hsl(25 95% 55%)",
  },
  {
    icon: Users,
    title: "People Intelligence",
    desc: "Relationship scores, reply rates, and contact timelines for everyone in your inbox.",
    color: "hsl(142 71% 45%)",
  },
  {
    icon: Bell,
    title: "Subscription Tracker",
    desc: "Find active and dead subscriptions. Know exactly what services email you.",
    color: "hsl(340 75% 55%)",
  },
];

const CATEGORIES = [
  { name: "Bills & Invoices", color: "badge-bills" },
  { name: "Job Applications", color: "badge-jobs" },
  { name: "Orders & Deliveries", color: "badge-orders" },
  { name: "Real People", color: "badge-people" },
  { name: "Academic", color: "badge-academic" },
  { name: "Newsletters", color: "badge-newsletters" },
  { name: "Promotions", color: "badge-promos" },
  { name: "Travel & Bookings", color: "badge-travel" },
  { name: "OTPs & Notifications", color: "badge-otps" },
];

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("inboxiq_token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    window.location.href = auth.getLoginUrl();
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Mesh */}
      <div className="mesh-gradient" />

      {/* ========== Navigation ========== */}
      <nav
        className="glass sticky top-0 z-50"
        style={{ padding: "16px 32px" }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, hsl(217 91% 55%), hsl(217 91% 45%))",
                boxShadow: "0 0 20px hsl(217 91% 60% / 0.3)",
              }}
            >
              <Mail size={20} color="white" />
            </div>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
              className="gradient-text"
            >
              InboxIQ
            </span>
          </div>

          {isLoggedIn ? (
            <button
              className="btn-primary"
              onClick={() => router.push("/dashboard")}
            >
              Dashboard <ArrowRight size={16} />
            </button>
          ) : (
            <button className="btn-primary" onClick={handleLogin}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
              Sign in with Google
            </button>
          )}
        </div>
      </nav>

      {/* ========== Hero Section ========== */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "80px 32px 60px",
          textAlign: "center",
        }}
      >
        {/* Badge */}
        <div
          className="animate-fade-in"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            background: "hsl(217 91% 60% / 0.1)",
            border: "1px solid hsl(217 91% 60% / 0.25)",
            borderRadius: "9999px",
            fontSize: "13px",
            fontWeight: 600,
            color: "hsl(217 91% 70%)",
            marginBottom: "32px",
          }}
        >
          <Sparkles size={14} />
          AI-Powered Email Analytics
        </div>

        {/* Title */}
        <h1
          className="animate-slide-up"
          style={{
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            marginBottom: "24px",
          }}
        >
          Your inbox,
          <br />
          <span className="gradient-text">brilliantly understood.</span>
        </h1>

        {/* Subtitle */}
        <p
          className="animate-slide-up delay-200"
          style={{
            fontSize: "clamp(16px, 2vw, 20px)",
            color: "var(--color-text-secondary)",
            maxWidth: "640px",
            margin: "0 auto 40px",
            lineHeight: 1.7,
          }}
        >
          InboxIQ transforms your Gmail into an interactive analytics dashboard.
          AI classifies, embeds, and indexes every email — so you can search,
          analyze, and understand your inbox like never before.
        </p>

        {/* CTA Buttons */}
        <div
          className="animate-slide-up delay-300"
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn-primary animate-pulse-glow"
            onClick={isLoggedIn ? () => router.push("/dashboard") : handleLogin}
            style={{ fontSize: "16px", padding: "14px 32px" }}
          >
            {isLoggedIn ? "Open Dashboard" : "Get Started — Free"}
            <ArrowRight size={18} />
          </button>
          <button className="btn-ghost" style={{ fontSize: "16px", padding: "14px 28px" }}>
            <Lock size={16} />
            Read-only. 100% private.
          </button>
        </div>

        {/* Tech Badges */}
        <div
          className="animate-fade-in delay-500"
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: "48px",
          }}
        >
          {["Next.js", "Node.js", "FastAPI", "pgvector", "RAG", "OAuth 2.0"].map(
            (tech) => (
              <span
                key={tech}
                style={{
                  padding: "6px 14px",
                  background: "var(--color-bg-tertiary)",
                  border: "1px solid var(--color-border-default)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {tech}
              </span>
            )
          )}
        </div>
      </section>

      {/* ========== Stats Bar ========== */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "0 32px 80px",
        }}
      >
        <div
          className="glass-card"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1px",
            background: "var(--color-border-subtle)",
            borderRadius: "var(--radius-xl)",
            overflow: "hidden",
          }}
        >
          {[
            { label: "Email Categories", value: "9", icon: Zap },
            { label: "Vector Search", value: "pgvector", icon: Brain },
            { label: "Deployment Cost", value: "₹0", icon: TrendingUp },
            { label: "Privacy Scope", value: "Read-only", icon: Shield },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                padding: "28px 24px",
                textAlign: "center",
                background: "var(--color-bg-card)",
              }}
            >
              <stat.icon
                size={20}
                style={{
                  color: "var(--color-accent)",
                  marginBottom: "8px",
                }}
              />
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  marginBottom: "4px",
                }}
                className="gradient-text"
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--color-text-tertiary)",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== Features Grid ========== */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 32px 100px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2
            style={{
              fontSize: "36px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: "16px",
            }}
          >
            Everything your inbox{" "}
            <span className="gradient-text">should have been.</span>
          </h2>
          <p
            style={{
              fontSize: "17px",
              color: "var(--color-text-secondary)",
              maxWidth: "560px",
              margin: "0 auto",
            }}
          >
            From AI classification to natural language search — InboxIQ gives
            your emails the intelligence layer they deserve.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "20px",
          }}
        >
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="glass-card"
              style={{
                padding: "32px",
                opacity: 0,
                animation: `fadeIn 0.5s ease-out ${i * 100}ms forwards`,
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${feature.color}15`,
                  marginBottom: "20px",
                }}
              >
                <feature.icon size={24} style={{ color: feature.color }} />
              </div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  marginBottom: "10px",
                  letterSpacing: "-0.01em",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.7,
                }}
              >
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== Categories Section ========== */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 32px 100px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2
            style={{
              fontSize: "32px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: "12px",
            }}
          >
            9 Smart Categories
          </h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "16px" }}>
            Every email automatically classified by AI
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          {CATEGORIES.map((cat) => (
            <span
              key={cat.name}
              className={`badge ${cat.color}`}
              style={{ padding: "8px 18px", fontSize: "14px" }}
            >
              {cat.name}
            </span>
          ))}
        </div>
      </section>

      {/* ========== CTA Section ========== */}
      <section
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "60px 32px 120px",
          textAlign: "center",
        }}
      >
        <div
          className="glass-card"
          style={{
            padding: "60px 40px",
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
              background: "linear-gradient(90deg, hsl(217 91% 60%), hsl(280 65% 60%), hsl(160 60% 50%))",
            }}
          />
          <h2
            style={{
              fontSize: "32px",
              fontWeight: 800,
              marginBottom: "16px",
              letterSpacing: "-0.02em",
            }}
          >
            Ready to understand your inbox?
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "var(--color-text-secondary)",
              marginBottom: "32px",
              maxWidth: "480px",
              margin: "0 auto 32px",
              lineHeight: 1.7,
            }}
          >
            Connect your Gmail with read-only access. InboxIQ never sends,
            deletes, or modifies any email. Ever.
          </p>
          <button
            className="btn-primary"
            onClick={isLoggedIn ? () => router.push("/dashboard") : handleLogin}
            style={{ fontSize: "16px", padding: "16px 36px" }}
          >
            {isLoggedIn ? "Go to Dashboard" : "Connect Gmail — Free"}
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* ========== Footer ========== */}
      <footer
        style={{
          borderTop: "1px solid var(--color-border-subtle)",
          padding: "32px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <Mail size={16} style={{ color: "var(--color-accent)" }} />
          <span
            style={{ fontWeight: 700, fontSize: "14px" }}
            className="gradient-text"
          >
            InboxIQ
          </span>
        </div>
        <p
          style={{
            fontSize: "12px",
            color: "var(--color-text-tertiary)",
          }}
        >
          Built with Next.js, FastAPI, pgvector, and Gemini. Zero cost, 100% private.
        </p>
      </footer>
    </div>
  );
}
