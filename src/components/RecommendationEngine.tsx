'use client';

import React, { useState, useEffect } from 'react';
import { Movie } from '@/lib/types';
import { Sparkles, Star, Calendar, Clapperboard, Users, Film, CheckCircle } from 'lucide-react';
import MovieCard from './MovieCard';

interface RecommendationEngineProps {
  initialMovie?: Movie;
  allMovies: Movie[];
  onOpenModal: (movie: Movie) => void;
}

export default function RecommendationEngine({
  initialMovie,
  allMovies,
  onOpenModal,
}: RecommendationEngineProps) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(initialMovie || null);
  const [recCount, setRecCount] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<(Movie & { matchPercentage: number })[]>([]);
  const [spotlightPoster, setSpotlightPoster] = useState<string>('/default_poster.png');

  // Set default initial movie if none selected
  useEffect(() => {
    if (!selectedMovie && allMovies.length > 0) {
      const defaultOne = allMovies.find((m) => m.title.toLowerCase() === 'avatar') || allMovies[0];
      setSelectedMovie(defaultOne);
    }
  }, [allMovies, selectedMovie]);

  // Fetch recommendations whenever selectedMovie or recCount changes
  useEffect(() => {
    if (!selectedMovie) return;

    let isMounted = true;
    setLoading(true);

    // Fetch poster for spotlight
    fetch(`/api/poster/${selectedMovie.id}`)
      .then((res) => res.json())
      .then((pData) => {
        if (isMounted) {
          setSpotlightPoster(pData.poster || '/default_poster.png');
        }
      })
      .catch(() => {
        if (isMounted) setSpotlightPoster('/default_poster.png');
      });

    // Fetch AI recommendations
    fetch(`/api/recommend?id=${selectedMovie.id}&limit=${recCount}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (data.success && data.data?.recommendations) {
            setRecommendations(data.data.recommendations);
          } else {
            setRecommendations([]);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setRecommendations([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMovie, recCount]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chosenId = Number(e.target.value);
    const movie = allMovies.find((m) => m.id === chosenId);
    if (movie) {
      setSelectedMovie(movie);
    }
  };

  const handleRecommendSelf = (movie: Movie) => {
    setSelectedMovie(movie);
    // Smooth scroll into recommender view
    const el = document.getElementById('recommendations');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="recommendations" className="px-4 md:px-12 py-12 scroll-mt-20">
      {/* Section Header */}
      <div className="max-w-4xl mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="p-1.5 rounded-md bg-netflix-red/20 text-netflix-red border border-netflix-red/30">
            <Sparkles className="w-5 h-5" />
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            AI Content-Based Recommendation Engine
          </h2>
        </div>
        <p className="text-sm md:text-base text-neutral-400">
          Powered by Natural Language Processing and pairwise Cosine Similarity across movie plot overviews,
          genres, directors, keywords, and cast members.
        </p>
      </div>

      {/* Control Box: Movie Selector & Recs Count */}
      <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-xl shadow-xl mb-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Select Seed Movie from Catalog (4,797 Titles):
            </label>
            <select
              value={selectedMovie?.id || ''}
              onChange={handleSelectChange}
              className="w-full bg-neutral-950 border border-neutral-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-netflix-red transition"
            >
              {allMovies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} {m.year ? `(${m.year})` : ''} — {m.director ? `Dir: ${m.director}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Recommendations:
            </label>
            <select
              value={recCount}
              onChange={(e) => setRecCount(Number(e.target.value))}
              className="w-full bg-neutral-950 border border-neutral-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-netflix-red transition"
            >
              {[5, 6, 7, 8, 9, 10, 12].map((num) => (
                <option key={num} value={num}>
                  Top {num} Movies
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Selected Movie Spotlight Card */}
      {selectedMovie && (
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 border-l-4 border-netflix-red p-6 rounded-xl shadow-2xl mb-10 max-w-5xl">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-32 sm:w-40 shrink-0 aspect-[2/3] rounded-lg overflow-hidden bg-black shadow-lg border border-neutral-800">
              <img
                src={spotlightPoster}
                alt={selectedMovie.title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/default_poster.png';
                }}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-netflix-red text-white text-[11px] font-bold px-2 py-0.5 rounded uppercase">
                  SEED MOVIE
                </span>
                <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {selectedMovie.rating > 0 ? `${selectedMovie.rating} / 10` : 'NR'}
                </span>
                {selectedMovie.year && (
                  <span className="flex items-center gap-1 text-xs text-neutral-300 bg-neutral-800 px-2 py-0.5 rounded">
                    <Calendar className="w-3 h-3" />
                    {selectedMovie.year}
                  </span>
                )}
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                {selectedMovie.title}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-300 mb-3">
                {selectedMovie.director && (
                  <div className="flex items-center gap-1.5">
                    <Clapperboard className="w-3.5 h-3.5 text-netflix-red shrink-0" />
                    <span><strong>Director:</strong> {selectedMovie.director}</span>
                  </div>
                )}
                {selectedMovie.cast && selectedMovie.cast.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-netflix-red shrink-0" />
                    <span><strong>Top Cast:</strong> {selectedMovie.cast.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {selectedMovie.genres.map((g) => (
                  <span key={g} className="text-xs bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">
                    {g}
                  </span>
                ))}
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 line-clamp-3 leading-relaxed">
                {selectedMovie.overview}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Results Grid */}
      <div className="max-w-7xl">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-neutral-800">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🎯 Top {recCount} Recommendations for</span>
            <span className="text-netflix-red italic">"{selectedMovie?.title}"</span>
          </h3>
          <span className="text-xs text-neutral-500 font-mono">
            Cosine Similarity Ranked
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {Array.from({ length: recCount }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-md bg-neutral-900 animate-pulse border border-neutral-800" />
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {recommendations.map((rec) => (
              <MovieCard
                key={rec.id}
                movie={rec}
                matchPercentage={rec.matchPercentage}
                onOpenModal={onOpenModal}
                onRecommend={handleRecommendSelf}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-neutral-900/60 rounded-lg text-neutral-400">
            No similar recommendations found for this title.
          </div>
        )}
      </div>
    </div>
  );
}

