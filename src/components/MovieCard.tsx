'use client';

import React, { useState, useEffect } from 'react';
import { Movie } from '@/lib/types';
import { Star, Sparkles, Info, Calendar } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  onOpenModal: (movie: Movie) => void;
  onRecommend: (movie: Movie) => void;
  matchPercentage?: number;
}

export default function MovieCard({
  movie,
  onOpenModal,
  onRecommend,
  matchPercentage,
}: MovieCardProps) {
  const [posterUrl, setPosterUrl] = useState<string>(
    movie.poster_url || '/default_poster.png'
  );
  const [loadingPoster, setLoadingPoster] = useState(!movie.poster_url);

  useEffect(() => {
    if (movie.poster_url) {
      setPosterUrl(movie.poster_url);
      setLoadingPoster(false);
      return;
    }

    let isMounted = true;
    fetch(`/api/poster/${movie.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (data.poster) {
            setPosterUrl(data.poster);
          } else {
            setPosterUrl('/default_poster.png');
          }
          setLoadingPoster(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPosterUrl('/default_poster.png');
          setLoadingPoster(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [movie.id, movie.poster_url]);

  return (
    <div className="group relative rounded-md overflow-hidden bg-neutral-900 border border-neutral-800 movie-card-hover flex flex-col justify-between h-full">
      {/* Poster Image Container */}
      <div
        className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-950 cursor-pointer"
        onClick={() => onOpenModal(movie)}
      >
        <img
          src={posterUrl}
          alt={movie.title}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/default_poster.png';
          }}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            loadingPoster ? 'opacity-40 blur-sm' : 'opacity-100'
          }`}
        />

        {/* Match Percentage Chip if in Recommender Grid */}
        {matchPercentage !== undefined && (
          <div className="absolute top-2 right-2 bg-netflix-red text-white text-[11px] font-extrabold px-2 py-0.5 rounded shadow-lg">
            {matchPercentage}% Match
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/80 backdrop-blur-sm text-amber-400 text-xs font-bold px-2 py-0.5 rounded">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          {movie.rating > 0 ? movie.rating.toFixed(1) : 'NR'}
        </div>
      </div>

      {/* Card Info & Quick Actions */}
      <div className="p-3 flex flex-col justify-between flex-grow">
        <div>
          <h4
            onClick={() => onOpenModal(movie)}
            className="font-bold text-sm text-white line-clamp-1 group-hover:text-netflix-red transition-colors cursor-pointer mb-1"
            title={movie.title}
          >
            {movie.title}
          </h4>

          <div className="flex items-center gap-2 text-[11px] text-neutral-400 mb-2">
            {movie.year && (
              <span className="flex items-center gap-0.5">
                <Calendar className="w-2.5 h-2.5" />
                {movie.year}
              </span>
            )}
            {movie.genres[0] && (
              <span className="bg-neutral-800 text-neutral-300 px-1.5 py-0.2 rounded text-[10px]">
                {movie.genres[0]}
              </span>
            )}
          </div>

          {movie.director && (
            <p className="text-[11px] text-neutral-400 line-clamp-1 mb-2">
              <span className="text-neutral-500">Dir:</span> {movie.director}
            </p>
          )}
        </div>

        {/* Hover Action Buttons */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-800/80 mt-1">
          <button
            onClick={() => onRecommend(movie)}
            className="flex-1 bg-netflix-red/90 hover:bg-netflix-red text-white text-xs font-semibold py-1.5 px-2 rounded flex items-center justify-center gap-1 transition"
            title="Generate AI recommendations based on this movie"
          >
            <Sparkles className="w-3 h-3" />
            <span>Similar</span>
          </button>
          <button
            onClick={() => onOpenModal(movie)}
            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white p-1.5 rounded transition"
            title="View details"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

