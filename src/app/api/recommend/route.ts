import { NextRequest, NextResponse } from 'next/server';
import { getRecommendations } from '@/lib/movies';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const title = searchParams.get('title');
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));

    const targetQuery = id || title;

    if (!targetQuery) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: "id" or "title"',
        },
        { status: 400 }
      );
    }

    const result = getRecommendations(targetQuery, limit);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: 'Record not found. No recommendations could be calculated for this title.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        movie: result.targetMovie,
        count: result.recommendations.length,
        recommendations: result.recommendations.map((r) => ({
          ...r.movie,
          similarityScore: r.score,
          matchPercentage: Math.round(r.score * 100),
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

