"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Inbox, MessageSquare, Users, Briefcase, Bell, Sparkles, Mail, LogOut, RefreshCw } from "lucide-react";
import { auth, emails } from "@/lib/api";
import toast from "react-hot-toast";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/inbox", icon: Inbox, label: "Inbox" },
  { href: "/dashboard/chat", icon: MessageSquare, label: "Assistant" },
  { href: "/dashboard/people", icon: Users, label: "People" },
  { href: "/dashboard/jobs", icon: Briefcase, label: "Jobs" },
  { href: "/dashboard/subs", icon: Bell, label: "Subscriptions" },
  { href: "/dashboard/memories", icon: Sparkles, label: "Memories" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("inboxiq_token");
    if (!token) { router.push("/"); return; }
    auth.getMe().then(d => { setUser(d.user); setLoading(false); }).catch(() => { localStorage.removeItem("inboxiq_token"); router.push("/"); });
  }, [router]);

  const handleSync = async () => {
    setSyncing(true);
    try { await emails.triggerSync("incremental"); toast.success("Sync Started"); }
    catch { toast.error("Sync Failed"); }
    finally { setTimeout(() => setSyncing(false), 3000); }
  };

  const handleLogout = async () => {
    try { await auth.logout(); } catch {}
    localStorage.removeItem("inboxiq_token");
    router.push("/");
  };

  if (loading) return (
    <div className="mesh-gradient" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <div className="skeleton" style={{ width: "200px", height: "40px", borderRadius: "20px" }} />
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <div className="mesh-gradient" />
      
      {/* Sidebar */}
      <aside className="glass-sidebar" style={{ padding: "24px 0", zIndex: 20 }}>
        <div style={{ padding: "0 24px 32px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, var(--color-accent), #818cf8)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)" }}>
            <Mail size={18} color="#fff" />
          </div>
          <span className="glass-heading" style={{ fontSize: "20px" }}>InboxIQ</span>
        </div>
        
        <nav style={{ flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={`glass-nav-link ${isActive ? "active" : ""}`}>
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "24px 24px 0", borderTop: "1px solid rgba(255,255,255,0.4)", margin: "0 16px" }}>
          <div style={{ fontSize: "12px", color: "var(--color-text-tertiary)", marginBottom: "4px" }}>Logged in as</div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "16px" }}>
            {user?.email}
          </div>
          <button className="glass-btn" onClick={handleLogout} style={{ width: "100%", padding: "10px", fontSize: "13px" }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", zIndex: 10, height: "100vh" }}>
        {/* Topbar */}
        <header style={{ padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div className="glass-badge" style={{ background: user?.sync_status === "syncing" ? "#fef3c7" : "#dcfce7", color: user?.sync_status === "syncing" ? "#d97706" : "#166534", border: "none" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor", marginRight: "6px" }} />
              {user?.sync_status === "syncing" ? "Syncing..." : "Synced"}
            </div>
            <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: 500 }}>
              {user?.total_emails_synced.toLocaleString()} Emails Indexed
            </div>
          </div>
          <button className="glass-btn" onClick={handleSync} disabled={syncing}>
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} /> 
            {syncing ? "Syncing" : "Sync Now"}
          </button>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: "0 40px 40px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
