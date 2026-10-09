import React, { useState } from 'react';
import { Search, Globe, ExternalLink, Sparkles, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { searchWithGrounding, GroundedSearchResult } from '../../services/geminiClient';

export const SearchGroundingTool: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GroundedSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleQueries = [
    'Latest CDC clinical guidelines for influenza and COVID boosters 2026',
    'Recent FDA drug alerts and recalls for blood pressure medications',
    'Updated treatment protocols for pediatric RSV infections',
    'Current recommendations for continuous glucose monitoring in diabetes',
  ];

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const data = await searchWithGrounding(searchQuery);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve search grounded data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-linear-to-tr from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-md">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Google Search Grounded Medical Intelligence</h2>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                gemini-3.5-flash + googleSearch
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Live web-grounded search delivering verified clinical research, drug alerts, and health updates
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(query);
        }}
        className="space-y-3"
      >
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search verified medical guidelines, outbreaks, FDA recalls, or drug interactions..."
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Example Queries:
          </span>
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(q);
                handleSearch(q);
              }}
              className="text-[11px] bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded-lg px-2.5 py-1 transition cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </form>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="space-y-6 pt-2">
          {/* Answer Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" /> Grounded Synthesis
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Grounded with Google Search
              </span>
            </div>

            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">
              {result.answer}
            </div>
          </div>

          {/* Sources Section */}
          {result.sources && result.sources.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" /> Verified Grounding Sources ({result.sources.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl transition group flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 line-clamp-1">
                        {src.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{src.uri}</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0 mt-0.5" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Search Queries Executed */}
          {result.searchQueries && result.searchQueries.length > 0 && (
            <div className="p-3 bg-slate-100/60 rounded-xl text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-700">Search Queries Executed:</span>
              {result.searchQueries.map((sq, i) => (
                <span key={i} className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-mono text-[10px]">
                  {sq}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
