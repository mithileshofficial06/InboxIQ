"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { AlertOctagon } from "lucide-react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const msg = searchParams.get("message") || "An unknown system error occurred.";

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <div className="mesh-gradient" />
      
      <div className="glass-card" style={{ width: "100%", maxWidth: "420px", textAlign: "center", padding: "48px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
        
        <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AlertOctagon size={32} />
        </div>
        
        <div>
          <h1 className="glass-heading" style={{ fontSize: "24px", marginBottom: "12px" }}>System Error</h1>
          <div style={{ background: "rgba(255,255,255,0.6)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.8)", marginBottom: "24px" }}>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: 1.5 }}>
              {msg}
            </p>
          </div>
          <button className="glass-btn" onClick={() => router.push("/")} style={{ width: "100%" }}>
            Return to Base
          </button>
        </div>

      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return <Suspense><ErrorContent /></Suspense>;
}
