'use client';

import { useState, useEffect } from 'react';
import { Search, Sparkles, Filter, X, Mail, Calendar, Tag, TrendingUp, Loader2 } from 'lucide-react';

interface SearchResult {
  emailId: string;
  chunkText: string;
  similarity: number;
  subject: string;
  senderName: string;
  senderEmail: string;
  receivedAt: string;
  category: string;
  sentiment: string;
}

interface SearchFilters {
  category: string;
  dateFrom: string;
  dateTo: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    dateFrom: '',
    dateTo: '',
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  // Fetch suggestions on mount
  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('http://localhost:3001/search/suggestions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/search/semantic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          query: query.trim(),
          category: filters.category || undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          limit: 20,
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      performSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setTimeout(() => performSearch(), 100);
  };

  const clearFilters = () => {
    setFilters({ category: '', dateFrom: '', dateTo: '' });
  };

  const activeFilterCount = [filters.category, filters.dateFrom, filters.dateTo].filter(Boolean).length;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Bills & Invoices': 'bg-orange-100 text-orange-800',
      'Job Applications': 'bg-green-100 text-green-800',
      'Orders & Deliveries': 'bg-yellow-100 text-yellow-800',
      'OTPs & Notifications': 'bg-pink-100 text-pink-800',
      'Newsletters': 'bg-gray-100 text-gray-800',
      'Real People': 'bg-stone-100 text-stone-900',
      'Academic': 'bg-blue-100 text-blue-800',
      'Promotions': 'bg-amber-100 text-amber-800',
      'Travel & Bookings': 'bg-teal-100 text-teal-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const highlightMatch = (text: string, maxLength = 300) => {
    // Simple truncation with ellipsis
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6 sm:p-8 smooth-scroll">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-10 reveal-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stone-900 to-stone-700 flex items-center justify-center float-gentle">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-stone-900 tracking-tight">Semantic Search</h1>
        </div>
        <p className="text-stone-600 text-lg">Ask questions using natural language and find relevant emails instantly</p>
      </div>

      {/* Search Bar */}
      <div className="max-w-5xl mx-auto mb-8 reveal-up stagger-1">
        <div className="relative hover-glow">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything about your emails..."
            className="w-full pl-14 pr-36 py-5 rounded-2xl border-2 border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent text-lg bg-white shadow-sm transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                showFilters ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="text-xs font-semibold">{activeFilterCount}</span>
              )}
            </button>
            <button
              onClick={performSearch}
              disabled={loading || !query.trim()}
              className="px-6 py-2.5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium btn-shine"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <span>Search</span>
              )}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-900">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-stone-600 hover:text-stone-900 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear all
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                >
                  <option value="">All Categories</option>
                  <option value="Bills & Invoices">Bills & Invoices</option>
                  <option value="Job Applications">Job Applications</option>
                  <option value="Orders & Deliveries">Orders & Deliveries</option>
                  <option value="OTPs & Notifications">OTPs & Notifications</option>
                  <option value="Newsletters">Newsletters</option>
                  <option value="Real People">Real People</option>
                  <option value="Academic">Academic</option>
                  <option value="Promotions">Promotions</option>
                  <option value="Travel & Bookings">Travel & Bookings</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {!loading && results.length === 0 && query === '' && (
        <div className="max-w-5xl mx-auto mb-8">
          <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-3">Suggested Queries</h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-5 py-3 bg-white text-stone-700 rounded-xl border-2 border-stone-200 hover:border-stone-900 hover:bg-stone-50 transition-all text-sm font-medium hover-lift"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {loading && (
        <div className="max-w-5xl mx-auto">
          <div className="space-y-4">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-stone-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-stone-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-stone-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-stone-600">
              Found <span className="font-semibold text-stone-900">{results.length}</span> relevant results
            </p>
          </div>

          <div className="space-y-4">
            {results.map((result, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border-2 border-stone-200 card-interactive"
                onClick={() => setSelectedEmail(result.emailId)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-stone-900 text-lg mb-1 line-clamp-1">
                      {result.subject}
                    </h3>
                    <p className="text-sm text-stone-600 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {result.senderName || result.senderEmail}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(result.category)}`}>
                      {result.category}
                    </span>
                    <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      <TrendingUp className="w-3 h-3" />
                      {Math.round(result.similarity * 100)}%
                    </div>
                  </div>
                </div>

                {/* Matched Content */}
                <div className="bg-stone-50 rounded-lg p-4 mb-3">
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {highlightMatch(result.chunkText)}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-4 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(result.receivedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {result.sentiment}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && query !== '' && (
        <div className="max-w-5xl mx-auto text-center py-12">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-stone-400" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 mb-2">No results found</h3>
          <p className="text-stone-600">Try adjusting your search query or filters</p>
        </div>
      )}
    </div>
  );
}
