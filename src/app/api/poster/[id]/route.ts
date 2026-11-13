import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_KEY = 'c7ec19ffdd3279641fb606d19ceb9bb1';

const posterMemoryCache = new Map<number, { poster: string | null; backdrop: string | null }>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const movieId = Number(id);

    if (isNaN(movieId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    if (posterMemoryCache.has(movieId)) {
      return NextResponse.json(
        { success: true, ...posterMemoryCache.get(movieId) },
        { headers: { 'Cache-Control': 'public, max-age=86400, immutable' } }
      );
    }

    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) {
      return NextResponse.json({ success: true, poster: null, backdrop: null });
    }

    const data = await res.json();
    const poster = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null;
    const backdrop = data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null;

    const result = { poster, backdrop };
    posterMemoryCache.set(movieId, result);

    return NextResponse.json(
      { success: true, ...result },
      { headers: { 'Cache-Control': 'public, max-age=86400, immutable' } }
    );
  } catch (error) {
    return NextResponse.json({ success: true, poster: null, backdrop: null });
  }
}

