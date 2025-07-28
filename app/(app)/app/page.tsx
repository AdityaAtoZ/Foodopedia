'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [bookmarks, setBookmarks] = useState<{[key: string]: boolean}>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError('');
    setSearchResult(null);
    
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${searchQuery}.json`);
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        setSearchResult(data.product);
      } else {
        setError('Product not found. Try a different barcode.');
      }
    } catch (err) {
      setError('Error searching for product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookmark = (productId: string) => {
    setBookmarks(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleProductClick = (barcode: string) => {
    setSearchQuery(barcode);
    // Automatically trigger search
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 100);
  };

  const categories = [
    { name: 'All', icon: 'fas fa-utensils' },
    { name: 'Snacks', icon: 'fas fa-cheese' },
    { name: 'Bakery', icon: 'fas fa-bread-slice' },
    { name: 'Fruits', icon: 'fas fa-apple-alt' }
  ];

  const products = [
    {
      id: '1',
      barcode: '3017620422003',
      name: 'Nutella',
      brand: 'Ferrero',
      image: 'https://dayli.in/cdn/shop/files/nutella-chocolate-hazelnut-cocoa-spread-500x500.webp?v=1729167238',
      status: 'check',
      statusText: 'Allowed',
      recommended: true
    },
    {
      id: '2', 
      barcode: '8901058000290',
      name: 'Maggi Noodles',
      brand: 'Nestlé',
      image: 'https://myfoodstory.com/wp-content/uploads/2022/12/masala-maggi-3.jpg',
      status: 'check',
      statusText: 'Allowed',
      recommended: false
    },
    {
      id: '3',
      barcode: '7622300744663',
      name: 'Oreo Cookies', 
      brand: 'Nabisco',
      image: 'https://images-cdn.ubuy.co.in/63400cf17b78775be96f2c30-oreo-chocolate-sandwich-cookies-family.jpg',
      status: 'B',
      statusText: 'Allowed',
      recommended: false
    },
    {
      id: '4',
      barcode: '04965802',
      name: 'Diet Coke',
      brand: 'Coca-Cola',
      image: 'https://images.jdmagicbox.com/quickquotes/images_main/diet-coke-soft-drinks-13-01-2021-011-220012146-i7i2rufr.jpg',
      status: 'C',
      statusText: 'Moderate',
      recommended: false
    }
  ];

  return (
    <div className="app-container">

      {/* Header */}
      <div className="header">
        <div className="header-top">
          <button className="menu-btn">
            <i className="fas fa-bars" style={{fontSize: '18px', color: '#6c757d'}}></i>
          </button>
          <button className="profile-btn">
            <i className="fas fa-user" style={{fontSize: '18px', color: '#6c757d'}}></i>
          </button>
        </div>

        <div className="greeting">
          <div className="greeting-title">Healthy and<br />Delicious Food</div>
          <div className="greeting-subtitle">
            <i className="fas fa-hand-paper" style={{color: '#ff6b35'}}></i>
            Eat healthy and tasty food with us.
          </div>
        </div>

        <form onSubmit={handleSearch} className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Enter barcode number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-icon" style={{background: 'none', border: 'none', cursor: 'pointer'}}>
            <i className="fas fa-search"></i>
          </button>
          <Link href="/app/scan">
            <i className="fas fa-barcode barcode-icon"></i>
          </Link>
        </form>
      </div>

      {/* Search Results */}
      {(isLoading || error || searchResult) && (
        <div className="search-results" style={{padding: '0 24px', marginBottom: '20px'}}>
          {isLoading && (
            <div style={{textAlign: 'center', padding: '20px'}}>
              <div style={{display: 'inline-block', width: '20px', height: '20px', border: '2px solid #ff6b35', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
              <p style={{marginTop: '10px', color: '#666'}}>Searching...</p>
            </div>
          )}
          
          {error && (
            <div style={{textAlign: 'center', padding: '20px', background: '#ffebee', borderRadius: '12px', border: '1px solid #f44336'}}>
              <i className="fas fa-exclamation-triangle" style={{color: '#f44336', fontSize: '24px', marginBottom: '10px'}}></i>
              <p style={{color: '#d32f2f', fontWeight: '500'}}>{error}</p>
            </div>
          )}
          
          {searchResult && (
            <div style={{background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '2px solid #4caf50'}}>
              <div style={{textAlign: 'center', marginBottom: '16px'}}>
                <img 
                  src={searchResult.image_url || searchResult.image_front_url} 
                  alt={searchResult.product_name}
                  style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', marginBottom: '12px'}}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div style={{width: '80px', height: '80px', borderRadius: '12px', background: '#f0f0f0', display: 'none', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'}}>
                  <i className="fas fa-box" style={{fontSize: '32px', color: '#999'}}></i>
                </div>
                <h3 style={{fontSize: '18px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px'}}>
                  {searchResult.product_name || 'Unknown Product'}
                </h3>
                <p style={{fontSize: '14px', color: '#666', marginBottom: '12px'}}>
                  {searchResult.brands || 'Unknown Brand'}
                </p>
                <div style={{display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#e8f5e8', color: '#2e7d32', borderRadius: '16px', fontSize: '12px', fontWeight: '600'}}>
                  <i className="fas fa-check-circle" style={{fontSize: '10px'}}></i>
                  Product Found
                </div>
              </div>
              
              {searchResult.nutriments && (
                <div style={{marginTop: '16px'}}>
                  <h4 style={{fontSize: '16px', fontWeight: '600', marginBottom: '12px'}}>Nutrition Facts (per 100g)</h4>
                  <div style={{display: 'grid', gap: '8px'}}>
                    {searchResult.nutriments['energy-kcal_100g'] && (
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span>Energy</span>
                        <span style={{fontWeight: '600'}}>{searchResult.nutriments['energy-kcal_100g']} kcal</span>
                      </div>
                    )}
                    {searchResult.nutriments['fat_100g'] && (
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span>Fat</span>
                        <span style={{fontWeight: '600'}}>{searchResult.nutriments['fat_100g']}g</span>
                      </div>
                    )}
                    {searchResult.nutriments['carbohydrates_100g'] && (
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span>Carbohydrates</span>
                        <span style={{fontWeight: '600'}}>{searchResult.nutriments['carbohydrates_100g']}g</span>
                      </div>
                    )}
                    {searchResult.nutriments['proteins_100g'] && (
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span>Protein</span>
                        <span style={{fontWeight: '600'}}>{searchResult.nutriments['proteins_100g']}g</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <button 
                onClick={() => setSearchResult(null)} 
                style={{marginTop: '16px', width: '100%', padding: '10px', background: '#ff6b35', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'}}
                onMouseOver={(e) => e.currentTarget.style.background = '#e55a2b'}
                onMouseOut={(e) => e.currentTarget.style.background = '#ff6b35'}
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        <div className="category-tabs">
          {categories.map((category) => (
            <button 
              key={category.name}
              className={`category-tab ${activeCategory === category.name ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.name)}
            >
              <i className={category.icon} style={{fontSize: '14px'}}></i>
              {category.name}
            </button>
          ))}
        </div>

        <div className="section-header">
          <div className="section-title">Recommended</div>
        </div>

        <div className="products-grid">
          {products.map((product) => (
            <div 
              key={product.id} 
              className={`product-card ${product.recommended ? 'recommended' : ''}`}
              onClick={() => handleProductClick(product.barcode)}
              style={{cursor: 'pointer'}}
            >
              <button 
                className={`bookmark-btn ${bookmarks[product.id] ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(product.id);
                }}
              >
                <i className={`${bookmarks[product.id] ? 'fas' : 'far'} fa-bookmark`} style={{fontSize: '14px', color: bookmarks[product.id] ? 'white' : '#6c757d'}}></i>
              </button>
              <div className="product-image-container">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="product-image" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const icon = e.currentTarget.nextElementSibling as HTMLElement;
                    if (icon) icon.style.display = 'flex';
                  }}
                />
                <i className="fas fa-cookie-bite product-icon" style={{display: 'none'}}></i>
                <div className="product-status">
                  {product.status === 'check' ? (
                    <i className="fas fa-check" style={{fontSize: '10px'}}></i>
                  ) : (
                    product.status
                  )}
                </div>
              </div>
              <div className="product-info">
                <div className="product-brand">{product.brand}</div>
                <div className="product-name">{product.name}</div>
                <div className="product-status-text" style={{color: product.statusText === 'Moderate' ? '#ff9800' : '#4caf50'}}>
                  <i className={`fas ${product.statusText === 'Moderate' ? 'fa-exclamation-triangle' : 'fa-check-circle'}`} style={{fontSize: '10px'}}></i>
                  {product.statusText}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scan FAB */}
      <Link href="/app/scan" className="scan-fab">
        <i className="fas fa-qrcode scan-icon"></i>
      </Link>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="nav-item active">
          <i className="fas fa-home nav-icon"></i>
        </div>
        <div className="nav-item">
          <i className="fas fa-shopping-basket nav-icon"></i>
        </div>
      </div>
    </div>
  );
}
