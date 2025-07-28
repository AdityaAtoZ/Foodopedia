'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';

interface Product {
  product_name?: string;
  image_url?: string;
  brands?: string;
  nutrition_grades?: string;
  nutriments?: {
    energy_100g?: number;
    fat_100g?: number;
    saturated_fat_100g?: number;
    carbohydrates_100g?: number;
    sugars_100g?: number;
    fiber_100g?: number;
    proteins_100g?: number;
    salt_100g?: number;
    sodium_100g?: number;
  };
  ingredients_text?: string;
  nova_group?: number;
  ecoscore_grade?: string;
  allergens?: string;
}

interface ApiResponse {
  status: number;
  product?: Product;
}

export default function ScanResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const barcode = searchParams.get('barcode');
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!barcode) {
      setError('No barcode provided');
      setIsLoading(false);
      return;
    }

    fetchProduct(barcode);
  }, [barcode]);

  const fetchProduct = async (barcode: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data: ApiResponse = await response.json();
      
      if (data.status === 1 && data.product) {
        setProduct(data.product);
        
        // Save to recent searches
        const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        const newSearch = {
          barcode,
          name: data.product.product_name || 'Unknown Product',
          brand: data.product.brands || '',
          timestamp: Date.now()
        };
        
        // Remove duplicate if exists
        const filtered = recentSearches.filter((item: any) => item.barcode !== barcode);
        // Add to beginning and keep only 6 most recent
        const updated = [newSearch, ...filtered].slice(0, 6);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
      } else {
        setError('Product not found in database');
      }
    } catch (err) {
      setError('Failed to fetch product information');
      console.error('Error fetching product:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getNutritionGrade = (grade?: string) => {
    if (!grade) return { color: 'bg-gray-200', label: 'N/A' };
    
    const grades: Record<string, { color: string; label: string }> = {
      'a': { color: 'bg-green-500', label: 'A' },
      'b': { color: 'bg-lime-400', label: 'B' },
      'c': { color: 'bg-yellow-400', label: 'C' },
      'd': { color: 'bg-orange-400', label: 'D' },
      'e': { color: 'bg-red-500', label: 'E' }
    };
    
    return grades[grade.toLowerCase()] || { color: 'bg-gray-200', label: grade.toUpperCase() };
  };

  const getNovaGroup = (nova?: number) => {
    if (!nova) return 'N/A';
    const groups = ['', 'Unprocessed', 'Processed culinary ingredients', 'Processed foods', 'Ultra-processed foods'];
    return `Group ${nova}: ${groups[nova] || 'Unknown'}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <p className="text-gray-600">Loading product information...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Product Not Found</h1>
        </div>
        
        <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops! Product Not Found</h2>
          <p className="text-gray-600 text-center mb-6">
            {error || "We couldn't find this product in our database."}
          </p>
          <p className="text-sm text-gray-500 mb-4">Barcode: {barcode}</p>
          <button 
            onClick={() => router.back()}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Another Product
          </button>
        </div>
      </div>
    );
  }

  const nutritionGrade = getNutritionGrade(product.nutrition_grades);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Product Details</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Product Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex gap-4">
            {product.image_url && (
              <img 
                src={product.image_url} 
                alt={product.product_name}
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {product.product_name || 'Unknown Product'}
              </h2>
              {product.brands && (
                <p className="text-gray-600 mb-2">{product.brands}</p>
              )}
              <p className="text-sm text-gray-500">Barcode: {barcode}</p>
            </div>
          </div>
        </div>

        {/* Nutrition Grades */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Nutrition Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full ${nutritionGrade.color} flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">{nutritionGrade.label}</span>
              </div>
              <div>
                <p className="font-medium">Nutri-Score</p>
                <p className="text-sm text-gray-600">Nutritional quality</p>
              </div>
            </div>
            
            {product.nova_group && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{product.nova_group}</span>
                </div>
                <div>
                  <p className="font-medium">NOVA Group</p>
                  <p className="text-sm text-gray-600">Processing level</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nutrition Facts */}
        {product.nutriments && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Nutrition Facts (per 100g)</h3>
            <div className="space-y-3">
              {product.nutriments.energy_100g && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Energy</span>
                  <span className="font-medium">{Math.round(product.nutriments.energy_100g)} kJ</span>
                </div>
              )}
              {product.nutriments.fat_100g !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Fat</span>
                  <span className="font-medium">{product.nutriments.fat_100g.toFixed(1)}g</span>
                </div>
              )}
              {product.nutriments.saturated_fat_100g !== undefined && (
                <div className="flex justify-between pl-4">
                  <span className="text-gray-600">- Saturated fat</span>
                  <span className="font-medium">{product.nutriments.saturated_fat_100g.toFixed(1)}g</span>
                </div>
              )}
              {product.nutriments.carbohydrates_100g !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Carbohydrates</span>
                  <span className="font-medium">{product.nutriments.carbohydrates_100g.toFixed(1)}g</span>
                </div>
              )}
              {product.nutriments.sugars_100g !== undefined && (
                <div className="flex justify-between pl-4">
                  <span className="text-gray-600">- Sugars</span>
                  <span className="font-medium">{product.nutriments.sugars_100g.toFixed(1)}g</span>
                </div>
              )}
              {product.nutriments.fiber_100g !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Fiber</span>
                  <span className="font-medium">{product.nutriments.fiber_100g.toFixed(1)}g</span>
                </div>
              )}
              {product.nutriments.proteins_100g !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Protein</span>
                  <span className="font-medium">{product.nutriments.proteins_100g.toFixed(1)}g</span>
                </div>
              )}
              {(product.nutriments.salt_100g !== undefined || product.nutriments.sodium_100g !== undefined) && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Salt</span>
                  <span className="font-medium">
                    {product.nutriments.salt_100g !== undefined 
                      ? product.nutriments.salt_100g.toFixed(1) 
                      : (product.nutriments.sodium_100g! * 2.54).toFixed(1)}g
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
          <div className="space-y-3">
            {product.nova_group && (
              <div>
                <p className="font-medium text-gray-700">Processing Level</p>
                <p className="text-gray-600">{getNovaGroup(product.nova_group)}</p>
              </div>
            )}
            {product.ecoscore_grade && (
              <div>
                <p className="font-medium text-gray-700">Environmental Impact</p>
                <p className="text-gray-600">Eco-Score: {product.ecoscore_grade.toUpperCase()}</p>
              </div>
            )}
            {product.allergens && (
              <div>
                <p className="font-medium text-gray-700">Allergens</p>
                <p className="text-gray-600">{product.allergens}</p>
              </div>
            )}
          </div>
        </div>

        {/* Ingredients */}
        {product.ingredients_text && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Ingredients</h3>
            <p className="text-gray-700 leading-relaxed">{product.ingredients_text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
