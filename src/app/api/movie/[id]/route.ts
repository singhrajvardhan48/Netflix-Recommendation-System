import { NextRequest, NextResponse } from 'next/server';
import { getMovieById, getMovieByTitle } from '@/lib/movies';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = Number(id);

    let movie = !isNaN(numId) ? getMovieById(numId) : undefined;
    if (!movie) {
      movie = getMovieByTitle(decodeURIComponent(id));
    }

    if (!movie) {
      return NextResponse.json(
        { success: false, error: 'Movie not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: movie,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

