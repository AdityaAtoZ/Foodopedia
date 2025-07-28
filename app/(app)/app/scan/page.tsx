'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BarcodeScanner from './BarcodeScanner';

export default function ScanPage() {
  const router = useRouter();
  const [barcode, setBarcode] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  
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
  

  const startCamera = async () => {
    try {
      setShowCamera(true);
      setCameraError('');
      
      // The BarcodeScanner component will handle camera access
      // This is just for UI state management
    } catch (err) {
      setCameraError('Failed to access camera. Please check permissions.');
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    setShowCamera(false);
    setCameraError('');
    
    // Stop video stream if it exists
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureBarcode = () => {
    // This will be handled by the BarcodeScanner component
    // For now, we'll show a message
    alert('Barcode scanning is being processed...');
  };

  const handleBarcodeDetected = (detectedBarcode: string) => {
    setBarcode(detectedBarcode);
    setShowCamera(false);
    
    // Automatically search for the detected barcode
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 100);
  };

  const handleBarcodeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    
    setIsLoading(true);
    setError('');
    setSearchResult(null);
    
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        // Redirect to product details page
        router.push(`/app/product/${barcode}`);
      } else {
        setError('Product not found. Try a different barcode.');
      }
    } catch (err) {
      setError('Error searching for product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">

      {/* Header */}
      <div className="header">
        <div className="header-top">
          <Link href="/app">
            <button className="menu-btn">
              <i className="fas fa-arrow-left" style={{fontSize: '18px', color: '#6c757d'}}></i>
            </button>
          </Link>
          <h1 style={{fontSize: '20px', fontWeight: '600', color: '#1a1a1a'}}>Scan Barcode</h1>
          <div style={{width: '44px'}}></div>
        </div>

        <div style={{textAlign: 'center', marginBottom: '24px'}}>
          <p style={{fontSize: '16px', color: '#6c757d'}}>Enter a barcode number to get product information</p>
        </div>

        <form onSubmit={handleBarcodeSearch} className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Enter barcode number..." 
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />
          <button type="submit" className="search-icon" style={{background: 'none', border: 'none', cursor: 'pointer'}}>
            <i className="fas fa-search"></i>
          </button>
        </form>
      </div>

      {/* Camera Preview */}
      <div style={{padding: '0 24px', marginBottom: '20px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
          <h3 style={{fontSize: '18px', fontWeight: '600', color: '#1a1a1a'}}>Camera Scan</h3>
          {!showCamera && (
            <button 
              onClick={startCamera}
              style={{
                padding: '8px 16px',
                background: '#ff6b35',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#e55a2b'}
              onMouseOut={(e) => e.currentTarget.style.background = '#ff6b35'}
            >
              <i className="fas fa-camera" style={{fontSize: '12px'}}></i>
              Start Camera
            </button>
          )}
        </div>
        
        <div style={{
          position: 'relative',
          width: '100%',
          height: '300px', // Increased height for better visibility
          borderRadius: '16px',
          overflow: 'hidden',
          background: showCamera ? '#000' : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          border: showCamera ? '4px solid lime' : '2px solid #e9ecef',
          marginBottom: '16px',
          // Debug styles to ensure container is visible
          minHeight: '300px',
          display: 'block',
          // Additional debug styles
          boxSizing: 'border-box'
        }}>
          {!showCamera && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#6c757d'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                border: '3px solid #ff6b35',
                borderTop: '3px solid transparent',
                borderRadius: '50%',
                animation: 'spin 2s linear infinite',
                margin: '0 auto 12px'
              }}></div>
              <p style={{fontSize: '14px', fontWeight: '500'}}>Tap &quot;Start Camera&quot; to begin scanning</p>
            </div>
          )}
          
          {showCamera && (
            <>
              <BarcodeScanner
                onDetected={handleBarcodeDetected}
                debug={true}
                stopOnDetection={true}
              />
              
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  display: 'none' // Hide this as BarcodeScanner handles video
                }}
              />
              
              {/* Scanner Frame Overlay */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '150px',
                height: '100px',
                border: '2px solid #ff6b35',
                borderRadius: '8px',
                background: 'rgba(255, 107, 53, 0.1)'
              }}>
                {/* Corner indicators */}
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  left: '-6px',
                  width: '20px',
                  height: '20px',
                  border: '3px solid #ff6b35',
                  borderRight: 'none',
                  borderBottom: 'none',
                  borderRadius: '4px 0 0 0'
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  width: '20px',
                  height: '20px',
                  border: '3px solid #ff6b35',
                  borderLeft: 'none',
                  borderBottom: 'none',
                  borderRadius: '0 4px 0 0'
                }}></div>
                <div style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: '-6px',
                  width: '20px',
                  height: '20px',
                  border: '3px solid #ff6b35',
                  borderRight: 'none',
                  borderTop: 'none',
                  borderRadius: '0 0 0 4px'
                }}></div>
                <div style={{
                  position: 'absolute',
                  bottom: '-6px',
                  right: '-6px',
                  width: '20px',
                  height: '20px',
                  border: '3px solid #ff6b35',
                  borderLeft: 'none',
                  borderTop: 'none',
                  borderRadius: '0 0 4px 0'
                }}></div>
                
                {/* Animated scan line */}
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #ff6b35, transparent)',
                  animation: 'scanLine 2s ease-in-out infinite'
                }}></div>
              </div>
              
              {/* Camera controls */}
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '12px'
              }}>
                <button 
                  onClick={captureBarcode}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: '#ff6b35',
                    border: '3px solid white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s ease',
                    boxShadow: '0 4px 12px rgba(255, 107, 53, 0.4)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <i className="fas fa-camera" style={{color: 'white', fontSize: '18px'}}></i>
                </button>
                
                <button 
                  onClick={stopCamera}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '2px solid white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                >
                  <i className="fas fa-times" style={{color: 'white', fontSize: '14px'}}></i>
                </button>
              </div>
            </>
          )}
          
          {cameraError && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#f44336',
              padding: '20px'
            }}>
              <i className="fas fa-exclamation-triangle" style={{fontSize: '24px', marginBottom: '8px'}}></i>
              <p style={{fontSize: '14px', fontWeight: '500'}}>{cameraError}</p>
            </div>
          )}
        </div>
      </div>


      {/* Loading and Error States Only */}
      {isLoading && (
        <div style={{padding: '0 24px', marginBottom: '20px'}}>
          <div style={{textAlign: 'center', padding: '40px'}}>
            <div style={{display: 'inline-block', width: '40px', height: '40px', border: '4px solid #ff6b35', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
            <p style={{marginTop: '16px', color: '#666', fontSize: '16px'}}>Searching for product...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div style={{padding: '0 24px', marginBottom: '20px'}}>
          <div style={{textAlign: 'center', padding: '20px', background: '#ffebee', borderRadius: '16px', border: '2px solid #f44336'}}>
            <i className="fas fa-exclamation-triangle" style={{color: '#f44336', fontSize: '32px', marginBottom: '12px'}}></i>
            <p style={{color: '#d32f2f', fontWeight: '600', fontSize: '16px'}}>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
