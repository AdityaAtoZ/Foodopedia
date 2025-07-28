import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const apiURL = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`;

    const response = await fetch(apiURL);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from OpenFoodFacts' }, { status: 500 });
    }

    const data = await response.json();
    
    return NextResponse.json(data.products || []);
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 