"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const msg = searchParams.get("message") || "UNKNOWN_SYSTEM_ERROR";

  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg-primary)" }}>
      <div className="brutal-card" style={{ textAlign: "center", padding: "48px", maxWidth: "400px", width: "100%", borderColor: "var(--color-danger)", boxShadow: "8px 8px 0px 0px var(--color-danger)" }}>
        <h1 className="brutal-text" style={{ fontSize: "24px", color: "var(--color-danger)", marginBottom: "16px" }}>CRITICAL_ERROR</h1>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "14px", marginBottom: "32px", color: "#fff", background: "#222", padding: "16px", border: "2px solid #555" }}>
          {msg}
        </p>
        <button className="brutal-btn" onClick={() => router.push("/")} style={{ width: "100%", background: "var(--color-danger)" }}>RETURN_TO_BASE</button>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return <Suspense><ErrorContent /></Suspense>;
}
