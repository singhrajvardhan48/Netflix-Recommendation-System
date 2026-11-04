"""
=============================================================================
B.Tech AIML Major Project: Netflix Movie Recommendation System
File: recommend.py
Description: Recommendation engine using Cosine Similarity on CountVectorizer
             features. Integrates dual API poster support (TMDB API & OMDb API)
             with 100% offline resilience and graceful fallback.
=============================================================================
"""

import os
import pickle
import requests
import pandas as pd
import numpy as np

# Path to local fallback poster
DEFAULT_POSTER_PATH = os.path.join("assets", "default_poster.png")

# Known public demo TMDB API key (from cloned reference repo)
DEFAULT_TMDB_API_KEY = "c7ec19ffdd3279641fb606d19ceb9bb1"


def load_model_artifacts(
    movie_list_path=os.path.join("models", "movie_list.pkl"),
    similarity_path=os.path.join("models", "similarity.pkl"),
    csv_path=os.path.join("data", "movies.csv")
):
    """
    Loads movie metadata DataFrame and similarity matrix.
    Loads pre-computed models if available, or automatically builds
    them on-the-fly from data/movies.csv.
    """
    movies_df = None
    similarity_matrix = None

    # 1. Load movies metadata
    if os.path.exists(movie_list_path):
        try:
            with open(movie_list_path, 'rb') as f:
                movies_df = pickle.load(f)
        except Exception:
            movies_df = None

    if movies_df is None and os.path.exists(csv_path):
        movies_df = pd.read_csv(csv_path)

    if movies_df is None:
        raise FileNotFoundError(f"Neither '{movie_list_path}' nor '{csv_path}' was found.")

    # 2. Load Similarity matrix
    if os.path.exists(similarity_path):
        try:
            with open(similarity_path, 'rb') as f:
                similarity_matrix = pickle.load(f)
        except Exception:
            similarity_matrix = None

    # 3. If similarity matrix not precomputed on disk, compute on-the-fly
    if similarity_matrix is None:
        from sklearn.feature_extraction.text import CountVectorizer
        from sklearn.metrics.pairwise import cosine_similarity

        tags = movies_df['tags'].fillna('')
        cv = CountVectorizer(max_features=5000, stop_words='english')
        vectors = cv.fit_transform(tags).toarray()
        similarity_matrix = cosine_similarity(vectors).astype(np.float16)

        try:
            os.makedirs(os.path.dirname(similarity_path), exist_ok=True)
            with open(similarity_path, 'wb') as f:
                pickle.dump(similarity_matrix, f)
        except Exception:
            pass

    return movies_df, similarity_matrix


def get_api_key(service_name="OMDB_API_KEY"):
    """
    Retrieves API key from environment variable, Streamlit secrets, or local secrets.toml.
    Returns None if not configured.
    """
    # 1. Environment variable
    env_val = os.environ.get(service_name)
    if env_val and env_val.strip():
        return env_val.strip()

    # 2. Streamlit secrets
    try:
        import streamlit as st
        if hasattr(st, "secrets") and service_name in st.secrets:
            return st.secrets[service_name].strip()
    except Exception:
        pass

    # 3. .streamlit/secrets.toml file directly
    secrets_file = os.path.join(".streamlit", "secrets.toml")
    if os.path.exists(secrets_file):
        try:
            with open(secrets_file, "r") as f:
                for line in f:
                    if line.strip().startswith(service_name):
                        parts = line.split("=")
                        if len(parts) >= 2:
                            val = parts[1].strip().strip('"').strip("'")
                            if val:
                                return val
        except Exception:
            pass

    return None


def fetch_poster_tmdb(movie_id, api_key=DEFAULT_TMDB_API_KEY):
    """
    Fetches official movie poster directly from TMDB API using movie_id.
    """
    if not api_key:
        return None
    try:
        url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={api_key}&language=en-US"
        response = requests.get(url, timeout=3.0)
        if response.status_code == 200:
            data = response.json()
            poster_path = data.get('poster_path')
            if poster_path:
                return f"https://image.tmdb.org/t/p/w500/{poster_path}"
    except Exception:
        pass
    return None


def fetch_movie_omdb(title, release_year=None, api_key=None):
    """
    Fetches real-time movie details and poster from the OMDb API.
    Includes robust timeout and error handling.
    """
    if not api_key:
        api_key = get_api_key("OMDB_API_KEY")

    if not api_key or api_key == "YOUR_OMDB_API_KEY_HERE":
        return None

    try:
        params = {'t': title, 'apikey': api_key}
        if release_year and str(release_year).isdigit():
            params['y'] = str(release_year)

        response = requests.get("https://www.omdbapi.com/", params=params, timeout=3.0)
        if response.status_code == 200:
            data = response.json()
            if data.get('Response') == 'True':
                return {
                    'poster': data.get('Poster') if data.get('Poster') != 'N/A' else None,
                    'year': data.get('Year', release_year),
                    'genre': data.get('Genre'),
                    'imdb_rating': data.get('imdbRating', 'N/A'),
                    'director': data.get('Director'),
                    'actors': data.get('Actors'),
                    'plot': data.get('Plot')
                }

        # Second try without year
        if 'y' in params:
            del params['y']
            response = requests.get("https://www.omdbapi.com/", params=params, timeout=3.0)
            if response.status_code == 200:
                data = response.json()
                if data.get('Response') == 'True':
                    return {
                        'poster': data.get('Poster') if data.get('Poster') != 'N/A' else None,
                        'year': data.get('Year', release_year),
                        'genre': data.get('Genre'),
                        'imdb_rating': data.get('imdbRating', 'N/A'),
                        'director': data.get('Director'),
                        'actors': data.get('Actors'),
                        'plot': data.get('Plot')
                    }
    except Exception:
        pass

    return None


