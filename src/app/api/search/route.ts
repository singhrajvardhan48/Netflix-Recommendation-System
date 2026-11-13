import { NextRequest, NextResponse } from 'next/server';
import { searchCatalog } from '@/lib/movies';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        query: '',
        category: 'all',
        total: 0,
        results: [],
      });
    }

    const searchResponse = searchCatalog(query, limit);

    return NextResponse.json({
      success: true,
      query: searchResponse.query,
      category: searchResponse.category,
      total: searchResponse.total,
      results: searchResponse.results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

