"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Inbox, ShieldCheck, PieChart, MessagesSquare } from "lucide-react";
import { auth } from "@/lib/api";

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("inboxiq_token");
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLogin = () => {
    window.location.href = auth.getLoginUrl();
  };

  return (
    <div className="min-h-screen">
      
      {/* ========== Navigation ========== */}
      <nav style={{ padding: "24px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--color-border-default)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", background: "var(--color-text-primary)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Inbox size={16} color="#fff" />
          </div>
          <span className="editorial-heading" style={{ fontSize: "20px", letterSpacing: "0.02em" }}>InboxIQ</span>
        </div>
        {isLoggedIn ? (
          <button className="editorial-btn" onClick={() => router.push("/dashboard")}>
            Dashboard
          </button>
        ) : (
          <button className="editorial-btn" onClick={handleLogin}>
            Sign In
          </button>
        )}
      </nav>

      {/* ========== Hero Section ========== */}
      <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "120px 32px 80px", textAlign: "center" }}>
        <div className="editorial-subheading" style={{ marginBottom: "24px", color: "var(--color-sage)" }}>
          Intelligence for your inbox
        </div>
        
        <h1 className="editorial-heading" style={{ fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 1.1, marginBottom: "32px", color: "var(--color-text-primary)" }}>
          The elegant way to <br />
          <span style={{ fontStyle: "italic", color: "var(--color-slate)" }}>understand your email.</span>
        </h1>
        
        <p style={{ fontSize: "18px", color: "var(--color-text-secondary)", maxWidth: "600px", margin: "0 auto 48px", lineHeight: 1.7, fontWeight: 400 }}>
          InboxIQ applies refined machine learning to categorize, analyze, and extract insights from your communication data—securely and privately.
        </p>
        
        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <button className="editorial-btn-primary" style={{ padding: "16px 32px", fontSize: "15px" }} onClick={isLoggedIn ? () => router.push("/dashboard") : handleLogin}>
            {isLoggedIn ? "Open Dashboard" : "Connect with Google"} <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ========== Features Grid ========== */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 32px 120px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px" }}>
          {[
            { title: "Categorization", desc: "Automated sorting into precise, logical financial and personal buckets.", icon: PieChart },
            { title: "Natural Language", desc: "Query your historical communications with conversational precision.", icon: MessagesSquare },
            { title: "Strict Privacy", desc: "Read-only access ensures your data remains fundamentally untempered.", icon: ShieldCheck },
          ].map((f, i) => (
            <div key={i} className="editorial-card" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "40px" }}>
              <f.icon size={28} style={{ color: "var(--color-text-primary)", marginBottom: "24px" }} strokeWidth={1.5} />
              <h3 className="editorial-heading" style={{ fontSize: "22px", marginBottom: "12px" }}>{f.title}</h3>
              <p style={{ fontSize: "15px", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* ========== Footer ========== */}
      <footer style={{ borderTop: "1px solid var(--color-border-default)", padding: "40px", textAlign: "center" }}>
        <div className="editorial-heading" style={{ fontSize: "18px", marginBottom: "8px" }}>InboxIQ</div>
        <div className="editorial-subheading" style={{ fontSize: "10px" }}>© {new Date().getFullYear()}</div>
      </footer>
    </div>
  );
}