def recommend(
    movie_title,
    movies_df,
    similarity_matrix,
    top_n=5,
    use_api=True,
    omdb_api_key=None,
    tmdb_api_key=DEFAULT_TMDB_API_KEY
):
    """
    Main Content-Based Recommendation function.
    
    Parameters:
    - movie_title (str): Title of the movie to recommend similar titles for.
    - movies_df (pd.DataFrame): Preprocessed movie DataFrame.
    - similarity_matrix (np.ndarray): Cosine similarity matrix.
    - top_n (int): Number of recommendations to return (default 5).
    - use_api (bool): Whether to fetch live posters.
    - omdb_api_key (str): Optional OMDb API key.
    - tmdb_api_key (str): Optional TMDB API key.
    
    Returns:
    - tuple: (list of recommendation dicts, matched_title)
    """
    # 1. Title lookup (case-insensitive)
    matches = movies_df[movies_df['title'].str.lower() == movie_title.strip().lower()]
    if matches.empty:
        matches = movies_df[movies_df['title'].str.lower().str.contains(movie_title.strip().lower(), regex=False)]
        if matches.empty:
            raise ValueError(f"Movie '{movie_title}' was not found in the database.")

    movie_idx = matches.index[0]
    matched_title = movies_df.iloc[movie_idx]['title']

    # 2. Retrieve similarity scores for the chosen movie
    similarity_scores = similarity_matrix[movie_idx]

    # 3. Sort movies by similarity score in descending order
    sorted_movies = sorted(list(enumerate(similarity_scores)), reverse=True, key=lambda x: x[1])

    # 4. Exclude the selected movie itself and take top_n
    top_recommendations = []
    
    for idx_tuple in sorted_movies[1:top_n + 1]:
        rec_idx = idx_tuple[0]
        rec_score = float(idx_tuple[1])
        row = movies_df.iloc[rec_idx]

        movie_info = {
            'movie_id': int(row['movie_id']),
            'title': str(row['title']),
            'similarity_score': round(rec_score, 4),
            'overview': str(row['overview']),
            'genres': str(row['display_genres']),
            'cast': str(row['display_cast']),
            'director': str(row['display_director']),
            'release_year': str(row['release_year']),
            'vote_average': float(row['vote_average']),
            'poster_url': None,
            'imdb_rating': f"{row['vote_average']:.1f}/10",
            'source': 'TMDB Dataset'
        }

        # 5. Live Poster Retrieval (TMDB priority, OMDb fallback)
        if use_api:
            # Try TMDB direct poster by movie_id
            poster = fetch_poster_tmdb(row['movie_id'], api_key=tmdb_api_key)
            if poster:
                movie_info['poster_url'] = poster
                movie_info['source'] = 'TMDB Live Poster'

            # If TMDB failed or user provided OMDb API key, enrich with OMDb
            if not movie_info['poster_url'] or omdb_api_key:
                omdb_data = fetch_movie_omdb(row['title'], release_year=row['release_year'], api_key=omdb_api_key)
                if omdb_data:
                    if omdb_data.get('poster') and not movie_info['poster_url']:
                        movie_info['poster_url'] = omdb_data['poster']
                    if omdb_data.get('imdb_rating') and omdb_data['imdb_rating'] != 'N/A':
                        movie_info['imdb_rating'] = f"{omdb_data['imdb_rating']}/10 (IMDb)"
                    if omdb_data.get('plot') and len(omdb_data['plot']) > 20:
                        movie_info['overview'] = omdb_data['plot']
                    movie_info['source'] = 'OMDb API'

        # Fallback to local default poster if API is offline or poster missing
        if not movie_info['poster_url']:
            movie_info['poster_url'] = DEFAULT_POSTER_PATH

        top_recommendations.append(movie_info)

    return top_recommendations, matched_title


if __name__ == '__main__':
    print("[INFO] Testing recommend.py...")
    movies_df, similarity = load_model_artifacts()
    test_movie = "Avatar"
    recs, matched = recommend(test_movie, movies_df, similarity, top_n=5, use_api=False)
    print(f"Top 5 Recommendations for '{matched}':")
    for i, r in enumerate(recs, 1):
        print(f"  {i}. {r['title']} ({r['release_year']}) - Score: {r['similarity_score']} - Dir: {r['director']}")
