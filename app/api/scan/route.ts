import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const barcode = searchParams.get("barcode");

    if (!barcode) {
      return NextResponse.json({ error: "No barcode provided" }, { status: 400 });
    }

    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`, {
      headers: {
        'User-Agent': 'NutriScan/1.0',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const data = await response.json();
    
    if (data.status === 0) {
      return NextResponse.json({ error: "Product not found in database" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 