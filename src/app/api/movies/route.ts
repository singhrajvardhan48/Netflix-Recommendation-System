import { NextRequest, NextResponse } from 'next/server';
import { getAllMovies } from '@/lib/movies';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const genre = searchParams.get('genre')?.toLowerCase();
    const sortBy = searchParams.get('sortBy') || 'popularity'; // 'popularity', 'rating', 'title', 'year'

    let movies = getAllMovies();

    if (genre) {
      movies = movies.filter((m) =>
        m.genres.some((g) => g.toLowerCase().includes(genre))
      );
    }

    if (sortBy === 'rating') {
      movies = [...movies].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'title') {
      movies = [...movies].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'year') {
      movies = [...movies].sort((a, b) => b.year.localeCompare(a.year));
    } else {
      // default popularity
      movies = [...movies].sort((a, b) => b.popularity - a.popularity);
    }

    const total = movies.length;
    const startIndex = (page - 1) * limit;
    const paginated = movies.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: paginated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

