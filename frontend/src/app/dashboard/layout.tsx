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
  { href: "/dashboard/chat", icon: MessageSquare, label: "Terminal" },
  { href: "/dashboard/people", icon: Users, label: "People" },
  { href: "/dashboard/jobs", icon: Briefcase, label: "Jobs" },
  { href: "/dashboard/subs", icon: Bell, label: "Subs" },
  { href: "/dashboard/memories", icon: Sparkles, label: "Memories" },
];

interface User {
  id: string;
  email: string;
  name: string;
  sync_status: string;
  total_emails_synced: number;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("inboxiq_token");
    if (!token) { router.push("/"); return; }
    auth.getMe().then(d => { setUser(d.user); setLoading(false); }).catch(() => { localStorage.removeItem("inboxiq_token"); router.push("/"); });
  }, [router]);

  const handleSync = async () => {
    setSyncing(true);
    try { await emails.triggerSync("incremental"); toast.success("SYNC STARTED"); }
    catch { toast.error("SYNC FAILED"); }
    finally { setTimeout(() => setSyncing(false), 3000); }
  };

  const handleLogout = async () => {
    try { await auth.logout(); } catch {}
    localStorage.removeItem("inboxiq_token");
    router.push("/");
  };

  if (loading) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#000", color: "#fff", fontFamily: "var(--font-mono)", fontSize: "24px", fontWeight: "bold" }}>LOADING_SYSTEM...</div>;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: "24px", borderBottom: "4px solid var(--color-border-default)", background: "var(--color-bg-primary)" }}>
          <h1 className="brutal-text" style={{ fontSize: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Mail size={24} color="var(--color-accent)" /> INBOXIQ
          </h1>
        </div>
        
        <nav style={{ flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={`sidebar-link ${isActive ? "active" : ""}`}>
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Block */}
        <div style={{ padding: "20px", borderTop: "4px solid var(--color-border-default)", background: "var(--color-bg-card)" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: "bold", wordBreak: "break-all", marginBottom: "16px" }}>
            USER: {user?.email}
          </div>
          <button className="brutal-btn-ghost" onClick={handleLogout} style={{ width: "100%", padding: "10px" }}>
            <LogOut size={16} /> LOGOUT
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--color-bg-primary)" }}>
        {/* Topbar */}
        <header style={{ padding: "16px 32px", borderBottom: "4px solid var(--color-border-default)", background: "var(--color-bg-card)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ padding: "6px 12px", background: user?.sync_status === "syncing" ? "var(--color-warning)" : "var(--color-accent)", color: "#000", border: "2px solid #fff" }}>
              STATE: {user?.sync_status.toUpperCase()}
            </span>
            <span>DATA: {user?.total_emails_synced} RECORDS</span>
          </div>
          <button className="brutal-btn" onClick={handleSync} disabled={syncing}>
            <RefreshCw size={16} /> {syncing ? "SYNCING..." : "SYNC NOW"}
          </button>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
