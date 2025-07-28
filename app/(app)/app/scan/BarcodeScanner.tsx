import { useEffect, useRef, useState } from 'react';

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  debug?: boolean;
  stopOnDetection?: boolean;
}

interface DetectedBarcode {
  rawValue: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected, debug = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<BarcodeDetector | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectedRef = useRef<boolean>(false);
  const [detectedBarcodes, setDetectedBarcodes] = useState<DetectedBarcode[]>([]);

  // Draw debug overlay with bounding boxes
  const drawDebugOverlay = () => {
    if (!debug || !canvasRef.current || !videoRef.current || detectedBarcodes.length === 0) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw bounding boxes
    detectedBarcodes.forEach(barcode => {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.strokeRect(
        barcode.boundingBox.x,
        barcode.boundingBox.y,
        barcode.boundingBox.width,
        barcode.boundingBox.height
      );
      
      // Draw barcode text
      ctx.fillStyle = '#00ff00';
      ctx.font = '16px Arial';
      ctx.fillText(
        barcode.rawValue,
        barcode.boundingBox.x,
        barcode.boundingBox.y - 5
      );
    });
  };

  // Update debug overlay when barcodes change
  useEffect(() => {
    if (debug) {
      drawDebugOverlay();
    }
  }, [detectedBarcodes, debug]);

  useEffect(() => {
    // Start Camera and Barcode Detector
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }

        if ('BarcodeDetector' in window) {
          detectorRef.current = new BarcodeDetector({ formats: ['ean_13', 'upc_a', 'upc_e', 'ean_8'] });
          detectBarcodes();
        } else {
          console.error('Barcode Detector not supported');
        }
      } catch (err) {
        console.error('Camera not accessible', err);
      }
    };

    const detectBarcodes = async () => {
      if (detectorRef.current && videoRef.current) {
        try {
          const barcodes = await detectorRef.current.detect(videoRef.current);
          
          // Update detected barcodes state for debug overlay
          if (debug) {
            const detectedBarcodeData: DetectedBarcode[] = barcodes.map(barcode => ({
              rawValue: barcode.rawValue,
              boundingBox: {
                x: barcode.boundingBox.x,
                y: barcode.boundingBox.y,
                width: barcode.boundingBox.width,
                height: barcode.boundingBox.height
              }
            }));
            setDetectedBarcodes(detectedBarcodeData);
          }
          
if (barcodes.length > 0 && !detectedRef.current) {
            detectedRef.current = true;
            const barcodeText = barcodes[0].rawValue;
            onDetected(barcodeText);
            if (stopOnDetection && streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop()); // Stop the camera stream
            }
            setTimeout(() => detectedRef.current = false, 2000); // reset flag after delay
          }
        } catch (err) {
          console.error('Barcode detection error', err);
        }
        requestAnimationFrame(detectBarcodes);
      }
    };

    startCamera();

    // Cleanup
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [onDetected]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        style={{ width: '100%', height: 'auto', border: '1px solid lightgray' }}
      />
      {debug && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10
          }}
        />
      )}
    </div>
  );
};

export default BarcodeScanner;
