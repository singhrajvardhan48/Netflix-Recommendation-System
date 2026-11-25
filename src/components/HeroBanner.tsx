'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Movie } from '@/lib/types';
import { FEATURED_MOVIES } from '@/lib/featuredMovies';
import {
  Sparkles,
  Info,
  Star,
  Calendar,
  Clapperboard,
  ChevronLeft,
  ChevronRight,
  Film,
} from 'lucide-react';

interface HeroBannerProps {
  movie?: Movie;
  movies?: Movie[];
  onMoreInfo: (movie: Movie) => void;
  onRecommend: (movie: Movie) => void;
}

export default function HeroBanner({
  movie,
  movies,
  onMoreInfo,
  onRecommend,
}: HeroBannerProps) {
  // Use provided movies or fallback to the 15 curated featured movies (starts with Inception)
  const playlist: Movie[] =
    movies && movies.length > 0
      ? movies
      : FEATURED_MOVIES;

  const [currentIndex, setCurrentIndex] = useState(0);

  const currentMovie: Movie = playlist[currentIndex] || playlist[0];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
  }, [playlist.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  }, [playlist.length]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
  };

  // 5-second automatic movie rotation (runs silently in the background without timer bar)
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [nextSlide]);

  // Preload all 15 movie posters & backdrops into browser cache
  useEffect(() => {
    playlist.forEach((m) => {
      if (m.backdrop_url) {
        const img = new Image();
        img.src = m.backdrop_url;
      }
      if (m.poster_url) {
        const img = new Image();
        img.src = m.poster_url;
      }
    });
  }, [playlist]);

  const backdropImage =
    currentMovie.backdrop_url ||
    currentMovie.poster_url ||
    'https://images.unsplash.com/photo-1574267432553-4b4628081c31?q=80&w=2000&auto=format&fit=crop';

  const posterImage = currentMovie.poster_url || '/default_poster.png';

  return (
    <div
      id="home"
      className="relative w-full min-h-[640px] md:min-h-[720px] lg:h-[84vh] max-h-[880px] flex items-center overflow-hidden select-none"
    >
      {/* 1. Full-screen Cinematic Backdrop */}
      <div
        key={`backdrop-${currentMovie.id}`}
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${backdropImage})` }}
      >
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 hero-vignette" />
        <div className="absolute inset-0 hero-vignette-bottom" />
      </div>

      {/* 2. Movie Poster Directly Behind the Text (Ambient / Visual Watermark) */}
      <div
        key={`poster-behind-${currentMovie.id}`}
        className="absolute left-0 top-0 bottom-0 w-full sm:w-3/4 md:w-3/5 lg:w-1/2 pointer-events-none opacity-30 md:opacity-25 transition-opacity duration-1000 overflow-hidden"
      >
        <div
          className="w-full h-full bg-no-repeat bg-left-top bg-cover filter blur-[2px] scale-105"
          style={{ backgroundImage: `url(${posterImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-[#141414]/80" />
      </div>

      {/* 3. Foreground Content: Two Column Layout */}
      <div className="relative z-10 w-full px-4 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 mt-12 md:mt-8">

        {/* Left Column: Movie Information & Controls */}
        <div key={`info-${currentMovie.id}`} className="w-full md:max-w-2xl lg:max-w-3xl animate-fade-in">

          {/* Header Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-netflix-red text-white text-xs font-black px-2.5 py-0.5 rounded uppercase tracking-wider shadow">
              FEATURED FILM
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300 bg-neutral-900/90 border border-neutral-700/80 px-2.5 py-0.5 rounded">
              <Film className="w-3.5 h-3.5 text-neutral-400" />
              <span>{currentIndex + 1} of {playlist.length}</span>
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {currentMovie.rating > 0 ? `${currentMovie.rating} / 10` : 'Top Rated'}
            </span>
            {currentMovie.year && (
              <span className="flex items-center gap-1 text-xs text-neutral-300 bg-neutral-900/80 border border-neutral-800 px-2 py-0.5 rounded">
                <Calendar className="w-3 h-3 text-neutral-400" />
                {currentMovie.year}
              </span>
            )}
            {currentMovie.director && (
              <span className="hidden sm:flex items-center gap-1 text-xs text-neutral-300 bg-neutral-900/80 border border-neutral-800 px-2 py-0.5 rounded">
                <Clapperboard className="w-3 h-3 text-neutral-400" />
                {currentMovie.director}
              </span>
            )}
          </div>

          {/* Movie Title (Clickable -> Opens Description Modal) */}
          <h1
            onClick={() => onMoreInfo(currentMovie)}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-3 drop-shadow-2xl cursor-pointer hover:text-neutral-200 transition-colors"
            title="Click to view details"
          >
            {currentMovie.title}
          </h1>

          {/* Genres Chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {currentMovie.genres.slice(0, 4).map((g) => (
              <span
                key={g}
                className="text-xs bg-neutral-900/90 text-neutral-300 px-2.5 py-0.5 rounded-full border border-neutral-700/80 font-medium"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Cast */}
          {currentMovie.cast && currentMovie.cast.length > 0 && (
            <p className="text-xs text-neutral-400 mb-3">
              <span className="text-neutral-500 font-medium">Starring:</span>{' '}
              <span className="text-neutral-300">{currentMovie.cast.slice(0, 3).join(', ')}</span>
            </p>
          )}

          {/* Synopsis / Description (Clickable -> Opens Description Modal) */}
          <p
            onClick={() => onMoreInfo(currentMovie)}
            className="text-sm md:text-base text-neutral-200 line-clamp-3 sm:line-clamp-4 mb-6 max-w-2xl drop-shadow-md leading-relaxed cursor-pointer hover:text-white transition-colors"
            title="Click to view details"
          >
            {currentMovie.overview}
          </p>

          {/* Action & Rotation Controls Row */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onRecommend(currentMovie)}
              className="btn-netflix font-bold text-sm md:text-base px-6 py-2.5 rounded-md flex items-center gap-2 shadow-lg shadow-netflix-red/30 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Recommend Similar
            </button>
            <button
              onClick={() => onMoreInfo(currentMovie)}
              className="bg-neutral-900/90 hover:bg-neutral-800 text-white font-semibold text-sm md:text-base px-5 py-2.5 rounded-md flex items-center gap-2 border border-neutral-700 transition cursor-pointer backdrop-blur-sm"
            >
              <Info className="w-4 h-4 text-neutral-300" />
              Details & Cast
            </button>

            {/* Quick Next / Prev Arrows */}
            <div className="flex items-center gap-1.5 ml-auto sm:ml-2 bg-neutral-900/80 border border-neutral-800 rounded-md p-1 backdrop-blur-sm">
              <button
                onClick={prevSlide}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition cursor-pointer"
                title="Previous Movie"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition cursor-pointer"
                title="Next Movie"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Prominent High-Resolution Movie Poster Showcase (Clickable -> Opens Description Modal) */}
        <div className="hidden md:flex flex-col items-center justify-center shrink-0">
          <div
            onClick={() => onMoreInfo(currentMovie)}
            className="group relative w-56 lg:w-64 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shadow-black/90 border-2 border-neutral-700/80 hover:border-netflix-red transition-all duration-500 hover:scale-105 cursor-pointer bg-neutral-900"
            title={`Click to view ${currentMovie.title} details`}
          >
            <img
              src={posterImage}
              alt={currentMovie.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Poster Corner Badges */}
            <div className="absolute top-2.5 right-2.5 bg-netflix-red text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
              #{currentIndex + 1}
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 pt-6 flex flex-col justify-end">
              <span className="text-[11px] font-bold text-white line-clamp-1">{currentMovie.title}</span>
              <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                ⭐ {currentMovie.rating}/10 • {currentMovie.year}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Navigation Dots */}
      <div className="absolute bottom-4 inset-x-0 z-20 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center justify-center sm:justify-start gap-1.5 overflow-x-auto py-1 no-scrollbar">
          {playlist.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => goToSlide(idx)}
              title={`${idx + 1}. ${m.title} (${m.year})`}
              className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${idx === currentIndex
                  ? 'w-7 bg-netflix-red shadow-lg shadow-netflix-red/50'
                  : 'w-2 bg-neutral-600/60 hover:bg-neutral-400'
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
