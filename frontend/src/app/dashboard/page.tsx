"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import { analytics } from "@/lib/api";
import { Mail, TrendingUp, TrendingDown, Minus, Clock, RefreshCcw } from "lucide-react";
import Link from "next/link";

const CATEGORY_COLORS: Record<string, string> = {
  "Bills & Invoices": "#c46b5a",
  "Job Applications": "#849b87",
  "Orders & Deliveries": "#c99a5c",
  "OTPs & Notifications": "#b5838d",
  "Newsletters": "#a8a29e",
  "Real People": "#1c1917",
  "Academic": "#6b7a8f",
  "Promotions": "#d4a373",
  "Travel & Bookings": "#7c9885",
  "Uncategorized": "#e5e2db",
};

const SENTIMENT_COLORS = {
  positive: "#10b981",
  neutral: "#6b7280",
  negative: "#ef4444",
};

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [sentiment, setSentiment] = useState<any>({});
  const [topSenders, setTopSenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    // Poll sync status every 10 seconds
    const interval = setInterval(loadDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  async function loadDashboardData() {
    try {
      const [o, c, s, ts] = await Promise.all([
        analytics.overview(),
        analytics.categories(),
        analytics.sentiment(),
        analytics.topSenders(5),
      ]);
      setOverview(o);
      setCategories(c.categories);
      setSentiment(s.distribution);
      setTopSenders(ts.topSenders);
      
      // Check if syncing
      if (o.syncStatus === 'syncing') {
        setSyncing(true);
      } else {
        setSyncing(false);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-stone-50 border border-stone-200 rounded-2xl h-40 animate-pulse" />
        ))}
      </div>
    );
  }

  // Calculate week-over-week trend
  const weekTrend = overview?.weekOverWeekChange || 0;
  const TrendIcon = weekTrend > 0 ? TrendingUp : weekTrend < 0 ? TrendingDown : Minus;
  const trendColor = weekTrend > 0 ? 'text-green-600' : weekTrend < 0 ? 'text-red-600' : 'text-gray-600';

  // Format last synced time
  const lastSyncedText = overview?.lastSyncedAt 
    ? new Date(overview.lastSyncedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'Never';

  // Prepare sentiment bar chart data
  const sentimentData = [
    {
      name: 'Sentiment',
      positive: sentiment.positive || 0,
      neutral: sentiment.neutral || 0,
      negative: sentiment.negative || 0,
    },
  ];

  const totalSentiments = (sentiment.positive || 0) + (sentiment.neutral || 0) + (sentiment.negative || 0);

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight mb-2">
            Dashboard Overview
          </h1>
          <p className="text-sm text-stone-500 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Last synced: {lastSyncedText}
            {syncing && (
              <span className="flex items-center gap-1.5 text-blue-600 animate-pulse">
                <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                Syncing...
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up delay-100">
        {/* Total Emails */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
              Total Emails
            </span>
            <Mail className="w-5 h-5 text-stone-400" />
          </div>
          <div className="text-3xl font-bold text-stone-900">
            {(overview?.totalEmails || 0).toLocaleString()}
          </div>
        </div>

        {/* This Week */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
              This Week
            </span>
            <TrendIcon className={`w-5 h-5 ${trendColor}`} />
          </div>
          <div className="flex items-baseline gap-3">
            <div className="text-3xl font-bold text-stone-900">
              {(overview?.thisWeekEmails || 0).toLocaleString()}
            </div>
            <div className={`text-sm font-semibold ${trendColor} flex items-center gap-1`}>
              {weekTrend > 0 && '+'}
              {weekTrend}%
              <span className="text-xs text-stone-400 font-normal">vs last week</span>
            </div>
          </div>
        </div>

        {/* Unread Count */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
              Unread
            </span>
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-900">
            {(overview?.unreadCount || 0).toLocaleString()}
          </div>
        </div>

        {/* Last Week Comparison */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
              Last Week
            </span>
            <Minus className="w-5 h-5 text-stone-400" />
          </div>
          <div className="text-3xl font-bold text-stone-900">
            {(overview?.lastWeekEmails || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 animate-fade-in-up delay-200">
        {/* Category Donut Chart */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-stone-900 mb-6">
            Category Breakdown
          </h3>
          {categories.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <RechartsPie>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="count"
                    stroke="none"
                  >
                    {categories.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#e5e2db"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #e7e5e4',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-6">
                {categories.slice(0, 6).map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ background: CATEGORY_COLORS[cat.name] || "#e5e2db" }}
                    />
                    <span className="text-stone-700 truncate flex-1">{cat.name}</span>
                    <span className="text-stone-500 font-semibold">{cat.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-stone-400">
              No categorized emails yet
            </div>
          )}
        </div>

        {/* Sentiment Bar Chart */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-stone-900 mb-6">
            Sentiment Distribution
          </h3>
          {totalSentiments > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={sentimentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f4" />
                  <XAxis type="number" stroke="#78716c" tick={{ fill: '#78716c', fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #e7e5e4',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Bar dataKey="positive" fill={SENTIMENT_COLORS.positive} radius={[0, 4, 4, 0]} />
                  <Bar dataKey="neutral" fill={SENTIMENT_COLORS.neutral} radius={[0, 4, 4, 0]} />
                  <Bar dataKey="negative" fill={SENTIMENT_COLORS.negative} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-4 mt-6">
                {Object.entries({
                  positive: sentiment.positive || 0,
                  neutral: sentiment.neutral || 0,
                  negative: sentiment.negative || 0,
                }).map(([key, value]) => {
                  const percentage = totalSentiments > 0 ? Math.round((value / totalSentiments) * 100) : 0;
                  return (
                    <div key={key} className="text-center">
                      <div
                        className="w-4 h-4 rounded-full mx-auto mb-2"
                        style={{ background: SENTIMENT_COLORS[key as keyof typeof SENTIMENT_COLORS] }}
                      />
                      <div className="text-2xl font-bold text-stone-900">{percentage}%</div>
                      <div className="text-xs text-stone-500 capitalize mt-1">{key}</div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-stone-400">
              No sentiment data yet
            </div>
          )}
        </div>
      </div>

      {/* Most Active Sender Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm animate-fade-in-up delay-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-stone-900">Most Active Senders</h3>
          <Link
            href="/dashboard/people"
            className="text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            View All →
          </Link>
        </div>
        {topSenders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {topSenders.map((sender, index) => {
              const maxCount = topSenders[0]?.count || 1;
              const percentage = Math.round((sender.count / maxCount) * 100);
              
              return (
                <div
                  key={sender.email}
                  className="bg-stone-50 border border-stone-200 rounded-xl p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stone-700 to-stone-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {(sender.name || sender.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-stone-900 truncate">
                        {sender.name || sender.email.split('@')[0]}
                      </div>
                      <div className="text-xs text-stone-500 truncate">{sender.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">{sender.count} emails</span>
                    <span className="text-stone-700 font-semibold">{percentage}%</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-stone-700 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-stone-400">
            No sender data yet
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-4 animate-fade-in-up delay-400">
        <Link
          href="/dashboard/inbox"
          className="bg-gradient-to-br from-stone-900 to-stone-700 text-white rounded-2xl p-6 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold mb-1 opacity-90">Explore</div>
              <div className="text-2xl font-bold">Inbox</div>
            </div>
            <div className="text-3xl group-hover:scale-110 transition-transform">📧</div>
          </div>
        </Link>

        <Link
          href="/dashboard/search"
          className="bg-gradient-to-br from-purple-600 to-purple-500 text-white rounded-2xl p-6 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold mb-1 opacity-90">Semantic</div>
              <div className="text-2xl font-bold">Search</div>
            </div>
            <div className="text-3xl group-hover:scale-110 transition-transform">🔍</div>
          </div>
        </Link>

        <Link
          href="/dashboard/jobs"
          className="bg-gradient-to-br from-emerald-600 to-emerald-500 text-white rounded-2xl p-6 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold mb-1 opacity-90">Track</div>
              <div className="text-2xl font-bold">Job Apps</div>
            </div>
            <div className="text-3xl group-hover:scale-110 transition-transform">💼</div>
          </div>
        </Link>

        <Link
          href="/dashboard/chat"
          className="bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-2xl p-6 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold mb-1 opacity-90">Ask AI</div>
              <div className="text-2xl font-bold">Chat</div>
            </div>
            <div className="text-3xl group-hover:scale-110 transition-transform">💬</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
