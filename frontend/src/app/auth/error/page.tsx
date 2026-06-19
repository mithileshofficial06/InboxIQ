"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const msg = searchParams.get("message") || "An unknown system error occurred.";

  return (
    <div className="min-h-screen" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="editorial-card" style={{ width: "100%", maxWidth: "420px", textAlign: "center", padding: "48px 32px" }}>
        <h1 className="editorial-heading" style={{ fontSize: "24px", marginBottom: "16px", color: "var(--color-terracotta)" }}>System Error</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "15px", lineHeight: 1.6, marginBottom: "32px" }}>
          {msg}
        </p>
        <button className="editorial-btn" onClick={() => router.push("/")} style={{ width: "100%" }}>
          Return
        </button>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return <Suspense><ErrorContent /></Suspense>;
}
