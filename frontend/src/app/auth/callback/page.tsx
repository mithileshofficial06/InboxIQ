"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const token = searchParams.get("token");
    if (searchParams.get("message")) { setStatus("error"); return; }
    if (token) {
      localStorage.setItem("inboxiq_token", token);
      setStatus("success");
      setTimeout(() => router.push("/dashboard"), 1500);
    } else {
      setStatus("error");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <div className="mesh-gradient" />
      
      <div className="glass-card" style={{ width: "100%", maxWidth: "420px", textAlign: "center", padding: "48px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
        
        {status === "loading" && (
          <>
            <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(79, 70, 229, 0.1)", color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Loader2 size={32} className="animate-spin" />
            </div>
            <div>
              <h1 className="glass-heading" style={{ fontSize: "24px", marginBottom: "8px" }}>Authenticating</h1>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>Verifying your credentials securely...</p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={32} />
            </div>
            <div>
              <h1 className="glass-heading" style={{ fontSize: "24px", marginBottom: "8px" }}>Access Granted</h1>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>Redirecting you to the dashboard...</p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertCircle size={32} />
            </div>
            <div>
              <h1 className="glass-heading" style={{ fontSize: "24px", marginBottom: "8px" }}>Authentication Failed</h1>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginBottom: "24px" }}>We couldn't verify your credentials.</p>
              <button className="glass-btn" onClick={() => router.push("/")} style={{ width: "100%" }}>Return Home</button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return <Suspense><CallbackContent /></Suspense>;
}
