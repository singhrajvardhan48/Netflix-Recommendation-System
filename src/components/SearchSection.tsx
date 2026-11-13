'use client';

import React, { useState, useEffect } from 'react';
import { Movie } from '@/lib/types';
import { Search, Sparkles, X, AlertCircle, Film, User, Clapperboard, Compass } from 'lucide-react';
import MovieCard from './MovieCard';

interface SearchSectionProps {
  onSelectMovie: (movie: Movie) => void;
  onOpenModal: (movie: Movie) => void;
  initialQuery?: string;
}

const QUICK_SEARCH_CHIPS = [
  { label: 'Christopher Nolan', type: 'Director' },
  { label: 'Leonardo DiCaprio', type: 'Actor' },
  { label: 'Quentin Tarantino', type: 'Director' },
  { label: 'Tom Cruise', type: 'Actor' },
  { label: 'Space', type: 'Theme' },
  { label: 'Zombie', type: 'Theme' },
  { label: 'Time Travel', type: 'Theme' },
  { label: 'Avatar', type: 'Title' },
];

export default function SearchSection({ onSelectMovie, onOpenModal, initialQuery = '' }: SearchSectionProps) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Movie[]>([]);
  const [category, setCategory] = useState<string>('all');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      executeSearch(initialQuery);
    }
  }, [initialQuery]);

  const executeSearch = async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      setCategory('all');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=40`);
      const data = await res.json();
      if (data.success) {
        setResults(data.results || []);
        setCategory(data.category || 'Keyword');
      } else {
        setResults([]);
        setCategory('none');
      }
    } catch (err) {
      setResults([]);
      setCategory('none');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeSearch(query);
    }
  };

  const handleChipClick = (term: string) => {
    setQuery(term);
    executeSearch(term);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setCategory('all');
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Director':
        return <Clapperboard className="w-4 h-4 text-emerald-400" />;
      case 'Lead Actor / Cast':
        return <User className="w-4 h-4 text-sky-400" />;
      case 'Genre':
        return <Compass className="w-4 h-4 text-amber-400" />;
      case 'Theme / Plot Content':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      default:
        return <Film className="w-4 h-4 text-netflix-red" />;
    }
  };

  return (
    <div id="search" className="px-4 md:px-12 py-12 bg-gradient-to-b from-neutral-900/40 via-neutral-900/20 to-transparent">
      {/* Search Header */}
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 flex items-center justify-center gap-2.5">
          <Search className="w-6 h-6 text-netflix-red" />
          Multi-Field Search & Discovery
        </h2>
        <p className="text-sm md:text-base text-neutral-400">
          Find movies by <strong>Director</strong>, <strong>Lead Actor</strong>, <strong>Plot Theme</strong>, or <strong>Movie Title</strong> across 4,797 titles.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="relative flex items-center shadow-2xl rounded-full bg-neutral-900 border-2 border-neutral-700 focus-within:border-netflix-red transition-all">
          <Search className="absolute left-5 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type e.g. Christopher Nolan, Leonardo DiCaprio, Space, Zombie, Avatar..."
            className="w-full bg-transparent text-white pl-13 pr-24 py-3.5 text-sm md:text-base focus:outline-none placeholder:text-neutral-500 rounded-full"
          />
          <div className="absolute right-3 flex items-center gap-1.5">
            {query && (
              <button
                onClick={handleClear}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => executeSearch(query)}
              disabled={loading}
              className="btn-netflix font-bold text-xs md:text-sm px-4 py-2 rounded-full cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Quick Search Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <span className="text-xs text-neutral-500 font-medium">Try:</span>
          {QUICK_SEARCH_CHIPS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleChipClick(chip.label)}
              className="text-xs bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-3 py-1 rounded-full border border-neutral-800 hover:border-neutral-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>{chip.label}</span>
              <span className="text-[10px] text-neutral-500 font-mono">({chip.type})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results or Record Not Found State */}
      {hasSearched && (
        <div className="max-w-6xl mx-auto mt-8">
          {results.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  <span className="text-sm md:text-base font-semibold text-white">
                    Found <span className="text-emerald-400 font-bold">{results.length}</span> movies matching {category}: <em className="text-neutral-300">"{query}"</em>
                  </span>
                </div>
                <span className="text-xs text-neutral-500">Sorted by relevance & popularity</span>
              </div>

              {/* Movie Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
                {results.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onOpenModal={onOpenModal}
                    onRecommend={onSelectMovie}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Explicit Record Not Found Banner */
            <div className="bg-gradient-to-b from-[#2b1214] to-[#170a0c] border-l-4 border-netflix-red p-6 rounded-lg text-left shadow-xl max-w-3xl mx-auto">
              <div className="flex items-start gap-3.5">
                <AlertCircle className="w-6 h-6 text-netflix-red shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1.5">
                    Record Not Found / No Match Found
                  </h3>
                  <p className="text-sm text-neutral-300 mb-3 leading-relaxed">
                    No movie, director, actor, or theme matching <strong>"{query}"</strong> was found in the catalog.
                  </p>
                  <p className="text-xs text-neutral-400 mb-4">
                    Suggestions to find what you are looking for:
                  </p>
                  <ul className="text-xs text-neutral-400 list-disc list-inside space-y-1">
                    <li>Check spelling of the director or actor name (e.g. <em>Christopher Nolan</em>, <em>Leonardo DiCaprio</em>).</li>
                    <li>Try a broader topic keyword like <em>Space</em>, <em>Zombie</em>, <em>Superhero</em>, or <em>War</em>.</li>
                    <li>Browse top movies directly below in our curated carousels.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

