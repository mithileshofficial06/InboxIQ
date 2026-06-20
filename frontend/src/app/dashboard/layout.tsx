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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--color-bg-primary)" }}>
      <div className="skeleton" style={{ width: "200px", height: "4px" }} />
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* Sidebar */}
      <aside className="editorial-sidebar animate-slide-in-right" style={{ padding: "32px 0" }}>
        <div style={{ padding: "0 24px 40px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "28px", height: "28px", background: "var(--color-text-primary)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Mail size={14} color="#fff" />
          </div>
          <span className="editorial-heading" style={{ fontSize: "18px" }}>InboxIQ</span>
        </div>
        
        <div className="editorial-subheading" style={{ padding: "0 24px 12px" }}>Modules</div>
        <nav style={{ flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={`editorial-nav-link ${isActive ? "active" : ""}`}>
                <item.icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "24px 24px 0", borderTop: "1px solid var(--color-border-default)" }}>
          <div style={{ fontSize: "12px", color: "var(--color-text-tertiary)", marginBottom: "4px" }}>Account</div>
          <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "16px" }}>
            {user?.email}
          </div>
          <button className="editorial-btn" onClick={handleLogout} style={{ width: "100%", padding: "8px", fontSize: "13px", justifyContent: "flex-start" }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", background: "var(--color-bg-primary)" }}>
        {/* Topbar */}
        <header className="animate-fade-in" style={{ padding: "24px 48px", display: "flex", justifyContent: "flex-end", alignItems: "center", borderBottom: "1px solid var(--color-border-default)", background: "var(--color-bg-secondary)" }}>
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: user?.sync_status === "syncing" ? "var(--color-ochre)" : "var(--color-sage)" }} />
              <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                {user?.sync_status === "syncing" ? "Syncing in progress..." : `${user?.total_emails_synced.toLocaleString()} indexed records`}
              </span>
            </div>
            <button className="editorial-btn" onClick={handleSync} disabled={syncing} style={{ padding: "6px 16px" }}>
              <RefreshCw size={14} className={syncing ? "animate-spin" : ""} /> 
              {syncing ? "Syncing" : "Sync"}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: "48px", overflowY: "auto" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>
      <SyncIndicator />
    </div>
  );
}
