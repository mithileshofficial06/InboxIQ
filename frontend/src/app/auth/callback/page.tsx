"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [s, setS] = useState("AUTHENTICATING");

  useEffect(() => {
    const token = searchParams.get("token");
    if (searchParams.get("message")) { setS("AUTH_FAILURE"); return; }
    if (token) {
      localStorage.setItem("inboxiq_token", token);
      setS("AUTH_SUCCESS :: REDIRECTING");
      setTimeout(() => router.push("/dashboard"), 1000);
    } else {
      setS("AUTH_FAILURE :: NO_TOKEN");
    }
  }, [searchParams, router]);

  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg-primary)" }}>
      <div className="brutal-card" style={{ textAlign: "center", padding: "48px", maxWidth: "400px", width: "100%", borderColor: s.includes("FAIL") ? "var(--color-danger)" : "var(--color-accent)", boxShadow: `8px 8px 0px 0px ${s.includes("FAIL") ? "var(--color-danger)" : "var(--color-accent)"}` }}>
        <h1 className="brutal-text" style={{ fontSize: "24px", color: s.includes("FAIL") ? "var(--color-danger)" : "var(--color-accent)", marginBottom: "24px" }}>
          {s}
        </h1>
        {s.includes("FAIL") && <button className="brutal-btn" onClick={() => router.push("/")} style={{ width: "100%" }}>ABORT</button>}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return <Suspense><CallbackContent /></Suspense>;
}
