'use client';

import React, { useRef } from 'react';
import { Movie } from '@/lib/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onOpenModal: (movie: Movie) => void;
  onRecommend: (movie: Movie) => void;
}

export default function MovieRow({
  title,
  movies,
  onOpenModal,
  onRecommend,
}: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="px-4 md:px-12 py-6 relative group">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-lg md:text-xl font-bold text-white tracking-wide">
          {title}
        </h3>
        <span className="text-xs text-neutral-500 font-mono">
          {movies.length} titles
        </span>
      </div>

      {/* Left Scroll Button */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-netflix-red text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl backdrop-blur-sm cursor-pointer"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Right Scroll Button */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-netflix-red text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl backdrop-blur-sm cursor-pointer"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Movies Carousel */}
      <div
        ref={rowRef}
        className="flex gap-3.5 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2"
      >
        {movies.map((movie) => (
          <div key={movie.id} className="min-w-[150px] sm:min-w-[180px] md:min-w-[210px] max-w-[210px] shrink-0">
            <MovieCard
              movie={movie}
              onOpenModal={onOpenModal}
              onRecommend={onRecommend}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

