"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Mail, ExternalLink, Loader2 } from "lucide-react";
import { chat } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  timestamp: Date;
}

interface Source {
  email_id: string;
  chunk_text: string;
  similarity_score: number;
  subject?: string;
  sender_email?: string;
  date?: string;
}

const SUGGESTED_QUERIES = [
  "What interviews do I have scheduled?",
  "Summarize my recent Amazon orders",
  "Who emails me the most?",
  "Show me emails about internship applications",
  "What bills are due this month?",
  "Find emails from my university",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (query?: string) => {
    const q = query || input.trim();
    if (!q || loading) return;

    const userMessage: Message = {
      role: "user",
      content: q,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Get userId from localStorage token (decode JWT)
      const token = localStorage.getItem("inboxiq_token");
      let userId = "";
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          userId = payload.userId;
        } catch {
          userId = "unknown";
        }
      }

      const result = await chat.query(q, userId);

      const assistantMessage: Message = {
        role: "assistant",
        content: result.answer,
        sources: result.sources,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I couldn't process your query. Make sure your emails are synced and the AI service is running.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 120px)",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: "6px",
          }}
        >
          AI Chat
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
          Ask anything about your inbox — powered by RAG
        </p>
      </div>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          paddingBottom: "20px",
        }}
      >
        {messages.length === 0 ? (
          /* Empty state with suggestions */
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "32px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, hsl(217 91% 55%), hsl(280 65% 55%))",
                  margin: "0 auto 20px",
                  boxShadow: "0 0 40px hsl(217 91% 60% / 0.25)",
                }}
              >
                <Sparkles size={32} color="white" />
              </div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                Ask anything about your emails
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--color-text-secondary)",
                  maxWidth: "420px",
                }}
              >
                Your queries are answered using RAG — retrieval-augmented generation over your actual email data.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "10px",
                maxWidth: "660px",
                width: "100%",
              }}
            >
              {SUGGESTED_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  style={{
                    padding: "14px 18px",
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--color-text-secondary)",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "hsl(217 91% 60% / 0.3)";
                    e.currentTarget.style.color = "var(--color-text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-border-subtle)";
                    e.currentTarget.style.color = "var(--color-text-secondary)";
                  }}
                >
                  <Sparkles size={14} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message bubbles */
          messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                animation: "fadeIn 0.3s ease-out",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    msg.role === "user"
                      ? "hsl(217 91% 60% / 0.15)"
                      : "linear-gradient(135deg, hsl(280 65% 55% / 0.2), hsl(217 91% 60% / 0.2))",
                  flexShrink: 0,
                }}
              >
                {msg.role === "user" ? (
                  <User size={16} style={{ color: "hsl(217 91% 70%)" }} />
                ) : (
                  <Bot size={16} style={{ color: "hsl(280 65% 70%)" }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.7,
                    color: "var(--color-text-primary)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.content}
                </div>

                {/* Source emails */}
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{ marginTop: "12px" }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "var(--color-text-tertiary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: "8px",
                      }}
                    >
                      Sources ({msg.sources.length})
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      {msg.sources.slice(0, 5).map((source, j) => (
                        <div
                          key={j}
                          style={{
                            padding: "10px 14px",
                            background: "var(--color-bg-tertiary)",
                            border: "1px solid var(--color-border-subtle)",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "12px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              marginBottom: "4px",
                            }}
                          >
                            <Mail size={12} style={{ color: "var(--color-accent)" }} />
                            <span style={{ fontWeight: 600 }}>
                              {source.subject || "No Subject"}
                            </span>
                          </div>
                          <div
                            style={{
                              color: "var(--color-text-tertiary)",
                              fontSize: "11px",
                            }}
                          >
                            From: {source.sender_email} • Score:{" "}
                            {(source.similarity_score * 100).toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--color-text-tertiary)",
                    marginTop: "6px",
                  }}
                >
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
              animation: "fadeIn 0.3s ease-out",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, hsl(280 65% 55% / 0.2), hsl(217 91% 60% / 0.2))",
              }}
            >
              <Loader2 size={16} className="animate-spin" style={{ color: "hsl(280 65% 70%)" }} />
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "var(--color-text-secondary)",
                fontStyle: "italic",
              }}
            >
              Searching your inbox and generating answer...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div
        style={{
          padding: "16px 0 0",
          borderTop: "1px solid var(--color-border-subtle)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your emails..."
            disabled={loading}
            style={{
              flex: 1,
              padding: "14px 18px",
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border-default)",
              borderRadius: "var(--radius-lg)",
              color: "var(--color-text-primary)",
              fontSize: "14px",
              outline: "none",
              transition: "border-color 0.2s ease",
              fontFamily: "var(--font-sans)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "hsl(217 91% 60% / 0.5)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border-default)")}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="btn-primary"
            style={{
              padding: "14px 18px",
              borderRadius: "var(--radius-lg)",
              opacity: loading || !input.trim() ? 0.5 : 1,
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
