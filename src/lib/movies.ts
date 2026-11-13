import fs from 'fs';
import path from 'path';
import { Movie, RecommendationItem, SearchResponse } from './types';

// In-memory cache for ultra-fast sub-millisecond retrieval
let cachedMovies: Movie[] | null = null;
let cachedMovieMap: Map<number, Movie> | null = null;
let cachedTitleMap: Map<string, Movie> | null = null;
let cachedRecs: Record<string, { id: number; title: string; score: number }[]> | null = null;

export function loadData() {
  if (cachedMovies && cachedMovieMap && cachedTitleMap && cachedRecs) {
    return {
      movies: cachedMovies,
      movieMap: cachedMovieMap,
      titleMap: cachedTitleMap,
      recs: cachedRecs,
    };
  }

  const moviesPath = path.join(process.cwd(), 'data', 'movies.json');
  const recsPath = path.join(process.cwd(), 'data', 'recommendations.json');

  const rawMovies = fs.readFileSync(moviesPath, 'utf-8');
  const rawRecs = fs.readFileSync(recsPath, 'utf-8');

  cachedMovies = JSON.parse(rawMovies) as Movie[];
  cachedRecs = JSON.parse(rawRecs);

  cachedMovieMap = new Map<number, Movie>();
  cachedTitleMap = new Map<string, Movie>();

  for (const movie of cachedMovies) {
    cachedMovieMap.set(movie.id, movie);
    cachedTitleMap.set(movie.title.toLowerCase().trim(), movie);
  }

  return {
    movies: cachedMovies,
    movieMap: cachedMovieMap,
    titleMap: cachedTitleMap,
    recs: cachedRecs,
  };
}

export function getAllMovies(): Movie[] {
  const { movies } = loadData();
  return movies;
}

export function getMovieById(id: number): Movie | undefined {
  const { movieMap } = loadData();
  return movieMap.get(id);
}

export function getMovieByTitle(title: string): Movie | undefined {
  const { titleMap, movies } = loadData();
  const clean = title.toLowerCase().trim();
  const direct = titleMap.get(clean);
  if (direct) return direct;

  // Substring match
  return movies.find((m) => m.title.toLowerCase().includes(clean));
}

export function getRecommendations(
  movieIdOrTitle: string | number,
  limit: number = 10
): { targetMovie: Movie; recommendations: (RecommendationItem & { movie: Movie })[] } | null {
  const { movieMap, titleMap, recs } = loadData();

  let target: Movie | undefined;
  if (typeof movieIdOrTitle === 'number' || !isNaN(Number(movieIdOrTitle))) {
    target = movieMap.get(Number(movieIdOrTitle));
  } else {
    target = titleMap.get(String(movieIdOrTitle).toLowerCase().trim());
  }

  if (!target) return null;

  const rawList = (recs && recs[String(target.id)]) || [];
  const enriched = rawList
    .map((item) => {
      const full = movieMap.get(item.id);
      if (!full) return null;
      return {
        ...item,
        movie: full,
      };
    })
    .filter((item): item is RecommendationItem & { movie: Movie } => item !== null)
    .slice(0, limit);

  return {
    targetMovie: target,
    recommendations: enriched,
  };
}

export function searchCatalog(query: string, limit: number = 50): SearchResponse {
  const { movies } = loadData();
  if (!query || !query.trim()) {
    return {
      query: '',
      category: 'all',
      total: movies.length,
      results: movies.slice(0, limit),
    };
  }

  const q = query.trim().toLowerCase();
  const qCollapsed = q.replace(/\s+/g, '');

  let dirHits = 0;
  let castHits = 0;
  let genreHits = 0;
  let titleHits = 0;
  let contentHits = 0;

  const scored: { movie: Movie; score: number }[] = [];

  for (const m of movies) {
    const titleLower = m.title.toLowerCase();
    const dirLower = m.director.toLowerCase();
    const castLower = m.cast.map((c) => c.toLowerCase()).join(' ');
    const genresLower = m.genres.map((g) => g.toLowerCase()).join(' ');
    const overviewLower = m.overview.toLowerCase();

    let score = 0;

    const isTitleExact = titleLower === q;
    const isTitleStart = titleLower.startsWith(q);
    const isTitleContains = titleLower.includes(q);

    const isDirMatch = dirLower.includes(q);
    const isCastMatch = castLower.includes(q);
    const isGenreMatch = genresLower.includes(q);
    const isContentMatch = overviewLower.includes(q) || overviewLower.includes(qCollapsed);

    if (isDirMatch) dirHits++;
    if (isCastMatch) castHits++;
    if (isGenreMatch) genreHits++;
    if (isTitleContains) titleHits++;
    if (isContentMatch) contentHits++;

    if (isTitleExact) score += 120;
    else if (isTitleStart) score += 70;
    else if (isTitleContains) score += 60;

    if (isDirMatch) score += 90;
    if (isCastMatch) score += 80;
    if (isGenreMatch) score += 40;
    if (isContentMatch) score += 25;

    if (score > 0) {
      // Add slight popularity / rating tie-breakers
      const boost = (m.popularity * 0.05) + (m.rating * 0.5);
      scored.push({ movie: m, score: score + boost });
    }
  }

  // Determine category
  let category: SearchResponse['category'] = 'Keyword';
  if (dirHits > 0 && dirHits >= castHits && dirHits >= contentHits) {
    category = 'Director';
  } else if (castHits > 0 && castHits >= dirHits && castHits >= contentHits) {
    category = 'Lead Actor / Cast';
  } else if (genreHits > 0 && genreHits >= dirHits && genreHits >= castHits) {
    category = 'Genre';
  } else if (titleHits > 0 && titleHits >= dirHits && titleHits >= castHits) {
    category = 'Movie Title';
  } else if (contentHits > 0) {
    category = 'Theme / Plot Content';
  }

  if (scored.length === 0) {
    return {
      query,
      category: 'none',
      total: 0,
      results: [],
    };
  }

  scored.sort((a, b) => b.score - a.score);
  const results = scored.slice(0, limit).map((s) => s.movie);

  return {
    query,
    category,
    total: scored.length,
    results,
  };
}

export function getCuratedCollections() {
  const { movies } = loadData();

  // Top trending by popularity
  const trending = [...movies]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 15);

  // Top rated (with at least 50 popularity to ensure recognizable quality)
  const topRated = [...movies]
    .filter((m) => m.popularity > 20)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 15);

  // Christopher Nolan row
  const nolan = movies
    .filter((m) => m.director.toLowerCase().includes('christopher nolan'))
    .sort((a, b) => b.rating - a.rating);

  // Leonardo DiCaprio row
  const dicaprio = movies
    .filter((m) => m.cast.some((c) => c.toLowerCase().includes('leonardo dicaprio')))
    .sort((a, b) => b.rating - a.rating);

  // Sci-Fi
  const sciFi = movies
    .filter((m) => m.genres.some((g) => g.toLowerCase().includes('science fiction') || g.toLowerCase().includes('sci-fi')))
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 15);

  // Action
  const action = movies
    .filter((m) => m.genres.some((g) => g.toLowerCase().includes('action')))
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 15);

  return [
    { title: '🔥 Trending Now', movies: trending },
    { title: '⭐ Top Rated Masterpieces', movies: topRated },
    { title: '🎬 Directed by Christopher Nolan', movies: nolan },
    { title: '🌟 Starring Leonardo DiCaprio', movies: dicaprio },
    { title: '🚀 Sci-Fi & Mind Benders', movies: sciFi },
    { title: '💥 High Octane Action', movies: action },
  ];
}

