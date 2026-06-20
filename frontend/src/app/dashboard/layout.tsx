"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Inbox, MessageSquare, Users, Briefcase, Bell, Sparkles, Mail, LogOut, RefreshCw } from "lucide-react";
import { auth, emails } from "@/lib/api";
import toast from "react-hot-toast";
import { SyncIndicator } from "@/components/SyncIndicator";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/inbox", icon: Inbox, label: "Inbox" },
  { href: "/dashboard/chat", icon: MessageSquare, label: "Assistant" },
  { href: "/dashboard/people", icon: Users, label: "Network" },
  { href: "/dashboard/jobs", icon: Briefcase, label: "Careers" },
  { href: "/dashboard/subs", icon: Bell, label: "Subscriptions" },
  { href: "/dashboard/memories", icon: Sparkles, label: "Archives" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("inboxiq_token");
    if (!token) { 
      router.push("/"); 
      return; 
    }
    
    // Verify token with backend
    auth.getMe()
      .then(d => { 
        setUser(d.user); 
        setLoading(false); 
      })
      .catch((error) => { 
        console.error("Auth verification failed:", error);
        // Only clear token if it's a 401 (unauthorized), not network errors
        if (error.response?.status === 401) {
          localStorage.removeItem("inboxiq_token");
          router.push("/");
        } else {
          // Keep token but show error - might be temporary backend issue
          setLoading(false);
          toast.error("Could not connect to server. Some features may be unavailable.");
        }
      });
  }, [router]);

  const handleSync = async () => {
    setSyncing(true);
    try { await emails.triggerSync("incremental"); toast.success("Synchronization Started"); }
    catch { toast.error("Synchronization Failed"); }
    finally { setTimeout(() => setSyncing(false), 3000); }
  };

  const handleLogout = async () => {
    try { await auth.logout(); } catch {}
    localStorage.removeItem("inboxiq_token");
    router.push("/");
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f0ede8" }}>
      <div className="skeleton" style={{ width: "200px", height: "4px" }} />
    </div>
  );

  const userInitial = (user?.email || "U").charAt(0).toUpperCase();
  const userName = user?.email?.split("@")[0] || "User";

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
        <div style={{ padding: "0 20px 32px", display: "flex", alignItems: "center", gap: 10 }}>
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
          padding: "0 20px 8px", fontSize: 10, fontWeight: 600,
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
        <div style={{ padding: "16px 20px 0", borderTop: "1px solid #e5e2db" }}>
          <div style={{
            fontSize: 10, fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.08em", color: "#a8a29e", marginBottom: 10,
          }}>
            Account
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            {/* Avatar */}
            <div style={{
              width: 32, height: 32, borderRadius: "50%", background: "#1c1917",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 600, color: "#fff", flexShrink: 0,
            }}>
              {userInitial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: "#1c1917",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {userName}
              </div>
              <div style={{
                fontSize: 11, color: "#a8a29e",
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>

        {/* Topbar */}
        <header className="animate-fade-in" style={{
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
        <main style={{ flex: 1, padding: 32, overflowY: "auto" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>

      <SyncIndicator />
    </div>
  );
}
