"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
// Briefcase/Bell were the Careers and Subscriptions icons — removed with those nav items.
import { LayoutDashboard, Inbox, MessageSquare, Users, Sparkles, Mail, LogOut, RefreshCw } from "lucide-react";
import { auth, emails } from "@/lib/api";
import toast from "react-hot-toast";
import { SyncIndicator } from "@/components/SyncIndicator";
import { VideoBackground } from "@/components/VideoBackground";

// "Careers" (/dashboard/jobs) and "Subscriptions" (/dashboard/subs) are hidden.
// The `job_applications` and `subscriptions` tables are only ever READ — nothing
// in the sync worker or AI service populates them — so both pages render empty
// no matter what the user does. The routes, API endpoints and tables are all
// left intact; re-add the entries below once a detection pipeline exists.
const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/inbox", icon: Inbox, label: "Inbox" },
  { href: "/dashboard/chat", icon: MessageSquare, label: "Assistant" },
  { href: "/dashboard/people", icon: Users, label: "Network" },
  { href: "/dashboard/memories", icon: Sparkles, label: "Archives" },
];

const getAvatarColor = (name: string) => {
  const colors = ['#6b7a8f', '#849b87', '#c46b5a', '#c99a5c', '#b5838d'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The session cookie is httpOnly, so the client cannot inspect it. The only
    // way to know whether we're signed in is to ask the backend.
    auth.getMe()
      .then(d => {
        setUser(d.user);
        setLoading(false);
      })
      .catch((error: Error) => {
        if (error.message === "Authentication required") {
          // fetchAPI already redirects to "/" on a 401.
          return;
        }
        console.error("Auth verification failed:", error);
        setLoading(false);
        toast.error("Could not connect to server. Some features may be unavailable.");
      });
  }, [router]);

  const handleSync = async () => {
    setSyncing(true);
    try { await emails.triggerSync("incremental"); toast.success("Synchronization Started"); }
    catch { toast.error("Synchronization Failed"); }
    finally { setTimeout(() => setSyncing(false), 3000); }
  };

  const handleLogout = async () => {
    // The backend revokes the token and clears the cookie; there is nothing
    // client-side left to clear.
    try { await auth.logout(); } catch {}
    router.push("/");
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f0ede8" }}>
      <div className="skeleton" style={{ width: "200px", height: "4px" }} />
    </div>
  );

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const profilePicture = user?.picture_url || null;
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w.charAt(0).toUpperCase())
    .join("");
  const avatarBg = getAvatarColor(displayName);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0ede8" }}>
      
      {/* ── Sidebar ── */}
      <aside className="animate-slide-in-right" style={{
        width: 260, minHeight: "100vh", background: "#f5f2ed",
        borderRight: "1px solid #e5e2db",
        display: "flex", flexDirection: "column", padding: "24px 0",
        flexShrink: 0,
      }}>

        {/* Logo */}
        <div style={{ padding: "0 14px 32px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, background: "#1c1917", borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Mail size={13} color="#fff" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#1c1917", letterSpacing: "-0.01em" }}>
            InboxIQ
          </span>
        </div>

        {/* Section Label */}
        <div style={{
          padding: "0 14px 8px", fontSize: 10, fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.12em", color: "#a8a29e",
        }}>
          Modules
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "0 8px" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`dash-nav-link ${isActive ? "active" : ""}`}
              >
                <item.icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Account Section */}
        <div style={{ padding: "16px 14px 0", borderTop: "1px solid #e5e2db" }}>
          <div style={{
            fontSize: 10, fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.08em", color: "#a8a29e", marginBottom: 10,
          }}>
            Account
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            {/* Avatar */}
            {profilePicture ? (
              <img
                src={profilePicture}
                alt={displayName}
                referrerPolicy="no-referrer"
                style={{
                  width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0,
                }}
              />
            ) : (
              <div style={{
                width: 32, height: 32, borderRadius: "50%", background: avatarBg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 600, color: "#fff", flexShrink: 0,
              }}>
                {initials}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: "#1c1917",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {displayName}
              </div>
              <div style={{
                fontSize: 11, color: "#a8a29e", maxWidth: 160,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {user?.email}
              </div>
            </div>
          </div>

          <button className="dash-logout-btn" onClick={handleLogout}>
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", position: "relative", background: "#f0ede8" }}>
        {/* ── Video Background (double-buffered, gap-free loop) ── */}
        <VideoBackground src="/bg-loop.mp4" />

        {/* Topbar */}
        <header className="animate-fade-in" style={{
          position: "relative", zIndex: 10,
          padding: "14px 32px", display: "flex", alignItems: "center",
          justifyContent: "flex-end", gap: 16,
          background: "#ffffff", borderBottom: "1px solid #e5e2db",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              className="dash-pulse-dot"
              style={{
                width: 7, height: 7, borderRadius: "50%", display: "inline-block",
                background: user?.sync_status === "syncing" ? "#c99a5c" : "#849b87",
              }}
            />
            <span style={{ fontSize: 13, color: "#57534e" }}>
              {user?.sync_status === "syncing"
                ? "Syncing in progress…"
                : `${(user?.total_emails_synced ?? 0).toLocaleString()} indexed records`}
            </span>
          </div>
          <button className="dash-sync-btn" onClick={handleSync} disabled={syncing}>
            <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing…" : "Sync"}
          </button>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto", overflowX: "hidden", position: "relative", zIndex: 1 }}>
          <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>

      <SyncIndicator />
    </div>
  );
}
