'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ProductDetailsPage() {
  const params = useParams();
  const barcode = params.barcode as string;
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper function to get health indicator color based on traffic light system
  const getHealthColor = (nutrient: string, value: number) => {
    const thresholds: { [key: string]: { low: number; high: number } } = {
      'energy': { low: 335, high: 670 }, // kcal per 100g
      'fat': { low: 3, high: 17.5 }, // g per 100g
      'sugar': { low: 5, high: 22.5 }, // g per 100g (sugars)
      'salt': { low: 0.3, high: 1.5 } // g per 100g
    };
    
    const threshold = thresholds[nutrient];
    if (!threshold) return '#28a745'; // default green
    
    if (value <= threshold.low) return '#28a745'; // green
    if (value <= threshold.high) return '#ffc107'; // yellow/amber
    return '#dc3545'; // red
  };
  
  // Helper function to format Nutri-Score grade
  const getNutriScoreColor = (grade: string) => {
    const colors: { [key: string]: string } = {
      'a': '#00b04f',
      'b': '#85bb2f',
      'c': '#f3d331',
      'd': '#ee8100',
      'e': '#e63312'
    };
    return colors[grade?.toLowerCase()] || '#6c757d';
  };
  
  // Helper function to get NOVA group info
  const getNovaInfo = (novaGroup: number) => {
    const novaData: { [key: number]: { label: string; color: string; description: string } } = {
      1: { label: 'NOVA 1', color: '#28a745', description: 'Unprocessed or minimally processed foods' },
      2: { label: 'NOVA 2', color: '#85bb2f', description: 'Processed culinary ingredients' },
      3: { label: 'NOVA 3', color: '#ffc107', description: 'Processed foods' },
      4: { label: 'NOVA 4', color: '#dc3545', description: 'Ultra-processed foods' }
    };
    return novaData[novaGroup] || { label: 'Unknown', color: '#6c757d', description: 'Processing level unknown' };
  };
  
  // Helper function to parse ingredient analysis tags
  const parseIngredientTags = (tags: string[]) => {
    if (!tags) return [];
    
    const tagMap: { [key: string]: { label: string; color: string; icon: string } } = {
      'en:vegan': { label: 'Vegan', color: '#28a745', icon: 'leaf' },
      'en:vegetarian': { label: 'Vegetarian', color: '#85bb2f', icon: 'seedling' },
      'en:palm-oil-free': { label: 'Palm Oil Free', color: '#17a2b8', icon: 'tree' },
      'en:gluten-free': { label: 'Gluten Free', color: '#6f42c1', icon: 'wheat' },
      'en:lactose-free': { label: 'Lactose Free', color: '#fd7e14', icon: 'glass-whiskey' },
      'en:organic': { label: 'Organic', color: '#20c997', icon: 'spa' }
    };
    
    return tags
      .filter(tag => tagMap[tag])
      .map(tag => tagMap[tag])
      .slice(0, 6); // Limit to 6 tags
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!barcode) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
        const data = await response.json();
        
        if (data.status === 1 && data.product) {
          setProduct(data.product);
        } else {
          setError('Product not found. The barcode might be incorrect or the product is not in our database.');
        }
      } catch (err) {
        setError('Error loading product. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [barcode]);

  if (isLoading) {
    return (
      <div className="app-container">

        {/* Header */}
        <div className="header">
          <div className="header-top">
            <Link href="/app/scan">
              <button className="menu-btn">
                <i className="fas fa-arrow-left" style={{fontSize: '18px', color: '#6c757d'}}></i>
              </button>
            </Link>
            <h1 style={{fontSize: '20px', fontWeight: '600', color: '#1a1a1a'}}>Product Details</h1>
            <div style={{width: '44px'}}></div>
          </div>
        </div>

        <div style={{padding: '0 24px', textAlign: 'center', marginTop: '60px'}}>
          <div style={{display: 'inline-block', width: '60px', height: '60px', border: '4px solid #ff6b35', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
          <p style={{marginTop: '20px', color: '#666', fontSize: '18px'}}>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">

        {/* Header */}
        <div className="header">
          <div className="header-top">
            <Link href="/app/scan">
              <button className="menu-btn">
                <i className="fas fa-arrow-left" style={{fontSize: '18px', color: '#6c757d'}}></i>
              </button>
            </Link>
            <h1 style={{fontSize: '20px', fontWeight: '600', color: '#1a1a1a'}}>Product Details</h1>
            <div style={{width: '44px'}}></div>
          </div>
        </div>

        <div style={{padding: '0 24px', marginTop: '40px'}}>
          <div style={{textAlign: 'center', padding: '40px 20px', background: '#ffebee', borderRadius: '16px', border: '2px solid #f44336'}}>
            <i className="fas fa-exclamation-triangle" style={{color: '#f44336', fontSize: '48px', marginBottom: '16px'}}></i>
            <h3 style={{fontSize: '20px', fontWeight: '600', color: '#d32f2f', marginBottom: '8px'}}>Product Not Found</h3>
            <p style={{color: '#d32f2f', fontSize: '16px', marginBottom: '20px'}}>{error}</p>
            <Link href="/app/scan">
              <button style={{
                padding: '12px 24px',
                background: '#ff6b35',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                Try Another Scan
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">

      {/* Header */}
      <div className="header">
        <div className="header-top">
          <Link href="/app/scan">
            <button className="menu-btn">
              <i className="fas fa-arrow-left" style={{fontSize: '18px', color: '#6c757d'}}></i>
            </button>
          </Link>
          <h1 style={{fontSize: '20px', fontWeight: '600', color: '#1a1a1a'}}>Product Details</h1>
          <div style={{width: '44px'}}></div>
        </div>
      </div>

      {/* Product Details */}
      <div style={{padding: '0 24px 40px', marginBottom: '20px'}}>
        <div style={{background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', border: '2px solid #4caf50'}}>
          <div style={{textAlign: 'center', marginBottom: '24px'}}>
            <img 
              src={product.image_url || product.image_front_url} 
              alt={product.product_name}
              style={{width: '140px', height: '140px', objectFit: 'cover', borderRadius: '20px', marginBottom: '20px'}}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div style={{width: '140px', height: '140px', borderRadius: '20px', background: '#f0f0f0', display: 'none', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'}}>
              <i className="fas fa-box" style={{fontSize: '56px', color: '#999'}}></i>
            </div>
            <h2 style={{fontSize: '28px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px'}}>
              {product.product_name || 'Unknown Product'}
            </h2>
            <p style={{fontSize: '16px', color: '#666', marginBottom: '8px'}}>
              {product.brands || 'Unknown Brand'}
            </p>
            <p style={{fontSize: '14px', color: '#999', marginBottom: '16px'}}>
              Barcode: {barcode}
            </p>
            <div style={{display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#e8f5e8', color: '#2e7d32', borderRadius: '25px', fontSize: '14px', fontWeight: '600'}}>
              <i className="fas fa-check-circle" style={{fontSize: '12px'}}></i>
              Product Found Successfully
            </div>
          </div>
          
          {/* Health Scores */}
          <div style={{marginBottom: '28px'}}>
            <h3 style={{fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1a1a1a'}}>Health Scores</h3>
            <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
              {/* Nutri-Score */}
              {product.nutriscore_grade && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '25px',
                  background: getNutriScoreColor(product.nutriscore_grade),
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  <span>Nutri-Score</span>
                  <span style={{
                    background: 'rgba(255,255,255,0.9)',
                    color: '#1a1a1a',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    {product.nutriscore_grade.toUpperCase()}
                  </span>
                </div>
              )}
              
              {/* NOVA Group */}
              {product.nova_group && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '25px',
                  background: getNovaInfo(product.nova_group).color,
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600'
                }} title={getNovaInfo(product.nova_group).description}>
                  <span>{getNovaInfo(product.nova_group).label}</span>
                </div>
              )}
              
              {/* Eco-Score */}
              {product.ecoscore_grade && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '25px',
                  background: getNutriScoreColor(product.ecoscore_grade),
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  <i className="fas fa-leaf" style={{fontSize: '12px'}}></i>
                  <span>Eco-Score</span>
                  <span style={{
                    background: 'rgba(255,255,255,0.9)',
                    color: '#1a1a1a',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    {product.ecoscore_grade.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Health Indicators with Traffic Light System */}
          {product.nutriments && (
            <div style={{marginBottom: '28px'}}>
              <h3 style={{fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1a1a1a'}}>Health Indicators (per 100g)</h3>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                {/* Energy */}
                {product.nutriments['energy-kcal_100g'] && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderRadius: '16px',
                    background: '#f8f9fa',
                    border: `3px solid ${getHealthColor('energy', product.nutriments['energy-kcal_100g'])}`
                  }}>
                    <div>
                      <div style={{fontSize: '14px', fontWeight: '600', color: '#1a1a1a'}}>Energy</div>
                      <div style={{fontSize: '12px', color: '#666'}}>kcal</div>
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: getHealthColor('energy', product.nutriments['energy-kcal_100g'])
                    }}>
                      {Math.round(product.nutriments['energy-kcal_100g'])}
                    </div>
                  </div>
                )}
                
                {/* Fat */}
                {product.nutriments['fat_100g'] && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderRadius: '16px',
                    background: '#f8f9fa',
                    border: `3px solid ${getHealthColor('fat', product.nutriments['fat_100g'])}`
                  }}>
                    <div>
                      <div style={{fontSize: '14px', fontWeight: '600', color: '#1a1a1a'}}>Fat</div>
                      <div style={{fontSize: '12px', color: '#666'}}>g</div>
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: getHealthColor('fat', product.nutriments['fat_100g'])
                    }}>
                      {product.nutriments['fat_100g']}
                    </div>
                  </div>
                )}
                
                {/* Sugar */}
                {product.nutriments['sugars_100g'] && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderRadius: '16px',
                    background: '#f8f9fa',
                    border: `3px solid ${getHealthColor('sugar', product.nutriments['sugars_100g'])}`
                  }}>
                    <div>
                      <div style={{fontSize: '14px', fontWeight: '600', color: '#1a1a1a'}}>Sugar</div>
                      <div style={{fontSize: '12px', color: '#666'}}>g</div>
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: getHealthColor('sugar', product.nutriments['sugars_100g'])
                    }}>
                      {product.nutriments['sugars_100g']}
                    </div>
                  </div>
                )}
                
                {/* Salt */}
                {product.nutriments['salt_100g'] && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderRadius: '16px',
                    background: '#f8f9fa',
                    border: `3px solid ${getHealthColor('salt', product.nutriments['salt_100g'])}`
                  }}>
                    <div>
                      <div style={{fontSize: '14px', fontWeight: '600', color: '#1a1a1a'}}>Salt</div>
                      <div style={{fontSize: '12px', color: '#666'}}>g</div>
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: getHealthColor('salt', product.nutriments['salt_100g'])
                    }}>
                      {product.nutriments['salt_100g']}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Complete Nutrition Facts */}
          {product.nutriments && (
            <div style={{marginBottom: '28px'}}>
              <h3 style={{fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1a1a1a'}}>Complete Nutrition Facts (per 100g)</h3>
              <div style={{background: '#f8f9fa', borderRadius: '16px', padding: '20px'}}>
                <div style={{display: 'grid', gap: '12px'}}>
                  {product.nutriments['energy-kcal_100g'] && (
                    <div style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e9ecef'}}>
                      <span style={{color: '#666', fontSize: '16px'}}>Energy</span>
                      <span style={{fontWeight: '600', color: '#1a1a1a', fontSize: '16px'}}>{product.nutriments['energy-kcal_100g']} kcal</span>
                    </div>
                  )}
                  {product.nutriments['fat_100g'] && (
                    <div style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e9ecef'}}>
                      <span style={{color: '#666', fontSize: '16px'}}>Fat</span>
                      <span style={{fontWeight: '600', color: '#1a1a1a', fontSize: '16px'}}>{product.nutriments['fat_100g']}g</span>
                    </div>
                  )}
                  {product.nutriments['saturated-fat_100g'] && (
                    <div style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e9ecef', paddingLeft: '20px'}}>
                      <span style={{color: '#666', fontSize: '14px'}}>- of which saturated</span>
                      <span style={{fontWeight: '600', color: '#1a1a1a', fontSize: '14px'}}>{product.nutriments['saturated-fat_100g']}g</span>
                    </div>
                  )}
                  {product.nutriments['carbohydrates_100g'] && (
                    <div style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e9ecef'}}>
                      <span style={{color: '#666', fontSize: '16px'}}>Carbohydrates</span>
                      <span style={{fontWeight: '600', color: '#1a1a1a', fontSize: '16px'}}>{product.nutriments['carbohydrates_100g']}g</span>
                    </div>
                  )}
                  {product.nutriments['sugars_100g'] && (
                    <div style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e9ecef', paddingLeft: '20px'}}>
                      <span style={{color: '#666', fontSize: '14px'}}>- of which sugars</span>
                      <span style={{fontWeight: '600', color: '#1a1a1a', fontSize: '14px'}}>{product.nutriments['sugars_100g']}g</span>
                    </div>
                  )}
                  {product.nutriments['fiber_100g'] && (
                    <div style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e9ecef'}}>
                      <span style={{color: '#666', fontSize: '16px'}}>Dietary Fiber</span>
                      <span style={{fontWeight: '600', color: '#1a1a1a', fontSize: '16px'}}>{product.nutriments['fiber_100g']}g</span>
                    </div>
                  )}
                  {product.nutriments['proteins_100g'] && (
                    <div style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e9ecef'}}>
                      <span style={{color: '#666', fontSize: '16px'}}>Protein</span>
                      <span style={{fontWeight: '600', color: '#1a1a1a', fontSize: '16px'}}>{product.nutriments['proteins_100g']}g</span>
                    </div>
                  )}
                  {product.nutriments['salt_100g'] && (
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span style={{color: '#666', fontSize: '16px'}}>Salt</span>
                      <span style={{fontWeight: '600', color: '#1a1a1a', fontSize: '16px'}}>{product.nutriments['salt_100g']}g</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Ingredient Analysis Tags */}
          {product.ingredients_analysis_tags && product.ingredients_analysis_tags.length > 0 && (
            <div style={{marginBottom: '28px'}}>
              <h3 style={{fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1a1a1a'}}>Dietary Information</h3>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                {parseIngredientTags(product.ingredients_analysis_tags).map((tag, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: tag.color,
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    <i className={`fas fa-${tag.icon}`} style={{fontSize: '12px'}}></i>
                    <span>{tag.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div style={{display: 'flex', gap: '12px', marginTop: '24px'}}>
            <Link href="/app/scan" style={{flex: 1}}>
              <button style={{
                width: '100%',
                padding: '16px',
                background: '#ff6b35',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}>
                Scan Another Product
              </button>
            </Link>
            <Link href="/app" style={{flex: 1}}>
              <button style={{
                width: '100%',
                padding: '16px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}>
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
