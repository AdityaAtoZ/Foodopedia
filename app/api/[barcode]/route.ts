import { getProduct, getProductNutrients } from "@/(app)/actions";

export async function GET(
  request: Request,
  { params }: { params: { barcode: string } }
) {
  try {
    const barcode = params.barcode;
    if (!barcode) {
      return new Response(JSON.stringify({ error: 'Barcode is required' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Fetch from Open Food Facts API
    const apiUrl = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'NutriScan/1.0 (contact@example.com)', // Replace with your contact email
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Product not found in Open Food Facts' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}