"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Loader2 } from "lucide-react";
import { Suspense } from "react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Authenticating...");

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("message");

    if (error) {
      setStatus("error");
      setMessage(error);
      return;
    }

    if (token) {
      localStorage.setItem("inboxiq_token", token);
      setStatus("success");
      setMessage("Welcome to InboxIQ!");
      
      // Redirect to dashboard after brief delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } else {
      setStatus("error");
      setMessage("No authentication token received.");
    }
  }, [searchParams, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="mesh-gradient" />
      <div
        className="glass-card"
        style={{
          padding: "48px",
          textAlign: "center",
          maxWidth: "420px",
          width: "100%",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              status === "error"
                ? "hsl(0 84% 60% / 0.15)"
                : "linear-gradient(135deg, hsl(217 91% 55%), hsl(217 91% 45%))",
            margin: "0 auto 24px",
            boxShadow:
              status !== "error"
                ? "0 0 30px hsl(217 91% 60% / 0.3)"
                : "none",
          }}
        >
          {status === "loading" ? (
            <Loader2 size={28} color="white" className="animate-spin" />
          ) : (
            <Mail
              size={28}
              color={status === "error" ? "hsl(0 84% 60%)" : "white"}
            />
          )}
        </div>

        <h1
          style={{
            fontSize: "24px",
            fontWeight: 800,
            marginBottom: "8px",
            letterSpacing: "-0.02em",
          }}
        >
          {status === "loading"
            ? "Signing you in..."
            : status === "success"
            ? "You're in! 🎉"
            : "Authentication Failed"}
        </h1>

        <p
          style={{
            fontSize: "14px",
            color: "var(--color-text-secondary)",
            marginBottom: "24px",
          }}
        >
          {message}
        </p>

        {status === "error" && (
          <button
            className="btn-primary"
            onClick={() => router.push("/")}
            style={{ width: "100%" }}
          >
            Back to Home
          </button>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--color-accent)" }} />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
