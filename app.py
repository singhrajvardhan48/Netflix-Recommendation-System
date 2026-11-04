"""
=============================================================================
B.Tech Artificial Intelligence & Machine Learning (AIML) – Major Academic Project
PROJECT: Netflix Movie Recommendation System
File: app.py
Description: Streamlit application focusing purely on Content-Based Movie
             Recommendations using CountVectorizer and Cosine Similarity.
=============================================================================
"""

import os
import streamlit as st
import pandas as pd
import numpy as np

# Import recommendation engine functions
from recommend import (
    load_model_artifacts,
    recommend,
    fetch_poster_tmdb,
    search_catalog,
    DEFAULT_POSTER_PATH
)

# -----------------------------------------------------------------------------
# 1. Page Configuration & Custom Netflix Dark Theme Styling
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="Netflix Movie Recommendation System",
    page_icon="🍿",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS for Netflix-inspired dark UI (Charcoal #141414, Netflix Red #E50914)
st.markdown("""
<style>
    /* Main Background & Clean Typography */
    .stApp {
        background-color: #141414;
        color: #FFFFFF;
        font-family: 'Helvetica Neue', Arial, sans-serif;
    }
    
    /* Hide Streamlit Sidebar entirely for a focused single-page experience */
    [data-testid="stSidebar"] {
        display: none;
    }
    [data-testid="collapsedControl"] {
        display: none;
    }

    /* Netflix Brand Header */
    .netflix-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0 20px 0;
        border-bottom: 2px solid #E50914;
        margin-bottom: 24px;
    }
    .netflix-logo {
        color: #E50914;
        font-size: 2.4rem;
        font-weight: 900;
        letter-spacing: 2px;
        text-transform: uppercase;
        margin: 0;
        line-height: 1.1;
    }
    .netflix-subtitle {
        color: #AAAAAA;
        font-size: 0.95rem;
        margin: 4px 0 0 0;
    }
    .netflix-badge {
        background-color: #E50914;
        color: white;
        padding: 6px 14px;
        border-radius: 4px;
        font-size: 0.85rem;
        font-weight: bold;
        letter-spacing: 1px;
    }

    /* Hero / Search Section Box */
    .hero-box {
        background: linear-gradient(180deg, #1f1f1f 0%, #171717 100%);
        border-left: 5px solid #E50914;
        padding: 22px 26px;
        border-radius: 8px;
        margin-bottom: 25px;
    }
    
    /* Movie Card Styling */
    .movie-card {
        background-color: #1a1a1a;
        border-radius: 8px;
        padding: 14px;
        margin-bottom: 15px;
        border: 1px solid #2b2b2b;
        transition: transform 0.25s ease, border-color 0.25s ease;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .movie-card:hover {
        transform: translateY(-6px);
        border-color: #E50914;
        box-shadow: 0 8px 20px rgba(229, 9, 20, 0.2);
    }
    
    /* Movie Titles & Badges */
    .movie-title {
        color: #FFFFFF;
        font-size: 1.05rem;
        font-weight: bold;
        margin-top: 10px;
        margin-bottom: 8px;
        min-height: 44px;
        line-height: 1.25;
    }
    .badge-year {
        background-color: #333333;
        color: #E0E0E0;
        padding: 2px 7px;
        border-radius: 3px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-right: 5px;
    }
    .badge-rating {
        background-color: #FFB800;
        color: #000000;
        padding: 2px 7px;
        border-radius: 3px;
        font-size: 0.75rem;
        font-weight: bold;
        margin-right: 5px;
    }
    .badge-sim {
        background-color: #E50914;
        color: #FFFFFF;
        padding: 2px 7px;
        border-radius: 3px;
        font-size: 0.75rem;
        font-weight: bold;
    }
    
    /* Card Metadata */
    .movie-meta {
        color: #AAAAAA;
        font-size: 0.8rem;
        margin-top: 6px;
        margin-bottom: 4px;
    }
    .movie-meta strong {
        color: #DDDDDD;
    }
    .movie-plot {
        color: #888888;
        font-size: 0.78rem;
        line-height: 1.35;
        margin-top: 8px;
        max-height: 65px;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Red Action Button */
    .stButton > button {
        background-color: #E50914 !important;
        color: white !important;
        font-weight: bold !important;
        font-size: 1.05rem !important;
        border: none !important;
        border-radius: 4px !important;
        padding: 10px 24px !important;
        transition: background-color 0.2s ease !important;
        width: 100%;
        margin-top: 4px;
    }
    .stButton > button:hover {
        background-color: #b80710 !important;
    }
</style>
""", unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# 2. Cached Model Ingestion
# -----------------------------------------------------------------------------
@st.cache_resource(show_spinner=False)
def get_cached_models():
    """
    Loads pre-trained movie dataset and Cosine Similarity matrix from disk.
    Cached in RAM for rapid sub-5ms recommendation retrieval.
    """
    try:
        return load_model_artifacts()
    except Exception as e:
        return None, None


movies_df, similarity_matrix = get_cached_models()


# -----------------------------------------------------------------------------
# 3. Main Header
# -----------------------------------------------------------------------------
st.markdown("""
<div class="netflix-header">
    <div>
        <h1 class="netflix-logo">NETFLIX</h1>
        <p class="netflix-subtitle">Content-Based Movie Recommendation System</p>
    </div>
    <div>
        <span class="netflix-badge">B.Tech AIML Major Project</span>
    </div>
</div>
""", unsafe_allow_html=True)


# Fallback check
if movies_df is None or similarity_matrix is None:
    st.error("⚠️ Model artifacts (`movie_list.pkl`, `similarity.pkl`) not found in `models/` directory.")
    st.info("Run `python train_model.py` to generate the similarity matrix.")
    st.stop()


# -----------------------------------------------------------------------------
# 4. Search & Selection Interface (Multi-field: Title, Director, Actor, Content)
# -----------------------------------------------------------------------------
st.markdown("""
<div class="hero-box">
    <h3 style="margin-top: 0; color: #FFFFFF; font-size: 1.35rem;">Find Movies by Director, Actor, Theme, or Title</h3>
    <p style="color: #CCCCCC; font-size: 0.92rem; margin-bottom: 0;">
        Search any <strong>Director</strong> (e.g. <em>Christopher Nolan, Tarantino</em>), 
        <strong>Lead Actor</strong> (e.g. <em>Leonardo DiCaprio, Tom Cruise</em>), 
        <strong>Genre or Plot Theme</strong> (e.g. <em>Space, Zombie, Time Travel</em>), or <strong>Movie Title</strong>.
        Our engine matches your search and computes pairwise <code>Cosine Similarity</code> recommendations.
    </p>
</div>
""", unsafe_allow_html=True)

all_titles_list = sorted(list(movies_df['title'].unique()))

col_search_box, col_count = st.columns([3, 1])

with col_search_box:
    search_query = st.text_input(
        "🔍 Search Director, Lead Actor, Content Theme, or Movie Title:",
        placeholder="e.g. Christopher Nolan, Leonardo DiCaprio, Space, Zombie, Avatar...",
        help="Type any director name, actor name, plot keyword, genre, or movie title"
    )

with col_count:
    num_recommendations = st.selectbox(
        "Recommendations Count:",
        options=[5, 6, 7, 8, 9, 10],
        index=0
    )

# Filter catalog based on search query
if search_query and search_query.strip():
    search_results, match_category = search_catalog(search_query, movies_df, top_k=50)
    if search_results.empty:
        st.markdown(f"""
        <div style="background-color: #2b1214; border-left: 5px solid #E50914; padding: 18px 24px; border-radius: 6px; margin-top: 15px; margin-bottom: 25px;">
            <h3 style="color: #ff4b4b; margin: 0 0 8px 0; font-size: 1.25rem;">❌ Record Not Found / No Match Found</h3>
            <p style="color: #FFFFFF; font-size: 1.0rem; margin: 0 0 6px 0;">
                No movie, director, actor, or theme matching <strong>"{search_query.strip()}"</strong> was found in the database.
            </p>
            <p style="color: #AAAAAA; font-size: 0.85rem; margin: 0;">
                Please verify your spelling or try searching for a different movie, director, or actor.
            </p>
        </div>
        """, unsafe_allow_html=True)
        st.stop()
    else:
        available_options = search_results['title'].tolist()
        st.markdown(
            f"<div style='margin-bottom: 8px; color: #46d369; font-size: 0.95rem; font-weight: bold;'>"
            f"✨ Found {len(search_results)} movies matching {match_category}: <em>'{search_query.strip()}'</em>"
            f"</div>",
            unsafe_allow_html=True
        )
else:
    available_options = all_titles_list

col_select, col_btn = st.columns([3, 1])

with col_select:
    default_movie = "Avatar" if ("Avatar" in available_options and not search_query) else available_options[0]
    default_index = available_options.index(default_movie) if default_movie in available_options else 0
    selected_movie = st.selectbox(
        "Select Movie to Recommend From:",
        options=available_options,
        index=default_index,
        help="Select a movie from the search results to see detailed information and top recommendations"
    )

with col_btn:
    st.markdown("<div style='margin-top: 28px;'></div>", unsafe_allow_html=True)
    recommend_button = st.button("🎬 Recommend Movies", use_container_width=True)

# -----------------------------------------------------------------------------
# 5. Selected Movie Spotlight
# -----------------------------------------------------------------------------
selected_row = movies_df[movies_df['title'] == selected_movie].iloc[0]

with st.expander(f"📌 Selected Movie: {selected_row['title']} ({selected_row['release_year']})", expanded=True):
    col_p, col_info = st.columns([1, 4])
    with col_p:
        sel_poster = fetch_poster_tmdb(selected_row['movie_id']) or DEFAULT_POSTER_PATH
        st.image(sel_poster, caption=selected_movie, width=155)
    with col_info:
        st.markdown(f"### {selected_row['title']} <span style='font-size:1.1rem; color:#888;'>({selected_row['release_year']})</span>", unsafe_allow_html=True)
        st.markdown(f"**Genres:** `{selected_row['display_genres']}` | **Director:** `{selected_row['display_director']}`")
        st.markdown(f"**Top Cast:** `{selected_row['display_cast']}`")
        st.markdown(f"**Rating:** ⭐ `{selected_row['vote_average']:.1f}/10` (TMDB)")
        st.markdown(f"**Plot Synopsis:** {selected_row['overview']}")

st.markdown("---")


# -----------------------------------------------------------------------------
# 6. Recommendation Results Display (5-Column Grid)
# -----------------------------------------------------------------------------
if recommend_button or selected_movie:
    st.markdown(f"### 🎯 Top {num_recommendations} Recommendations for *'{selected_movie}'*")

    with st.spinner("Calculating Cosine Similarity vectors & retrieving posters..."):
        try:
            recommendations, matched_title = recommend(
                selected_movie,
                movies_df,
                similarity_matrix,
                top_n=num_recommendations,
                use_api=True
            )

            # Split cards into rows of 5
            cols_per_row = 5
            for row_start in range(0, len(recommendations), cols_per_row):
                current_slice = recommendations[row_start : row_start + cols_per_row]
                cols = st.columns(len(current_slice))
                
                for idx, movie in enumerate(current_slice):
                    with cols[idx]:
                        # Movie Poster (TMDB live poster or fallback placeholder)
                        poster_src = movie['poster_url']
                        if not poster_src or not (str(poster_src).startswith("http://") or str(poster_src).startswith("https://")):
                            poster_src = DEFAULT_POSTER_PATH

                        st.image(poster_src, use_container_width=True)

                        # Movie Information Card
                        sim_percent = int(movie['similarity_score'] * 100)
                        st.markdown(f"""
                        <div class="movie-card">
                            <div>
                                <div class="movie-title">{movie['title']}</div>
                                <div>
                                    <span class="badge-year">{movie['release_year']}</span>
                                    <span class="badge-rating">{movie['imdb_rating']}</span>
                                    <span class="badge-sim">{sim_percent}% Match</span>
                                </div>
                                <div class="movie-meta"><strong>Genre:</strong> {movie['genres']}</div>
                                <div class="movie-meta"><strong>Director:</strong> {movie['director']}</div>
                                <div class="movie-meta"><strong>Cast:</strong> {movie['cast']}</div>
                                <div class="movie-plot">{movie['overview']}</div>
                            </div>
                        </div>
                        """, unsafe_allow_html=True)

        except Exception as e:
            st.error(f"Error computing recommendations: {str(e)}")


# -----------------------------------------------------------------------------
# 7. Concise Model Information Footer
# -----------------------------------------------------------------------------
st.markdown("---")
with st.expander("ℹ️ How the Algorithm Works (AIML Project Summary)", expanded=False):
    st.markdown(r"""
    * **Model Architecture:** Content-Based Filtering using Natural Language Processing (NLP).
    * **Feature Engineering:** Combines Plot Overview + Genres + Keywords + Top 3 Cast + Director into a single entity-collapsed `tags` string.
    * **Vectorization:** `CountVectorizer(max_features=5000, stop_words='english')` converts text into numerical token frequency vectors.
    * **Similarity Metric:** Pairwise **Cosine Similarity** evaluates the angle $\theta$ between movie vectors:
    $$\text{Cosine Similarity}(A, B) = \cos(\theta) = \frac{A \cdot B}{\|A\| \|B\|}$$
    * **Catalog Size:** 4,797 movies derived from the TMDB 5,000 Movies & Credits dataset.
    """)
