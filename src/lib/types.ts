export interface Movie {
  id: number;
  title: string;
  overview: string;
  genres: string[];
  director: string;
  cast: string[];
  year: string;
  rating: number;
  popularity: number;
  poster_url?: string;
  backdrop_url?: string;
}

export interface RecommendationItem {
  id: number;
  title: string;
  score: number;
  movie?: Movie;
}

export interface SearchResponse {
  query: string;
  category: "Director" | "Lead Actor / Cast" | "Genre" | "Movie Title" | "Theme / Plot Content" | "Keyword" | "none" | "all";
  total: number;
  results: Movie[];
}

