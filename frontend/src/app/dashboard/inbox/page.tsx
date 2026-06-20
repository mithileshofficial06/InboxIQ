"use client";

import { useEffect, useState } from "react";
import { emails as emailsApi } from "@/lib/api";
import {
  Mail,
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  X,
  ChevronDown,
  Smile,
  Meh,
  Frown,
  ExternalLink,
  Clock,
  User,
  Tag,
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
    <div className="pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Inbox Explorer</h1>
          <p className="text-sm text-stone-500">
            {total.toLocaleString()} emails • {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg p-1">
          <button
            onClick={() => setView("grid")}
            className={`p-2 rounded transition-colors ${
              view === "grid" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
            }`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded transition-colors ${
              view === "list" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("timeline")}
            className={`p-2 rounded transition-colors ${
              view === "timeline" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
            }`}
            title="Timeline View"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Input */}
          <div className="flex-1 min-w-[250px] relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Search subjects, senders, content..."
              className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
            />
          </div>

          {/* Quick Category Filter */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
              loadEmails();
            }}
            className="px-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white cursor-pointer"
          >
            <option value="">All Categories</option>
            {Object.keys(CATEGORY_COLORS).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors relative"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-stone-900 text-white text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors"
          >
            Search
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">Sentiment</label>
              <select
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white"
              >
                <option value="">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">Sender</label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="sender@example.com"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-stone-600 hover:text-stone-900 transition-colors"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-stone-50 border border-stone-200 rounded-xl h-64 animate-pulse" />
              ))}
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone-400">
              <Mail className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">No emails found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {emails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => openEmailDetail(email)}
                  className="bg-white border border-stone-200 rounded-xl p-6 card-interactive"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stone-700 to-stone-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(email.sender_name || email.sender_email).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-stone-900 truncate">
                          {email.sender_name || email.sender_email.split("@")[0]}
                        </div>
                        <div className="text-xs text-stone-500 truncate">{email.sender_email}</div>
                      </div>
                    </div>
                    {email.sentiment && SENTIMENT_ICONS[email.sentiment as keyof typeof SENTIMENT_ICONS]}
                  </div>

                  {/* Subject */}
                  <h3 className="text-base font-bold text-stone-900 mb-2 line-clamp-2 group-hover:text-stone-700 transition-colors">
                    {email.subject || "No Subject"}
                  </h3>

                  {/* Snippet */}
                  <p className="text-sm text-stone-600 line-clamp-3 mb-4">{email.snippet}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                    <div className="flex items-center gap-2">
                      {email.category && (
                        <span
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold"
                          style={{
                            background: `${CATEGORY_COLORS[email.category]}15`,
                            color: CATEGORY_COLORS[email.category],
                          }}
                        >
                          {email.category}
                        </span>
                      )}
                      {email.has_attachments && <Paperclip className="w-3.5 h-3.5 text-stone-400" />}
                    </div>
                    <span className="text-xs text-stone-500">
                      {new Date(email.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="divide-y divide-stone-200">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-4 h-24 bg-stone-50 animate-pulse" />
              ))}
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone-400">
              <Mail className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">No emails found</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-200">
              {emails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => openEmailDetail(email)}
                  className="p-4 hover:bg-stone-50 transition-colors cursor-pointer flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stone-700 to-stone-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(email.sender_name || email.sender_email).charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="font-semibold text-stone-900 text-sm">
                        {email.sender_name || email.sender_email.split("@")[0]}
                      </span>
                      {email.category && (
                        <span
                          className="text-xs font-semibold"
                          style={{ color: CATEGORY_COLORS[email.category] }}
                        >
                          {email.category}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-stone-900 text-base truncate mb-1">
                      {email.subject || "No Subject"}
                    </h4>
                    <p className="text-sm text-stone-600 truncate">{email.snippet}</p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {email.sentiment && SENTIMENT_ICONS[email.sentiment as keyof typeof SENTIMENT_ICONS]}
                    {email.has_attachments && <Paperclip className="w-4 h-4 text-stone-400" />}
                    <span className="text-sm text-stone-500 min-w-[80px] text-right">
                      {new Date(email.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timeline View */}
      {view === "timeline" && (
        <div className="space-y-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-stone-50 border border-stone-200 rounded-xl h-40 animate-pulse" />
            ))
          ) : timeline.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone-400">
              <Calendar className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">No timeline data</p>
            </div>
          ) : (
            timeline.map((month) => (
              <div key={month.month} className="bg-white border border-stone-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-stone-900">
                    {new Date(month.month + "-01").toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <span className="text-sm font-semibold text-stone-600">
                    {month.count.toLocaleString()} emails
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Categories */}
                  <div>
                    <h4 className="text-sm font-semibold text-stone-700 mb-3">Top Categories</h4>
                    <div className="space-y-2">
                      {Object.entries(month.categories)
                        .sort(([, a]: any, [, b]: any) => b - a)
                        .slice(0, 5)
                        .map(([name, count]: any) => (
                          <div key={name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-sm"
                                style={{ background: CATEGORY_COLORS[name] || "#e5e2db" }}
                              />
                              <span className="text-stone-700">{name}</span>
                            </div>
                            <span className="text-stone-500 font-medium">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Sentiments */}
                  <div>
                    <h4 className="text-sm font-semibold text-stone-700 mb-3">Sentiment Breakdown</h4>
                    <div className="space-y-2">
                      {Object.entries(month.sentiments).map(([name, count]: any) => {
                        const Icon = name === "positive" ? Smile : name === "negative" ? Frown : Meh;
                        const color =
                          name === "positive" ? "text-green-600" : name === "negative" ? "text-red-600" : "text-gray-600";
                        return (
                          <div key={name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${color}`} />
                              <span className="text-stone-700 capitalize">{name}</span>
                            </div>
                            <span className="text-stone-500 font-medium">{count}</span>
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
        <div className="flex items-center justify-center gap-6 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 text-sm font-medium text-stone-700 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-stone-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 text-sm font-medium text-stone-700 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Email Detail Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={closeEmailDetail}>
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200">
              <div className="flex-1 min-w-0 mr-4">
                <h2 className="text-2xl font-bold text-stone-900 truncate">{selectedEmail.subject || "No Subject"}</h2>
                <div className="flex items-center gap-3 mt-2">
                  {selectedEmail.category && (
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold"
                      style={{
                        background: `${CATEGORY_COLORS[selectedEmail.category]}15`,
                        color: CATEGORY_COLORS[selectedEmail.category],
                      }}
                    >
                      {selectedEmail.category}
                    </span>
                  )}
                  {selectedEmail.sentiment && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      {SENTIMENT_ICONS[selectedEmail.sentiment as keyof typeof SENTIMENT_ICONS]}
                      <span className="capitalize">{selectedEmail.sentiment}</span>
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={closeEmailDetail}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {loadingThread ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin w-8 h-8 border-4 border-stone-200 border-t-stone-900 rounded-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  {emailThread.map((email, index) => (
                    <div
                      key={email.id}
                      className={`border border-stone-200 rounded-xl p-6 ${
                        index === emailThread.length - 1 ? "bg-stone-50" : "bg-white"
                      }`}
                    >
                      {/* Email Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-stone-700 to-stone-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {(email.sender_name || email.sender_email).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline justify-between gap-4 mb-1">
                            <span className="font-bold text-stone-900">{email.sender_name || email.sender_email}</span>
                            <span className="text-sm text-stone-500">
                              {new Date(email.date).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="text-sm text-stone-600">{email.sender_email}</div>
                        </div>
                      </div>

                      {/* Email Body */}
                      <div className="prose prose-sm prose-stone max-w-none">
                        <div className="whitespace-pre-wrap text-stone-800 leading-relaxed">
                          {email.body_text || email.snippet || "No content available"}
                        </div>
                      </div>

                      {/* Attachments */}
                      {email.has_attachments && (
                        <div className="mt-4 pt-4 border-t border-stone-200">
                          <div className="flex items-center gap-2 text-sm text-stone-600">
                            <Paperclip className="w-4 h-4" />
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
            <div className="p-6 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
              <button
                onClick={() => window.open(`https://mail.google.com/mail/#inbox/${selectedEmail.gmail_id}`, "_blank")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Gmail
              </button>
              <button
                onClick={closeEmailDetail}
                className="px-6 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors"
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
