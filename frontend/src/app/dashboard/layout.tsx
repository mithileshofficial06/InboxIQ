"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Inbox,
  MessageSquare,
  Users,
  Briefcase,
  Bell,
  Sparkles,
  Mail,
  LogOut,
  Settings,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { auth, emails } from "@/lib/api";
import toast from "react-hot-toast";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/inbox", icon: Inbox, label: "Inbox Explorer" },
  { href: "/dashboard/chat", icon: MessageSquare, label: "AI Chat" },
  { href: "/dashboard/people", icon: Users, label: "People" },
  { href: "/dashboard/jobs", icon: Briefcase, label: "Job Tracker" },
  { href: "/dashboard/subs", icon: Bell, label: "Subscriptions" },
  { href: "/dashboard/memories", icon: Sparkles, label: "Memories" },
];

interface User {
  id: string;
  email: string;
  name: string;
  picture_url: string;
  sync_status: string;
  last_sync_at: string | null;
  total_emails_synced: number;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("inboxiq_token");
    if (!token) {
      router.push("/");
      return;
    }

    auth
      .getMe()
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("inboxiq_token");
        router.push("/");
      });
  }, [router]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await emails.triggerSync("incremental");
      toast.success("Sync started! New emails will appear shortly.");
    } catch {
      toast.error("Failed to start sync");
    } finally {
      setTimeout(() => setSyncing(false), 3000);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
    } catch {
      // Continue with logout even if server call fails
    }
    localStorage.removeItem("inboxiq_token");
    router.push("/");
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-bg-primary)",
        }}
      >
        <div className="mesh-gradient" />
        <div style={{ textAlign: "center" }}>
          <Loader2
            size={40}
            className="animate-spin"
            style={{ color: "var(--color-accent)", marginBottom: "16px" }}
          />
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
            Loading InboxIQ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* ========== Sidebar ========== */}
      <aside
        className="sidebar"
        style={{ width: collapsed ? "70px" : "260px" }}
      >
        {/* Logo */}
        <div
          style={{
            padding: collapsed ? "20px 12px" : "20px 20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            borderBottom: "1px solid var(--color-border-subtle)",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              minWidth: "36px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, hsl(217 91% 55%), hsl(217 91% 45%))",
              boxShadow: "0 0 15px hsl(217 91% 60% / 0.25)",
            }}
          >
            <Mail size={18} color="white" />
          </div>
          {!collapsed && (
            <span
              style={{
                fontSize: "18px",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
              className="gradient-text"
            >
              InboxIQ
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "12px 0" }}>
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div
          style={{
            padding: "12px",
            borderTop: "1px solid var(--color-border-subtle)",
          }}
        >
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-link"
            style={{
              width: "100%",
              border: "none",
              cursor: "pointer",
              background: "none",
            }}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!collapsed && <span>Collapse</span>}
          </button>

          {/* User info */}
          {user && !collapsed && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px",
                marginTop: "8px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-bg-tertiary)",
              }}
            >
              {user.picture_url ? (
                <img
                  src={user.picture_url}
                  alt={user.name}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    border: "2px solid var(--color-border-default)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "var(--color-accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  {user.name?.[0] || user.email[0]}
                </div>
              )}
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.name || user.email}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--color-text-tertiary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.email}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ========== Main Content ========== */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Bar */}
        <header
          className="glass"
          style={{
            padding: "12px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--color-border-subtle)",
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {user && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 14px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "12px",
                  fontWeight: 600,
                  background:
                    user.sync_status === "syncing"
                      ? "hsl(38 92% 50% / 0.12)"
                      : user.sync_status === "completed"
                      ? "hsl(142 71% 45% / 0.12)"
                      : "var(--color-bg-tertiary)",
                  color:
                    user.sync_status === "syncing"
                      ? "hsl(38 92% 65%)"
                      : user.sync_status === "completed"
                      ? "hsl(142 71% 60%)"
                      : "var(--color-text-secondary)",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background:
                      user.sync_status === "syncing"
                        ? "hsl(38 92% 50%)"
                        : user.sync_status === "completed"
                        ? "hsl(142 71% 45%)"
                        : "var(--color-text-tertiary)",
                  }}
                />
                {user.sync_status === "syncing"
                  ? "Syncing..."
                  : `${user.total_emails_synced || 0} emails synced`}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              className="btn-ghost"
              onClick={handleSync}
              disabled={syncing}
              style={{ padding: "8px 14px", fontSize: "13px" }}
            >
              <RefreshCw
                size={14}
                className={syncing ? "animate-spin" : ""}
              />
              {!syncing && "Sync"}
            </button>
            <button
              className="btn-ghost"
              onClick={handleLogout}
              style={{ padding: "8px 14px", fontSize: "13px" }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            padding: "28px",
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
