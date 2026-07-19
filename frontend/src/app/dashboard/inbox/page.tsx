"use client";

import { useEffect, useState } from "react";
import { emails as emailsApi } from "@/lib/api";
import {
  Mail,
  Search,
  SlidersHorizontal,
  Grid,
  List,
  Calendar,
  X,
  ChevronDown,
  Smile,
  Meh,
  Frown,
  ExternalLink,
  Paperclip,
} from "lucide-react";

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
};

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  "Bills & Invoices": { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  "Job Applications": { bg: "#e0e7ff", text: "#3730a3", border: "#c7d2fe" },
  "Orders & Deliveries": { bg: "#fef9c3", text: "#854d0e", border: "#fef08a" },
  "OTPs & Notifications": { bg: "#f3f4f6", text: "#374151", border: "#e5e7eb" },
  "Newsletters": { bg: "#fce7f3", text: "#9d174d", border: "#fbcfe8" },
  "Real People": { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" },
  "Academic": { bg: "#ede9fe", text: "#5b21b6", border: "#ddd6fe" },
  "Promotions": { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
  "Travel & Bookings": { bg: "#e0f2fe", text: "#075985", border: "#bae6fd" },
  "Travel": { bg: "#e0f2fe", text: "#075985", border: "#bae6fd" },
  "Uncategorized": { bg: "#f5f2ed", text: "#78716c", border: "#e5e2db" },
};

const getCategoryStyle = (category: string) => {
  const normalized = category || "Uncategorized";
  if (normalized.startsWith("Travel")) {
    return CATEGORY_STYLES["Travel"];
  }
  return CATEGORY_STYLES[normalized] || CATEGORY_STYLES["Uncategorized"];
};

const getAvatarColor = (name: string) => {
  const colors = ['#6b7a8f', '#849b87', '#c46b5a', '#c99a5c', '#b5838d'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};

const SENTIMENT_ICONS = {
  positive: <Smile className="w-4 h-4 text-green-600" />,
  neutral: <Meh className="w-4 h-4 text-gray-600" />,
  negative: <Frown className="w-4 h-4 text-red-600" />,
};

type ViewMode = "grid" | "list" | "timeline";

export default function InboxExplorerPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sender, setSender] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Email detail modal
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [emailThread, setEmailThread] = useState<any[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);

  useEffect(() => {
    if (view === "timeline") {
      loadTimeline();
    } else {
      loadEmails();
    }
  }, [page, view]);

  async function loadEmails() {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: view === "grid" ? 12 : 20,
      };
      
      if (category) params.category = category;
      if (sentiment) params.sentiment = sentiment;
      if (search) params.search = search;
      if (sender) params.sender = sender;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      
      const data = await emailsApi.list(params);
      setEmails(data.emails);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error("Failed to load emails:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadTimeline() {
    setLoading(true);
    try {
      const response = await fetch("/api/emails/timeline", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setTimeline(data.timeline || []);
    } catch (error) {
      console.error("Failed to load timeline:", error);
    } finally {
      setLoading(false);
    }
  }

  async function openEmailDetail(email: any) {
    setSelectedEmail(email);
    setLoadingThread(true);
    
    try {
      const response = await fetch(`/api/emails/thread/${email.thread_id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setEmailThread(data.thread || [email]);
    } catch (error) {
      console.error("Failed to load thread:", error);
      setEmailThread([email]);
    } finally {
      setLoadingThread(false);
    }
  }

  function closeEmailDetail() {
    setSelectedEmail(null);
    setEmailThread([]);
  }

  function applyFilters() {
    setPage(1);
    loadEmails();
    setShowFilters(false);
  }

  function clearFilters() {
    setCategory("");
    setSentiment("");
    setSearch("");
    setSender("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
    loadEmails();
  }

  const activeFiltersCount = [category, sentiment, search, sender, dateFrom, dateTo].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#f0ede8] p-12">
      <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[#1c1917] tracking-tight leading-tight mb-2">Inbox Explorer</h1>
          <p className="text-base text-[#78716c] font-medium">
            {total.toLocaleString()} emails • {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-white border-2 border-[#e5e2db] rounded-xl p-2 shadow-sm">
          <button
            onClick={() => setView("grid")}
            className={`transition-all duration-200 ${
              view === "grid"
                ? "bg-[#1c1917] text-white shadow-md"
                : "text-[#a8a29e] bg-transparent hover:bg-[#ede9e3]"
            } rounded-lg w-10 h-10 flex items-center justify-center cursor-pointer`}
            title="Grid View"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`transition-all duration-200 ${
              view === "list"
                ? "bg-[#1c1917] text-white shadow-md"
                : "text-[#a8a29e] bg-transparent hover:bg-[#ede9e3]"
            } rounded-lg w-10 h-10 flex items-center justify-center cursor-pointer`}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setView("timeline")}
            className={`transition-all duration-200 ${
              view === "timeline"
                ? "bg-[#1c1917] text-white shadow-md"
                : "text-[#a8a29e] bg-transparent hover:bg-[#ede9e3]"
            } rounded-lg w-10 h-10 flex items-center justify-center cursor-pointer`}
            title="Timeline View"
          >
            <Calendar className="w-5 h-5" />
          </button>
        </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border-2 border-[#e5e2db] rounded-2xl p-6 mb-10 shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search Input */}
          <div className="flex-1 min-w-[320px] relative h-14">
            <Search className="w-5 h-5 text-[#a8a29e] absolute left-5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Search subjects, senders, content..."
              style={{ paddingLeft: "3.5rem" }}
              className="w-full h-full pr-5 border-2 border-[#e5e2db] rounded-xl text-base text-[#1c1917] bg-white placeholder-[#a8a29e] hover:border-[#d6d3d1] focus:border-[#1c1917] focus:ring-4 focus:ring-[#1c1917]/10 focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Quick Category Filter */}
          <div className="relative h-14 min-w-[200px]">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
                loadEmails();
              }}
              style={{ paddingLeft: "1.5rem", paddingRight: "3rem" }}
              className="appearance-none w-full h-full border-2 border-[#e5e2db] rounded-xl text-base text-[#1c1917] bg-white cursor-pointer hover:border-[#d6d3d1] focus:border-[#1c1917] focus:ring-4 focus:ring-[#1c1917]/10 focus:outline-none transition-all duration-200 font-medium"
            >
              <option value="">All Categories</option>
              {Object.keys(CATEGORY_COLORS).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="w-5 h-5 text-[#a8a29e] absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{ paddingLeft: "2rem", paddingRight: "2rem" }}
            className="flex items-center gap-3 h-14 border-2 border-[#e5e2db] rounded-xl text-base font-bold text-[#1c1917] bg-white hover:bg-[#f5f2ed] hover:border-[#d6d3d1] transition-all relative shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-5 h-5 text-[#78716c]" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2.5 py-1 text-xs leading-none bg-[#1c1917] text-white rounded-full font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Search Button */}
          <button
            onClick={applyFilters}
            className="w-14 h-14 flex items-center justify-center bg-[#1c1917] text-white rounded-xl hover:bg-[#292524] active:scale-95 transition-all shrink-0 cursor-pointer shadow-md hover:shadow-lg"
          >
            <Search className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t-2 border-[#e5e2db] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-sm font-bold text-[#57534e] mb-3">Sentiment</label>
              <div className="relative h-12">
                <select
                  value={sentiment}
                  onChange={(e) => setSentiment(e.target.value)}
                  className="appearance-none w-full h-full pl-5 pr-12 border-2 border-[#e5e2db] rounded-xl text-base text-[#1c1917] bg-white focus:border-[#1c1917] focus:ring-4 focus:ring-[#1c1917]/10 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="">All Sentiments</option>
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
                <ChevronDown className="w-5 h-5 text-[#a8a29e] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#57534e] mb-3">Sender</label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="sender@example.com"
                className="w-full h-12 px-5 border-2 border-[#e5e2db] rounded-xl text-base text-[#1c1917] bg-white focus:border-[#1c1917] focus:ring-4 focus:ring-[#1c1917]/10 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#57534e] mb-3">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full h-12 px-5 border-2 border-[#e5e2db] rounded-xl text-base text-[#1c1917] bg-white focus:border-[#1c1917] focus:ring-4 focus:ring-[#1c1917]/10 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#57534e] mb-3">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full h-12 px-5 border-2 border-[#e5e2db] rounded-xl text-base text-[#1c1917] bg-white focus:border-[#1c1917] focus:ring-4 focus:ring-[#1c1917]/10 focus:outline-none transition-all"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-3 mt-2">
              <button
                onClick={clearFilters}
                className="px-6 py-3 text-base font-semibold text-[#57534e] hover:text-[#1c1917] transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid View */}
      {view === "grid" && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-10">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl border-2 border-gray-200 p-8 animate-pulse">
                  <div className="flex items-start gap-5 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="w-32 h-4 bg-gray-200 rounded" />
                      <div className="w-48 h-3 bg-gray-200 rounded" />
                    </div>
                    <div className="w-20 h-3 bg-gray-200 rounded shrink-0" />
                  </div>
                  <div className="w-32 h-7 bg-gray-200 rounded-full mb-5" />
                  <div className="space-y-3 mb-4">
                    <div className="w-full h-5 bg-gray-200 rounded" />
                    <div className="w-4/5 h-5 bg-gray-200 rounded" />
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="w-full h-4 bg-gray-200 rounded" />
                    <div className="w-full h-4 bg-gray-200 rounded" />
                    <div className="w-2/3 h-4 bg-gray-200 rounded" />
                  </div>
                  <div className="pt-6 border-t-2 border-gray-100 flex justify-between">
                    <div className="w-16 h-5 bg-gray-200 rounded" />
                    <div className="w-6 h-6 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
              <Mail className="w-20 h-20 mb-6" />
              <p className="text-xl font-semibold mb-2">No emails found</p>
              <p className="text-base">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-10">
              {emails.map((email, index) => {
                const isUnread = !email.is_read;
                const categoryStyle = getCategoryStyle(email.category);
                const senderName = email.sender_name || email.sender_email.split("@")[0];
                const formattedDate =
                  new Date(email.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  }) +
                  " · " +
                  new Date(email.date).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  });

                return (
                  <div
                    key={email.id}
                    onClick={() => openEmailDetail(email)}
                    className={`group cursor-pointer bg-white rounded-3xl border-2 transition-all duration-300 ease-out shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-gray-400 p-8 reveal-up ${
                      isUnread
                        ? "border-l-[6px] border-l-blue-600 border-t-gray-200 border-r-gray-200 border-b-gray-200"
                        : "border-gray-200"
                    }`}
                    style={{ animationDelay: `${(index % 12) * 0.04}s` }}
                  >
                    {/* Header: Avatar + Sender Info + Date */}
                    <div className="flex items-start gap-5 mb-6">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-md"
                        style={{ backgroundColor: getAvatarColor(email.sender_name || email.sender_email) }}
                      >
                        {getInitials(email.sender_name || email.sender_email)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-bold text-gray-900 truncate mb-1">{senderName}</div>
                        <div className="text-sm text-gray-500 truncate">{email.sender_email}</div>
                      </div>
                      <div className="text-xs font-medium text-gray-500 text-right flex-shrink-0 whitespace-nowrap ml-2">
                        {formattedDate}
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="mb-5">
                      <span
                        className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold border-2"
                        style={{
                          backgroundColor: categoryStyle.bg,
                          color: categoryStyle.text,
                          borderColor: categoryStyle.border,
                        }}
                      >
                        {email.category || "Uncategorized"}
                      </span>
                    </div>

                    {/* Subject */}
                    <h3
                      className={`text-xl mb-4 leading-snug ${
                        isUnread ? "font-extrabold" : "font-bold"
                      } text-gray-900`}
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {email.subject || "No Subject"}
                    </h3>

                    {/* Preview Text */}
                    <p
                      className="text-base text-gray-600 leading-relaxed mb-6"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {email.snippet || "No preview available"}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
                      <div className="flex items-center gap-4">
                        {email.sentiment && (
                          <div className="flex items-center">
                            {SENTIMENT_ICONS[email.sentiment as keyof typeof SENTIMENT_ICONS]}
                          </div>
                        )}
                        {email.has_attachments && (
                          <div className="flex items-center text-gray-400" title="Has attachments">
                            <Paperclip className="w-5 h-5" />
                          </div>
                        )}
                        {isUnread && (
                          <span
                            className="w-3 h-3 rounded-full bg-blue-600 dash-pulse-dot shrink-0"
                            title="Unread"
                          />
                        )}
                      </div>
                      <div className="text-gray-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5-5 5M6 12h12" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="bg-white border border-[#e5e2db] rounded-xl overflow-hidden">
          {loading ? (
            <div className="divide-y divide-[#e5e2db]">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-4 h-24 bg-white animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#ede9e3] shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="w-32 h-3 bg-[#ede9e3] rounded" />
                    <div className="w-48 h-4 bg-[#ede9e3] rounded" />
                    <div className="w-full h-3 bg-[#ede9e3] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#a8a29e]">
              <Mail className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">No emails found</p>
            </div>
          ) : (
            <div className="divide-y divide-[#e5e2db]">
              {emails.map((email) => {
                const isUnread = !email.is_read;
                return (
                  <div
                    key={email.id}
                    onClick={() => openEmailDetail(email)}
                    className="p-4 hover:bg-[#f5f2ed] transition-colors cursor-pointer flex items-center gap-4 group"
                  >
                    {/* Sender Avatar */}
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ backgroundColor: getAvatarColor(email.sender_name || email.sender_email) }}
                    >
                      {getInitials(email.sender_name || email.sender_email)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-[#1c1917] text-sm">
                          {email.sender_name || email.sender_email.split("@")[0]}
                        </span>
                        {/* Category Badge */}
                        {(() => {
                          const style = getCategoryStyle(email.category);
                          return (
                            <span
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                              style={{
                                backgroundColor: style.bg,
                                color: style.text,
                                borderColor: style.border,
                              }}
                            >
                              {email.category || "Uncategorized"}
                            </span>
                          );
                        })()}
                      </div>
                      <h4 className={`text-[#1c1917] text-[15px] truncate mb-0.5 ${isUnread ? 'font-bold' : 'font-semibold'}`}>
                        {email.subject || "No Subject"}
                      </h4>
                      <p className="text-sm text-[#78716c] truncate">{email.snippet}</p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-[#6b7a8f]" title="Unread" />}
                      {email.sentiment && SENTIMENT_ICONS[email.sentiment as keyof typeof SENTIMENT_ICONS]}
                      {email.has_attachments && <Paperclip className="w-4 h-4 text-[#a8a29e]" />}
                      <span className="text-sm text-[#a8a29e] min-w-[80px] text-right">
                        {new Date(email.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Timeline View */}
      {view === "timeline" && (
        <div className="space-y-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#e5e2db] rounded-xl h-40 animate-pulse" />
            ))
          ) : timeline.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#a8a29e]">
              <Calendar className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">No timeline data</p>
            </div>
          ) : (
            timeline.map((month) => (
              <div key={month.month} className="bg-white border border-[#e5e2db] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-[#1c1917]">
                    {new Date(month.month + "-01").toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <span className="text-sm font-semibold text-[#57534e]">
                    {month.count.toLocaleString()} emails
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Categories */}
                  <div>
                    <h4 className="text-sm font-semibold text-[#57534e] mb-3">Top Categories</h4>
                    <div className="space-y-2">
                      {Object.entries(month.categories)
                        .sort(([, a]: any, [, b]: any) => b - a)
                        .slice(0, 5)
                        .map(([name, count]: any) => {
                          const style = getCategoryStyle(name);
                          return (
                            <div key={name} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-sm border"
                                  style={{ backgroundColor: style.bg, borderColor: style.border }}
                                />
                                <span className="text-[#57534e]">{name}</span>
                              </div>
                              <span className="text-[#a8a29e] font-medium">{count}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Sentiments */}
                  <div>
                    <h4 className="text-sm font-semibold text-[#57534e] mb-3">Sentiment Breakdown</h4>
                    <div className="space-y-2">
                      {Object.entries(month.sentiments).map(([name, count]: any) => {
                        const Icon = name === "positive" ? Smile : name === "negative" ? Frown : Meh;
                        const color =
                          name === "positive" ? "text-green-600" : name === "negative" ? "text-red-600" : "text-gray-600";
                        return (
                          <div key={name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${color}`} />
                              <span className="text-[#57534e] capitalize">{name}</span>
                            </div>
                            <span className="text-[#a8a29e] font-medium">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {view !== "timeline" && totalPages > 1 && (
        <div className="flex items-center justify-center gap-8 mt-12">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-6 py-3 text-base font-semibold text-[#57534e] border-2 border-[#e5e2db] rounded-xl hover:bg-[#f5f2ed] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            Previous
          </button>
          <span className="text-base font-medium text-[#57534e]">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-6 py-3 text-base font-semibold text-[#57534e] border-2 border-[#e5e2db] rounded-xl hover:bg-[#f5f2ed] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            Next
          </button>
        </div>
      )}
      </div>

      {/* Email Detail Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={closeEmailDetail}>
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#e5e2db]">
              <div className="flex-1 min-w-0 mr-4">
                <h2 className="text-2xl font-bold text-[#1c1917] truncate">{selectedEmail.subject || "No Subject"}</h2>
                <div className="flex items-center gap-3 mt-2">
                  {(() => {
                    const style = getCategoryStyle(selectedEmail.category);
                    return (
                      <span
                        className="inline-flex items-center text-[10px] font-semibold px-2.5 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: style.bg,
                          color: style.text,
                          borderColor: style.border,
                        }}
                      >
                        {selectedEmail.category || "Uncategorized"}
                      </span>
                    );
                  })()}
                  {selectedEmail.sentiment && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[#57534e]">
                      {SENTIMENT_ICONS[selectedEmail.sentiment as keyof typeof SENTIMENT_ICONS]}
                      <span className="capitalize">{selectedEmail.sentiment}</span>
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={closeEmailDetail}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f5f2ed] transition-colors"
              >
                <X className="w-5 h-5 text-[#57534e]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] flex-1">
              {loadingThread ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin w-8 h-8 border-4 border-[#e5e2db] border-t-[#1c1917] rounded-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  {emailThread.map((email, index) => (
                    <div
                      key={email.id}
                      className={`border border-[#e5e2db] rounded-xl p-6 ${
                        index === emailThread.length - 1 ? "bg-[#f5f2ed]" : "bg-white"
                      }`}
                    >
                      {/* Email Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0"
                          style={{ backgroundColor: getAvatarColor(email.sender_name || email.sender_email) }}
                        >
                          {getInitials(email.sender_name || email.sender_email)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline justify-between gap-4 mb-1">
                            <span className="font-bold text-[#1c1917]">{email.sender_name || email.sender_email}</span>
                            <span className="text-xs text-[#a8a29e]">
                              {new Date(email.date).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="text-sm text-[#a8a29e]">{email.sender_email}</div>
                        </div>
                      </div>

                      {/* Email Body */}
                      <div className="prose prose-sm prose-stone max-w-none">
                        <div className="whitespace-pre-wrap text-[#1c1917] leading-relaxed text-[14px]">
                          {email.body_text || email.snippet || "No content available"}
                        </div>
                      </div>

                      {/* Attachments */}
                      {email.has_attachments && (
                        <div className="mt-4 pt-4 border-t border-[#e5e2db]">
                          <div className="flex items-center gap-2 text-sm text-[#57534e]">
                            <Paperclip className="w-4 h-4 text-[#a8a29e]" />
                            <span>This email has attachments</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#e5e2db] bg-[#f5f2ed] flex items-center justify-between">
              <button
                onClick={() => window.open(`https://mail.google.com/mail/#inbox/${selectedEmail.gmail_id}`, "_blank")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#57534e] hover:text-[#1c1917] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Gmail
              </button>
              <button
                onClick={closeEmailDetail}
                className="px-6 py-2 bg-[#1c1917] text-white rounded-lg text-sm font-medium hover:bg-[#292524] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
