'use client';

import React, { useState, useEffect } from 'react';
import { Movie } from '@/lib/types';
import { FEATURED_MOVIES } from '@/lib/featuredMovies';
import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import SearchSection from '@/components/SearchSection';
import RecommendationEngine from '@/components/RecommendationEngine';
import MovieRow from '@/components/MovieRow';
import MovieModal from '@/components/MovieModal';

export default function HomePage() {
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(FEATURED_MOVIES[0]);
  const [collections, setCollections] = useState<{ title: string; movies: Movie[] }[]>([]);
  const [selectedMovieForModal, setSelectedMovieForModal] = useState<Movie | null>(null);
  const [selectedMovieForRecs, setSelectedMovieForRecs] = useState<Movie | null>(null);
  const [initialSearchQuery, setInitialSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial movies and curated collections
    fetch('/api/movies?limit=250&sortBy=popularity')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const moviesList: Movie[] = data.data;
          setAllMovies(moviesList);

          // Find a great featured movie (Inception or Avatar or Interstellar)
          const featured =
            moviesList.find((m) => m.title.toLowerCase() === 'inception') ||
            moviesList.find((m) => m.title.toLowerCase() === 'avatar') ||
            moviesList[0];
          setFeaturedMovie(featured);

          // Build curated carousels
          const trending = [...moviesList].slice(0, 15);
          const topRated = [...moviesList]
            .filter((m) => m.rating >= 7.5)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 15);
          const nolan = moviesList.filter((m) =>
            m.director.toLowerCase().includes('christopher nolan')
          );
          const dicaprio = moviesList.filter((m) =>
            m.cast.some((c) => c.toLowerCase().includes('leonardo dicaprio'))
          );
          const sciFi = moviesList
            .filter((m) => m.genres.some((g) => g.toLowerCase().includes('science fiction')))
            .slice(0, 15);
          const action = moviesList
            .filter((m) => m.genres.some((g) => g.toLowerCase().includes('action')))
            .slice(0, 15);

          setCollections([
            { title: '🔥 Trending Blockbusters', movies: trending },
            { title: '⭐ Critically Acclaimed Masterpieces', movies: topRated },
            { title: '🎬 Directed by Christopher Nolan', movies: nolan },
            { title: '🌟 Starring Leonardo DiCaprio', movies: dicaprio },
            { title: '🚀 Sci-Fi & Time Travel', movies: sciFi },
            { title: '💥 High Octane Action', movies: action },
          ]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleRecommendMovie = (movie: Movie) => {
    setSelectedMovieForRecs(movie);
    const recSection = document.getElementById('recommendations');
    if (recSection) {
      recSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearchClick = () => {
    const searchSection = document.getElementById('search');
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth' });
      const input = searchSection.querySelector('input');
      if (input) input.focus();
    }
  };

  const handleRecsClick = () => {
    const recSection = document.getElementById('recommendations');
    if (recSection) {
      recSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-netflix-black text-white flex flex-col">
      {/* Navigation Bar */}
      <Navbar onSearchClick={handleSearchClick} onRecsClick={handleRecsClick} />

      {/* Hero Showcase Banner (Cycles 15 iconic films with posters every 5 seconds) */}
      <HeroBanner
        movies={FEATURED_MOVIES}
        onMoreInfo={(m) => setSelectedMovieForModal(m)}
        onRecommend={handleRecommendMovie}
      />

      {/* Multi-Field Search Section */}
      <SearchSection
        onSelectMovie={handleRecommendMovie}
        onOpenModal={(m) => setSelectedMovieForModal(m)}
        initialQuery={initialSearchQuery}
      />

      {/* AI Recommendation Engine Section */}
      {allMovies.length > 0 && (
        <RecommendationEngine
          initialMovie={selectedMovieForRecs || featuredMovie || undefined}
          allMovies={allMovies}
          onOpenModal={(m) => setSelectedMovieForModal(m)}
        />
      )}

      {/* Curated Movies Carousels */}
      <div id="trending" className="pb-16 space-y-2">
        {collections.map((col) => (
          <MovieRow
            key={col.title}
            title={col.title}
            movies={col.movies}
            onOpenModal={(m) => setSelectedMovieForModal(m)}
            onRecommend={handleRecommendMovie}
          />
        ))}
      </div>

      {/* Movie Details Modal */}
      <MovieModal
        movie={selectedMovieForModal}
        onClose={() => setSelectedMovieForModal(null)}
        onRecommend={handleRecommendMovie}
      />

      {/* Netflix Footer */}
      <footer className="mt-auto border-t border-neutral-800/80 bg-neutral-950 px-4 md:px-12 py-10 text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-netflix-red font-black tracking-wider text-lg">NETFLIX</span>
            <span>AIML Movie Recommendation System</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/singhrajvardhan48/Netflix-Recommendation-System"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              GitHub Repository
            </a>
            <span>Deployable on Vercel</span>
            <span>NLP & Cosine Similarity</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

