"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/api";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const message = searchParams.get("message");

    if (message) {
      setStatus("error");
      setErrorMessage(message);
      return;
    }

    // The session is an httpOnly cookie set by the backend during the redirect —
    // there is no token in the URL to read. Confirm the session took by asking
    // the backend who we are.
    let cancelled = false;
    auth
      .getMe()
      .then(() => {
        if (cancelled) return;
        setStatus("success");
        setTimeout(() => router.push("/dashboard"), 1000);
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage("We couldn't establish a session. Please sign in again.");
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  return (
    <div className="min-h-screen" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="editorial-card" style={{ width: "100%", maxWidth: "420px", textAlign: "center", padding: "48px 32px" }}>
        
        {status === "loading" && (
          <div>
            <div style={{ width: "40px", height: "40px", margin: "0 auto 24px", border: "2px solid var(--color-border-default)", borderTopColor: "var(--color-text-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <h1 className="editorial-heading" style={{ fontSize: "24px", marginBottom: "12px" }}>Authenticating</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>Verifying credentials...</p>
          </div>
        )}

        {status === "success" && (
          <div>
            <h1 className="editorial-heading" style={{ fontSize: "24px", marginBottom: "12px", color: "var(--color-sage)" }}>Access Granted</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>Redirecting to dashboard...</p>
          </div>
        )}

        {status === "error" && (
          <div>
            <h1 className="editorial-heading" style={{ fontSize: "24px", marginBottom: "12px", color: "var(--color-terracotta)" }}>Authentication Failed</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "15px", marginBottom: "32px" }}>
              {errorMessage || "We couldn't verify your credentials."}
            </p>
            <button className="editorial-btn" onClick={() => router.push("/")} style={{ width: "100%" }}>Return to Home</button>
          </div>
        )}

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}

export default function AuthCallbackPage() {
  return <Suspense><CallbackContent /></Suspense>;
}
