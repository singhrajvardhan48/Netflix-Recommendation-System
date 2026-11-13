"""
Prepares optimized JSON data for the Next.js / full-stack deployment on Vercel.
Generates:
1. data/movies.json (Catalog metadata of 4,797 movies)
2. data/recommendations.json (Precalculated Cosine Similarity recommendations for every title)
"""

import os
import json
import time
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def generate():
    t0 = time.time()
    csv_path = os.path.join("data", "movies.csv")
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Missing {csv_path}")

    print("[1/3] Loading movies dataset...")
    df = pd.read_csv(csv_path)
    df['tags'] = df['tags'].fillna('')
    total_movies = len(df)
    print(f"       Loaded {total_movies} movies.")

    print("[2/3] Vectorizing tags and computing Cosine Similarity...")
    cv = CountVectorizer(max_features=5000, stop_words='english')
    vectors = cv.fit_transform(df['tags']).toarray()
    similarity = cosine_similarity(vectors).astype(np.float16)

    print("[3/3] Building JSON structures...")
    movies_list = []
    rec_map = {}

    for i in range(total_movies):
        row = df.iloc[i]
        m_id = int(row['movie_id'])
        title = str(row['title'])
        genres = [g.strip() for g in str(row['display_genres']).split(',') if g.strip() and g.strip() != 'N/A']
        cast = [c.strip() for c in str(row['display_cast']).split(',') if c.strip() and c.strip() != 'N/A']
        director = str(row['display_director']) if str(row['display_director']) != 'Unknown' else ''
        year = str(row['release_year']) if str(row['release_year']) != 'Unknown' else ''
        rating = round(float(row['vote_average']), 1) if pd.notna(row['vote_average']) else 0.0
        popularity = round(float(row['popularity']), 1) if pd.notna(row['popularity']) else 0.0
        overview = str(row['overview']) if pd.notna(row['overview']) else ''

        movies_list.append({
            'id': m_id,
            'title': title,
            'overview': overview,
            'genres': genres,
            'director': director,
            'cast': cast,
            'year': year,
            'rating': rating,
            'popularity': popularity
        })

        # Calculate top 12 recommendations
        sim_scores = similarity[i]
        top_indices = sim_scores.argsort()[::-1][1:13] # skip self
        recs = []
        for idx in top_indices:
            rec_row = df.iloc[idx]
            recs.append({
                'id': int(rec_row['movie_id']),
                'title': str(rec_row['title']),
                'score': round(float(sim_scores[idx]), 3)
            })
        rec_map[m_id] = recs

    os.makedirs('data', exist_ok=True)
    movies_file = os.path.join('data', 'movies.json')
    recs_file = os.path.join('data', 'recommendations.json')

    with open(movies_file, 'w', encoding='utf-8') as f:
        json.dump(movies_list, f, separators=(',', ':'))

    with open(recs_file, 'w', encoding='utf-8') as f:
        json.dump(rec_map, f, separators=(',', ':'))

    movies_size = os.path.getsize(movies_file) / (1024 * 1024)
    recs_size = os.path.getsize(recs_file) / (1024 * 1024)
    print(f"[SUCCESS] Generated in {time.time() - t0:.1f}s:")
    print(f"          - {movies_file} ({movies_size:.2f} MB)")
    print(f"          - {recs_file} ({recs_size:.2f} MB)")

if __name__ == '__main__':
    generate()

