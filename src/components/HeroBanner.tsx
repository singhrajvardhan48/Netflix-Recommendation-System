'use client';

import React from 'react';
import { Movie } from '@/lib/types';
import { Sparkles, Info, Star, Calendar, Clapperboard } from 'lucide-react';

interface HeroBannerProps {
  movie: Movie;
  onMoreInfo: (movie: Movie) => void;
  onRecommend: (movie: Movie) => void;
}

export default function HeroBanner({ movie, onMoreInfo, onRecommend }: HeroBannerProps) {
  // Use high quality backdrop fallback or TMDB backdrop
  const backdropImage =
    movie.backdrop_url ||
    'https://images.unsplash.com/photo-1574267432553-4b4628081c31?q=80&w=2000&auto=format&fit=crop';

  return (
    <div id="home" className="relative w-full h-[78vh] min-h-[550px] max-h-[820px] flex items-center">
      {/* Background Image & Overlays */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${backdropImage})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 hero-vignette" />
        <div className="absolute inset-0 hero-vignette-bottom" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 md:px-12 max-w-3xl mt-16">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2.5 mb-3">
          <span className="bg-netflix-red text-white text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
            FEATURED FILM
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {movie.rating > 0 ? `${movie.rating} / 10` : 'Top Rated'}
          </span>
          {movie.year && (
            <span className="flex items-center gap-1 text-xs text-neutral-300 bg-neutral-800/80 px-2 py-0.5 rounded">
              <Calendar className="w-3 h-3 text-neutral-400" />
              {movie.year}
            </span>
          )}
          {movie.director && (
            <span className="flex items-center gap-1 text-xs text-neutral-300 bg-neutral-800/80 px-2 py-0.5 rounded">
              <Clapperboard className="w-3 h-3 text-neutral-400" />
              {movie.director}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-4 drop-shadow-xl font-sans">
          {movie.title}
        </h1>

        {/* Genres */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {movie.genres.slice(0, 4).map((g) => (
            <span
              key={g}
              className="text-xs bg-neutral-900/80 text-neutral-300 px-2.5 py-0.5 rounded-full border border-neutral-700/60"
            >
              {g}
            </span>
          ))}
        </div>

        {/* Synopsis */}
        <p className="text-sm md:text-base text-neutral-300 line-clamp-3 mb-6 max-w-2xl drop-shadow leading-relaxed">
          {movie.overview}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onRecommend(movie)}
            className="btn-netflix font-bold text-sm md:text-base px-6 py-2.5 rounded-md flex items-center gap-2 shadow-lg shadow-netflix-red/30 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Recommend Similar
          </button>
          <button
            onClick={() => onMoreInfo(movie)}
            className="bg-neutral-800/90 hover:bg-neutral-700 text-white font-semibold text-sm md:text-base px-5 py-2.5 rounded-md flex items-center gap-2 border border-neutral-600 transition cursor-pointer backdrop-blur-sm"
          >
            <Info className="w-4 h-4 text-neutral-300" />
            Details & Cast
          </button>
        </div>
      </div>
    </div>
  );
}

