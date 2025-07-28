'use client';

import React, { useState } from 'react';

const NUTRISCORE_LABELS: Record<string, string> = {
  a: 'Nutri-Score A (Highest nutritional quality)',
  b: 'Nutri-Score B',
  c: 'Nutri-Score C',
  d: 'Nutri-Score D (Lower nutritional quality)',
  e: 'Nutri-Score E (Lowest nutritional quality)',
};
const NOVA_LABELS: Record<string, string> = {
  '1': 'Unprocessed or minimally processed foods',
  '2': 'Processed culinary ingredients',
  '3': 'Processed foods',
  '4': 'Ultra-processed foods',
};
const ECOSCORE_LABELS: Record<string, string> = {
  a: 'Green-Score A (Lowest environmental impact)',
  b: 'Green-Score B (Low environmental impact)',
  c: 'Green-Score C',
  d: 'Green-Score D',
  e: 'Green-Score E (Highest environmental impact)',
};

function Search() {
  const [barcode, setBarcode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/${barcode}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Product not found');
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.status === 0) {
        setError('Product not found in Open Food Facts.');
        setLoading(false);
        return;
      }
      if (!data.product) {
        setError('Product found but no product data available.');
        setLoading(false);
        return;
      }
      setResult(data.product);
    } catch (err) {
      setError('Error fetching product');
    } finally {
      setLoading(false);
    }
  };

  const renderNutritionTable = (nutriments: any) => {
    if (!nutriments) return null;
    const rows = [
      { label: 'Energy', value: nutriments['energy-kcal_100g'] ? `${nutriments['energy-kcal_100g']} kcal` : 'N/A' },
      { label: 'Fat', value: nutriments['fat_100g'] ? `${nutriments['fat_100g']} g` : 'N/A' },
      { label: 'Saturated fat', value: nutriments['saturated-fat_100g'] ? `${nutriments['saturated-fat_100g']} g` : 'N/A' },
      { label: 'Carbohydrates', value: nutriments['carbohydrates_100g'] ? `${nutriments['carbohydrates_100g']} g` : 'N/A' },
      { label: 'Sugars', value: nutriments['sugars_100g'] ? `${nutriments['sugars_100g']} g` : 'N/A' },
      { label: 'Fiber', value: nutriments['fiber_100g'] ? `${nutriments['fiber_100g']} g` : 'N/A' },
      { label: 'Proteins', value: nutriments['proteins_100g'] ? `${nutriments['proteins_100g']} g` : 'N/A' },
      { label: 'Salt', value: nutriments['salt_100g'] ? `${nutriments['salt_100g']} g` : 'N/A' },
      { label: 'Potassium', value: nutriments['potassium_100g'] ? `${nutriments['potassium_100g']} mg` : 'N/A' },
      { label: 'Calcium', value: nutriments['calcium_100g'] ? `${nutriments['calcium_100g']} mg` : 'N/A' },
      { label: 'Iron', value: nutriments['iron_100g'] ? `${nutriments['iron_100g']} mg` : 'N/A' },
    ];
    return (
      <table className="mt-2 w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-1">Nutrient</th>
            <th className="text-left p-1">per 100g</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.label}>
              <td className="p-1 border-t">{row.label}</td>
              <td className="p-1 border-t">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter barcode ..."
          className="bg-background-1 text-sm w-full font-light placeholder-text-3 px-4 py-2 rounded-full focus:ring-0 focus:border-accent"
          value={barcode}
          onChange={e => setBarcode(e.target.value)}
        />
        <button type="submit" className="mt-2 px-4 py-2 bg-primary text-background rounded-full">Search</button>
      </form>
      {loading && <div className="mt-2 text-sm">Loading...</div>}
      {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
      {result && (
        <div className="mt-4 p-4 border rounded bg-background-1">
          {/* Product image */}
          {result.image_url || result.image_front_url ? (
            <img src={result.image_url || result.image_front_url} alt="Product" className="w-32 h-32 object-contain mb-2 mx-auto" />
          ) : (
            <div className="w-32 h-32 bg-gray-200 flex items-center justify-center mb-2 mx-auto">No Image</div>
          )}
          <div className="font-bold text-lg mb-2 text-center">{result.product_name || result.product_name_en || 'No name'}</div>
          {/* Nutri-Score */}
          {result.nutriscore_grade && (
            <div className="mb-1">
              <b>Nutri-Score:</b> {result.nutriscore_grade.toUpperCase()} <span className="ml-2">{NUTRISCORE_LABELS[result.nutriscore_grade]}</span>
            </div>
          )}
          {/* NOVA group */}
          {result.nova_group && (
            <div className="mb-1">
              <b>NOVA group:</b> {result.nova_group} <span className="ml-2">{NOVA_LABELS[result.nova_group]}</span>
            </div>
          )}
          {/* Eco-Score */}
          {result.ecoscore_grade && (
            <div className="mb-1">
              <b>Green-Score:</b> {result.ecoscore_grade.toUpperCase()} <span className="ml-2">{ECOSCORE_LABELS[result.ecoscore_grade]}</span>
            </div>
          )}
          {/* Nutrition facts table */}
          <div className="mt-2">
            <b>Nutrition facts (per 100g):</b>
            {renderNutritionTable(result.nutriments)}
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;