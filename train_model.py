"""
=============================================================================
Netflix Movie Recommendation System - Model Training Script
Description: Fits CountVectorizer on movie tags and generates Cosine
             Similarity matrix, saving artifacts to models/ directory.
=============================================================================
"""

import os
import pickle
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def train_model(
    csv_path=os.path.join("data", "movies.csv"),
    models_dir="models",
    max_features=5000
):
    print(f"[INFO] Loading dataset from {csv_path}...")
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}")

    df = pd.read_csv(csv_path)
    df["tags"] = df["tags"].fillna("")
    print(f"[INFO] Loaded {len(df)} movies.")

    print(f"[INFO] Vectorizing tags with CountVectorizer (max_features={max_features})...")
    cv = CountVectorizer(max_features=max_features, stop_words="english")
    vectors = cv.fit_transform(df["tags"]).toarray()

    print("[INFO] Computing pairwise Cosine Similarity matrix...")
    similarity = cosine_similarity(vectors).astype(np.float16)

    os.makedirs(models_dir, exist_ok=True)
    movie_list_path = os.path.join(models_dir, "movie_list.pkl")
    similarity_path = os.path.join(models_dir, "similarity.pkl")

    with open(movie_list_path, "wb") as f:
        pickle.dump(df, f)

    with open(similarity_path, "wb") as f:
        pickle.dump(similarity, f)

    print(f"[SUCCESS] Saved model artifacts to '{models_dir}/'")


if __name__ == "__main__":
    train_model()
