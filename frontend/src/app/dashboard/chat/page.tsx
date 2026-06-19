"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Terminal, User } from "lucide-react";
import { chat } from "@/lib/api";

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView(); }, [messages]);

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
      setMessages(p => [...p, { role: "assistant", content: "ERROR: RAG_PIPELINE_FAILURE" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)" }}>
      <h1 className="brutal-text" style={{ fontSize: "40px", marginBottom: "16px", borderBottom: "4px solid #fff", paddingBottom: "16px" }}>TERMINAL</h1>
      
      <div style={{ flex: 1, overflowY: "auto", border: "4px solid #fff", background: "#000", padding: "24px", fontFamily: "var(--font-mono)", display: "flex", flexDirection: "column", gap: "24px", boxShadow: "var(--shadow-brutal)" }}>
        {messages.length === 0 ? (
          <div>
            <div style={{ color: "var(--color-accent)", fontWeight: "bold", marginBottom: "16px" }}>&gt; INBOXIQ RAG TERMINAL ONLINE.</div>
            <div style={{ color: "#aaa", marginBottom: "16px" }}>SUGGESTED COMMANDS:</div>
            {["What bills are due?", "Summarize my Amazon orders", "Who emails me the most?"].map(s => (
              <button key={s} onClick={() => handleSend(s)} style={{ display: "block", background: "transparent", border: "none", color: "var(--color-accent)", cursor: "pointer", textDecoration: "underline", marginBottom: "8px", fontFamily: "var(--font-mono)", fontWeight: "bold" }}>
                $ {s}
              </button>
            ))}
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: "16px" }}>
              <div style={{ width: "32px", height: "32px", background: m.role === "user" ? "#fff" : "var(--color-accent)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #000" }}>
                {m.role === "user" ? <User size={16} /> : <Terminal size={16} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold", color: m.role === "user" ? "#fff" : "var(--color-accent)", marginBottom: "8px" }}>
                  {m.role === "user" ? "USER_INPUT" : "SYSTEM_OUTPUT"}
                </div>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{m.content}</div>
                {m.sources && m.sources.length > 0 && (
                  <div style={{ marginTop: "16px", padding: "16px", border: "2px solid #444", background: "#111" }}>
                    <div style={{ fontWeight: "bold", marginBottom: "8px", color: "var(--color-warning)" }}>[SOURCES_RETRIEVED: {m.sources.length}]</div>
                    {m.sources.slice(0, 3).map((s: any, j: number) => (
                      <div key={j} style={{ borderBottom: "1px solid #333", paddingBottom: "8px", marginBottom: "8px" }}>
                        <div style={{ color: "var(--color-info)" }}>SUBJECT: {s.subject}</div>
                        <div style={{ fontSize: "12px", color: "#888" }}>SCORE: {(s.similarity_score * 100).toFixed(2)}% | FROM: {s.sender_email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {loading && <div style={{ color: "var(--color-accent)", fontWeight: "bold", animation: "pulse 1s infinite" }}>&gt; PROCESSING_QUERY...</div>}
        <div ref={endRef} />
      </div>

      <div style={{ marginTop: "24px", display: "flex", gap: "16px" }}>
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === "Enter" && handleSend()} 
          placeholder="ENTER_COMMAND..." 
          className="brutal-input" 
          style={{ flex: 1, fontSize: "16px", textTransform: "uppercase" }} 
        />
        <button onClick={() => handleSend()} disabled={loading || !input.trim()} className="brutal-btn" style={{ padding: "0 32px" }}>
          EXECUTE
        </button>
      </div>
    </div>
  );
}
