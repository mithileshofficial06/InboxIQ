"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const message = searchParams.get("message") || "An unknown error occurred.";

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
            background: "hsl(0 84% 60% / 0.15)",
            margin: "0 auto 24px",
          }}
        >
          <AlertTriangle size={28} style={{ color: "hsl(0 84% 60%)" }} />
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "8px" }}>
          Authentication Error
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "var(--color-text-secondary)",
            marginBottom: "28px",
            lineHeight: 1.7,
          }}
        >
          {message}
        </p>
        <button
          className="btn-primary"
          onClick={() => router.push("/")}
          style={{ width: "100%" }}
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={null}>
      <ErrorContent />
    </Suspense>
  );
}
