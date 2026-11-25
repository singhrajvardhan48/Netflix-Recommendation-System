'use client';

import React, { useState, useEffect } from 'react';
import { Movie } from '@/lib/types';
import { X, Star, Calendar, Clapperboard, Users, Sparkles, Film } from 'lucide-react';

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
  onRecommend: (movie: Movie) => void;
}

export default function MovieModal({ movie, onClose, onRecommend }: MovieModalProps) {
  const [posterUrl, setPosterUrl] = useState<string>('/default_poster.png');
  const [backdropUrl, setBackdropUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!movie) return;

    if (movie.poster_url) setPosterUrl(movie.poster_url);
    else setPosterUrl('/default_poster.png');

    if (movie.backdrop_url) setBackdropUrl(movie.backdrop_url);
    else setBackdropUrl(null);

    let isMounted = true;
    if (!movie.poster_url || !movie.backdrop_url) {
      fetch(`/api/poster/${movie.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (isMounted) {
            if (data.poster && !movie.poster_url) setPosterUrl(data.poster);
            if (data.backdrop && !movie.backdrop_url) setBackdropUrl(data.backdrop);
          }
        })
        .catch(() => {});
    }

    // Escape key listener to close
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [movie, onClose]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-neutral-900 border border-neutral-700/80 rounded-xl shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-black/60 hover:bg-neutral-800 text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Backdrop Banner Header */}
        <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-black">
          {backdropUrl ? (
            <img
              src={backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-neutral-900 via-neutral-800 to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />

          {/* Title on Backdrop */}
          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow-md">
              {movie.title}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            {/* Poster Thumbnail */}
            <div className="w-32 shrink-0 aspect-[2/3] rounded-lg overflow-hidden bg-black shadow-lg border border-neutral-800 hidden sm:block">
              <img
                src={posterUrl}
                alt={movie.title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/default_poster.png';
                }}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {movie.rating > 0 ? `${movie.rating} / 10 (TMDB)` : 'NR'}
                </span>
                {movie.year && (
                  <span className="flex items-center gap-1 text-xs text-neutral-300 bg-neutral-800 px-2.5 py-0.5 rounded">
                    <Calendar className="w-3 h-3" />
                    {movie.year}
                  </span>
                )}
                <span className="text-xs bg-netflix-red/20 text-netflix-red font-semibold px-2.5 py-0.5 rounded border border-netflix-red/30">
                  TMDB ID: {movie.id}
                </span>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {movie.genres.map((g) => (
                  <span key={g} className="text-xs bg-neutral-800 text-neutral-300 px-2.5 py-0.5 rounded-full border border-neutral-700/60">
                    {g}
                  </span>
                ))}
              </div>

              {/* Director & Cast */}
              <div className="space-y-1.5 text-xs sm:text-sm text-neutral-300 mb-4">
                {movie.director && (
                  <div className="flex items-start gap-2">
                    <Clapperboard className="w-4 h-4 text-netflix-red shrink-0 mt-0.5" />
                    <span><strong className="text-white">Director:</strong> {movie.director}</span>
                  </div>
                )}
                {movie.cast && movie.cast.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-netflix-red shrink-0 mt-0.5" />
                    <span><strong className="text-white">Cast:</strong> {movie.cast.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Plot Synopsis */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Synopsis
                </h4>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {movie.overview || 'No synopsis available for this title.'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
            <button
              onClick={() => {
                onClose();
                onRecommend(movie);
              }}
              className="btn-netflix font-bold text-sm px-5 py-2.5 rounded-md flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              Find Similar Movies
            </button>
            <button
              onClick={onClose}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-sm px-4 py-2.5 rounded-md transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

