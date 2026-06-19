"use client";

import { useEffect, useState } from "react";
import { Users, Mail, ArrowUpRight, Search } from "lucide-react";
import { people as peopleApi } from "@/lib/api";

interface Contact {
  email: string;
  name: string;
  emailCount: number;
  lastEmailDate: string;
  firstEmailDate: string;
}

export default function PeoplePage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"frequency" | "recency">("frequency");

  useEffect(() => {
    loadContacts();
  }, [sort]);

  async function loadContacts() {
    setLoading(true);
    try {
      const data = await peopleApi.list(sort, 50);
      setContacts(data.contacts);
    } catch (error) {
      console.error("Failed to load contacts:", error);
    } finally {
      setLoading(false);
    }
  }

  const maxCount = contacts[0]?.emailCount || 1;

  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "6px" }}>
        People Intelligence
      </h1>
      <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "24px" }}>
        Understand your relationships through email patterns
      </p>

      {/* Sort toggle */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "24px" }}>
        {(["frequency", "recency"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            style={{
              padding: "8px 18px",
              fontSize: "13px",
              fontWeight: 600,
              borderRadius: "var(--radius-md)",
              border: "none",
              cursor: "pointer",
              background: sort === s ? "hsl(217 91% 60% / 0.15)" : "var(--color-bg-card)",
              color: sort === s ? "hsl(217 91% 70%)" : "var(--color-text-secondary)",
              transition: "all 0.2s ease",
            }}
          >
            {s === "frequency" ? "Most Active" : "Most Recent"}
          </button>
        ))}
      </div>

      {/* Contacts Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "12px",
        }}
      >
        {loading
          ? Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="skeleton" style={{ height: "100px" }} />
            ))
          : contacts.map((contact, i) => (
              <div
                key={contact.email}
                className="glass-card"
                style={{
                  padding: "20px",
                  opacity: 0,
                  animation: `fadeIn 0.3s ease-out ${i * 30}ms forwards`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: `hsl(${(i * 37) % 360} 60% 50% / 0.15)`,
                      color: `hsl(${(i * 37) % 360} 60% 65%)`,
                      fontSize: "16px",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {(contact.name || contact.email)[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {contact.name || contact.email}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-tertiary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {contact.email}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: 800,
                      color: "var(--color-accent)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {contact.emailCount}
                  </div>
                </div>

                {/* Frequency bar */}
                <div style={{ height: "4px", borderRadius: "2px", background: "var(--color-bg-tertiary)" }}>
                  <div
                    style={{
                      height: "100%",
                      borderRadius: "2px",
                      background: `hsl(${(i * 37) % 360} 60% 50%)`,
                      width: `${(contact.emailCount / maxCount) * 100}%`,
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>
            ))}
      </div>

      {!loading && contacts.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--color-text-secondary)" }}>
          <Users size={40} style={{ color: "var(--color-text-tertiary)", marginBottom: "16px" }} />
          <p style={{ fontSize: "16px", fontWeight: 600 }}>No contacts yet</p>
          <p style={{ fontSize: "13px" }}>Sync your inbox to discover your email relationships.</p>
        </div>
      )}
    </div>
  );
}
