"use client";

import { useState, useRef, useEffect } from "react";
import { chat } from "@/lib/api";

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const handleSend = async (q?: string) => {
    const query = q || input.trim();
    if (!query || loading) return;
    setMessages(p => [...p, { role: "user", content: query }]);
    setInput(""); setLoading(true);

    try {
      const token = localStorage.getItem("inboxiq_token");
      let userId = "unknown";
      if (token) userId = JSON.parse(atob(token.split(".")[1])).userId;
      
      const res = await chat.query(query, userId);
      setMessages(p => [...p, { role: "assistant", content: res.answer, sources: res.sources }]);
    } catch {
      setMessages(p => [...p, { role: "assistant", content: "I encountered an error accessing your inbox data." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      <h1 className="editorial-heading" style={{ fontSize: "36px", marginBottom: "24px" }}>Assistant</h1>
      
      <div className="editorial-card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        
        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "40px", display: "flex", flexDirection: "column", gap: "32px", background: "var(--color-bg-primary)" }}>
          {messages.length === 0 ? (
            <div style={{ margin: "auto", textAlign: "center", maxWidth: "600px" }}>
              <div className="editorial-heading" style={{ fontSize: "28px", marginBottom: "16px" }}>How can I assist you?</div>
              <p style={{ color: "var(--color-text-secondary)", marginBottom: "40px", lineHeight: 1.7, fontSize: "16px" }}>
                I can process complex natural language queries against your complete email history. Ask for summaries, specific documents, or broad insights.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {["Summarize the latest communications from my bank.", "What is the status of my recent job applications?", "List the total amount spent on Amazon this month."].map(s => (
                  <button key={s} onClick={() => handleSend(s)} className="editorial-btn" style={{ justifyContent: "center", padding: "16px", color: "var(--color-text-secondary)", fontStyle: "italic" }}>
                    "{s}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: "24px", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                <div className="editorial-subheading" style={{ width: "60px", textAlign: m.role === "user" ? "right" : "left", color: m.role === "user" ? "var(--color-text-tertiary)" : "var(--color-text-primary)" }}>
                  {m.role === "user" ? "You" : "InboxIQ"}
                </div>
                <div style={{ flex: 1, maxWidth: "80%", display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ fontSize: "16px", color: "var(--color-text-primary)", whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
                    {m.content}
                  </div>
                  {m.sources && m.sources.length > 0 && (
                    <div style={{ marginTop: "24px", width: "100%", padding: "24px", borderTop: "1px solid var(--color-border-default)", background: "#ffffff" }}>
                      <div className="editorial-subheading" style={{ marginBottom: "16px" }}>Sources Referenced</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {m.sources.slice(0, 3).map((s: any, j: number) => (
                          <div key={j} style={{ padding: "16px", border: "1px solid var(--color-border-subtle)", borderRadius: "4px" }}>
                            <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "4px" }}>{s.subject}</div>
                            <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", display: "flex", justifyContent: "space-between" }}>
                              <span>{s.sender_email}</span>
                              <span>{(s.similarity_score * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div style={{ display: "flex", gap: "24px" }}>
              <div className="editorial-subheading" style={{ width: "60px" }}>InboxIQ</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "24px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-text-tertiary)", animation: "pulse 1s infinite" }} />
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-text-tertiary)", animation: "pulse 1s infinite 0.2s" }} />
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-text-tertiary)", animation: "pulse 1s infinite 0.4s" }} />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: "24px", borderTop: "1px solid var(--color-border-default)", background: "#ffffff" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <input 
              type="text" 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => e.key === "Enter" && handleSend()} 
              placeholder="Type your query..." 
              className="editorial-input" 
              style={{ flex: 1, padding: "16px 20px", fontSize: "16px" }} 
            />
            <button 
              onClick={() => handleSend()} 
              disabled={loading || !input.trim()} 
              className="editorial-btn-primary" 
              style={{ padding: "0 32px" }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
