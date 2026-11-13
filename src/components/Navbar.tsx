'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Sparkles, Film } from 'lucide-react';

interface NavbarProps {
  onSearchClick?: () => void;
  onRecsClick?: () => void;
}

export default function Navbar({ onSearchClick, onRecsClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-12 py-3.5 flex items-center justify-between ${
        scrolled ? 'bg-netflix-black/95 backdrop-blur-md shadow-lg shadow-black/50 border-b border-neutral-800/60' : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
      }`}
    >
      {/* Left: Brand Logo & Links */}
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-netflix-red font-black text-2.5xl md:text-3xl tracking-wider uppercase font-sans select-none drop-shadow-md group-hover:scale-105 transition-transform">
            NETFLIX
          </span>
          <span className="hidden sm:inline-block bg-netflix-red/20 text-netflix-red text-xs px-2 py-0.5 rounded font-semibold tracking-wide border border-netflix-red/30">
            AI RECOMMENDER
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-300">
          <a href="#home" className="hover:text-white transition-colors">Home</a>
          <a href="#recommendations" onClick={onRecsClick} className="hover:text-netflix-red flex items-center gap-1.5 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-netflix-red" />
            AI Recommender
          </a>
          <a href="#search" onClick={onSearchClick} className="hover:text-white transition-colors">Discover & Search</a>
          <a href="#trending" className="hover:text-white transition-colors">Trending</a>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs md:text-sm px-3.5 py-1.5 rounded-full border border-neutral-700/60 transition-all"
        >
          <Search className="w-4 h-4 text-netflix-red" />
          <span className="hidden md:inline">Search Director, Actor, Title...</span>
        </button>

        <a
          href="https://github.com/singhrajvardhan48/Netflix-Recommendation-System"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-400 hover:text-white transition-colors p-1.5 hover:bg-neutral-800 rounded-full"
          title="View GitHub Repository"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>

        <div className="w-8 h-8 rounded bg-gradient-to-tr from-netflix-red to-rose-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
          AIML
        </div>
      </div>
    </nav>
  );
}

