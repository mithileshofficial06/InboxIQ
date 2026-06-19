"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User } from "lucide-react";
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
      <h1 className="glass-heading" style={{ fontSize: "32px", marginBottom: "24px" }}>AI Assistant</h1>
      
      <div className="glass-card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        
        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
          {messages.length === 0 ? (
            <div style={{ margin: "auto", textAlign: "center", maxWidth: "500px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "linear-gradient(135deg, var(--color-accent), #a855f7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 8px 24px rgba(79, 70, 229, 0.2)" }}>
                <Sparkles size={32} />
              </div>
              <h2 className="glass-heading" style={{ fontSize: "24px", marginBottom: "16px" }}>How can I help you today?</h2>
              <p style={{ color: "var(--color-text-secondary)", marginBottom: "32px", lineHeight: 1.6 }}>
                I have full access to your indexed emails. You can ask me to summarize threads, find specific documents, or analyze your communication patterns.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {["What bills are due this week?", "Summarize my recent Amazon orders", "Who do I email the most?"].map(s => (
                  <button key={s} onClick={() => handleSend(s)} className="glass-btn" style={{ justifyContent: "flex-start", padding: "16px 24px", fontWeight: 500 }}>
                    <Sparkles size={16} color="var(--color-accent)" /> {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: "16px", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: m.role === "user" ? "#1e293b" : "linear-gradient(135deg, var(--color-accent), #a855f7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                  {m.role === "user" ? <User size={18} /> : <Sparkles size={18} />}
                </div>
                <div style={{ flex: 1, maxWidth: "80%", display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ padding: "16px 24px", borderRadius: "20px", background: m.role === "user" ? "#1e293b" : "rgba(255,255,255,0.7)", color: m.role === "user" ? "#fff" : "var(--color-text-primary)", border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.8)", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                    {m.content}
                  </div>
                  {m.sources && m.sources.length > 0 && (
                    <div style={{ marginTop: "12px", width: "100%", padding: "16px", borderRadius: "16px", background: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.5)" }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Sources Retrieved</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {m.sources.slice(0, 3).map((s: any, j: number) => (
                          <div key={j} style={{ padding: "12px", background: "rgba(255,255,255,0.6)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.8)" }}>
                            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "4px" }}>{s.subject}</div>
                            <div style={{ fontSize: "12px", color: "var(--color-text-tertiary)", display: "flex", justifyContent: "space-between" }}>
                              <span>{s.sender_email}</span>
                              <span style={{ color: "var(--color-accent)" }}>{(s.similarity_score * 100).toFixed(1)}% Match</span>
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
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: "linear-gradient(135deg, var(--color-accent), #a855f7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)" }}>
                <Sparkles size={18} className="animate-pulse" />
              </div>
              <div style={{ padding: "16px 24px", borderRadius: "20px", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-accent)", animation: "pulse 1s infinite" }} />
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-accent)", animation: "pulse 1s infinite 0.2s" }} />
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-accent)", animation: "pulse 1s infinite 0.4s" }} />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: "24px", borderTop: "1px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.2)" }}>
          <div style={{ display: "flex", gap: "12px", position: "relative" }}>
            <input 
              type="text" 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => e.key === "Enter" && handleSend()} 
              placeholder="Ask anything about your inbox..." 
              className="glass-input" 
              style={{ flex: 1, padding: "16px 20px", fontSize: "15px", borderRadius: "100px", paddingRight: "60px" }} 
            />
            <button 
              onClick={() => handleSend()} 
              disabled={loading || !input.trim()} 
              className="glass-btn-primary" 
              style={{ position: "absolute", right: "6px", top: "6px", bottom: "6px", padding: "0 16px", borderRadius: "100px" }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
