# 🎬 Netflix - AI Movie Recommendation System (Full-Stack & Backend)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/singhrajvardhan48/Netflix-Recommendation-System)
[![Next.js](https://img.shields.io/badge/Framework-Next.js%2015-black.svg?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/Frontend-React%2019-blue.svg?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Machine Learning](https://img.shields.io/badge/Algorithm-Cosine%20Similarity-red.svg)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)]()

A production-ready, full-stack **Netflix Movie Recommendation System** engineered for seamless, instant 1-click deployment on **Vercel**. Powered by Natural Language Processing (NLP), Bag-of-Words tokenization (`CountVectorizer`), and vector angle evaluation (`Cosine Similarity`) over 4,797 movies.

---

## 🚀 Key Features

* **Authentic Netflix Dark Theme:** Sleek Netflix Red (`#E50914`) and Charcoal Black (`#141414`) UI with smooth hover animations and responsive layouts.
* **Cinematic Hero Showcase:** Featured dynamic backdrop banner with movie metadata, genres, plot overview, and quick action buttons.
* **Intelligent Multi-Field Search:**
  * 🎬 **Director Search:** Search any director (e.g. *Christopher Nolan*, *Quentin Tarantino*, *Steven Spielberg*) to list their films.
  * 🌟 **Lead Actor Search:** Search any actor (e.g. *Leonardo DiCaprio*, *Tom Cruise*, *Brad Pitt*) to discover their films.
  * 🚀 **Theme / Plot Search:** Search plot concepts like *Space*, *Zombie*, *Time travel*, *Superhero*, or *Mafia*.
  * 🍿 **Movie Title Search:** Instant title matching.
  * ❌ **Smart Record Not Found:** If a title is not in the dataset, displays an explicit, stylish "Record Not Found" notice with helpful search recommendations instead of random results.
* **Interactive AI Recommendation Engine:**
  * Select any movie from the 4,797 catalog.
  * Configurable recommendation count (5 to 12).
  * Calculates and displays similar titles with pairwise Cosine Similarity Match Percentages (e.g. `96% Match`, `92% Match`).
* **Curated Netflix Carousels:** Smooth horizontal-scrolling rows for *Trending Blockbusters*, *Top Rated Masterpieces*, *Directed by Christopher Nolan*, *Starring Leonardo DiCaprio*, *Sci-Fi & Time Travel*, and *Action*.
* **Deep Dive Movie Details Modal:** High-resolution backdrops, TMDB posters, ratings, release years, director & cast chips, plot synopses, and 1-click "Find Similar Movies".
* **Ultra-Fast Serverless Backend:** Zero cold start, sub-millisecond API response times optimized for Vercel's global edge network.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend API** | Next.js Serverless API Route Handlers (`/api/*`) |
| **Machine Learning** | CountVectorizer (5,000 features, English stop words), Pairwise Cosine Similarity |
| **Data & Storage** | Lightweight precalculated JSON vector maps (`movies.json`, `recommendations.json`) |
| **APIs Integrated** | TMDB API (The Movie Database) for high-resolution posters & backdrops |
| **Alternative UI** | Python Streamlit (`app.py`, `recommend.py`) |
| **Deployment** | Vercel (1-Click, Zero-Config) |

---

## 🌐 REST Backend API Endpoints

The full-stack application includes a robust REST API deployable directly to Vercel:

| Endpoint | Method | Description | Sample Query |
| :--- | :--- | :--- | :--- |
| `/api/recommend` | `GET` | Computes top recommendations with Cosine Similarity match % | `/api/recommend?title=Inception&limit=5` |
| `/api/search` | `GET` | Multi-field search across Director, Actor, Theme, and Title | `/api/search?q=Christopher+Nolan` |
| `/api/movies` | `GET` | Paginated movie catalog with filtering & sorting | `/api/movies?page=1&limit=20&sortBy=popularity` |
| `/api/movie/[id]` | `GET` | Retrieves single movie details by TMDB ID or title | `/api/movie/19995` or `/api/movie/Avatar` |
| `/api/poster/[id]` | `GET` | Cached TMDB proxy for high-resolution posters & backdrops | `/api/poster/19995` |

---

## ⚡ How to Deploy on Vercel (1-Click)

1. Push your code to your GitHub repository:
   `https://github.com/singhrajvardhan48/Netflix-Recommendation-System`
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New"** > **"Project"**.
3. Import your **`Netflix-Recommendation-System`** repository.
4. Vercel will automatically detect **Next.js**. Click **Deploy**!
5. Your application will be live worldwide in under 1 minute with free HTTPS.

---

## 💻 Local Development

### Option 1: Run the Full-Stack Next.js App (Recommended)

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Run the Streamlit Prototype

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Run Streamlit application
python -m streamlit run app.py
```

Open [http://localhost:8501](http://localhost:8501) in your browser.

---

## 📂 Project Structure

```text
Netflix-Recommendation-System/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── movie/[id]/route.ts     # Single movie API
│   │   │   ├── movies/route.ts         # Paginated catalog API
│   │   │   ├── poster/[id]/route.ts    # TMDB poster proxy API
│   │   │   ├── recommend/route.ts      # Cosine similarity recommender API
│   │   │   └── search/route.ts         # Multi-field search API
│   │   ├── globals.css                 # Netflix styling & custom scrollbars
│   │   ├── layout.tsx                  # Root layout & Netflix metadata
│   │   └── page.tsx                    # Main Netflix interactive home page
│   ├── components/
│   │   ├── Navbar.tsx                  # Top navigation bar
│   │   ├── HeroBanner.tsx              # Cinematic hero trailer banner
│   │   ├── SearchSection.tsx           # Multi-field search & "Not Found" state
│   │   ├── RecommendationEngine.tsx    # Interactive AI recommendation spotlight
│   │   ├── MovieRow.tsx                # Horizontal carousel row
│   │   ├── MovieCard.tsx               # Movie poster card with match %
│   │   └── MovieModal.tsx              # Deep-dive detail modal
│   └── lib/
│       ├── movies.ts                   # Core search & recommendation logic
│       └── types.ts                    # TypeScript data definitions
│
├── data/
│   ├── movies.csv                      # Cleaned movie metadata dataset (4,797 movies)
│   ├── movies.json                     # Optimized metadata catalog for Vercel
│   └── recommendations.json            # Precalculated Cosine Similarity index
│
├── public/
│   └── default_poster.png              # Fallback offline poster
│
├── scripts/
│   └── prepare_data.py                 # Data generator & vectorizer script
│
├── app.py                              # Streamlit frontend app
├── recommend.py                        # Python recommendation engine
├── train_model.py                      # Python ML model training runner
├── requirements.txt                    # Python dependencies
├── package.json                        # Node.js dependencies & scripts
├── next.config.mjs                     # Next.js configuration
├── tailwind.config.ts                  # Netflix design system & colors
├── vercel.json                         # Vercel deployment configuration
└── README.md                           # Documentation
```

---

## 🧠 Machine Learning Methodology

$$\text{Cosine Similarity}(A, B) = \cos(\theta) = \frac{A \cdot B}{\|A\| \|B\|} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \sqrt{\sum_{i=1}^{n} B_i^2}}$$

1. **Feature Engineering:** Combines Overview, Genres, Plot Keywords, Top 3 Cast Members, and Director into collapsed semantic tag strings.
2. **CountVectorizer:** Converts text tokens into a dense 5,000-dimensional bag-of-words space while removing English stopwords.
3. **Pairwise Cosine Similarity:** Computes directional vector angles between all 4,797 movies to rank the most contextually relevant titles.
4. **Vercel Optimization:** High-frequency top recommendations are indexed for instant sub-millisecond retrieval on serverless edge functions.
