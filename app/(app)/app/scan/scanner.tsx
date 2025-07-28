"use client";

import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';

export default function Scanner({ handleResult }: { handleResult: (b: string) => void }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState(true);
  const [cameraAccess, setCameraAccess] = useState(false);
  const [barcodeDetectorSupported, setBarcodeDetectorSupported] = useState(true);
  const [manualBarcode, setManualBarcode] = useState('');

  // Check if BarcodeDetector is supported
  useEffect(() => {
    setBarcodeDetectorSupported(isBarcodeDetectorAvailable());
  }, []);

  // Handle camera stream
  useEffect(() => {
    if (videoRef?.current && status) {
      startStream();
      return () => stopStream();
    }
  }, [status]);

  // Start camera stream when access is granted
  useEffect(() => {
    if (cameraAccess && isBarcodeDetectorAvailable()) {
      runBarcodeDetection();
    }
  }, [cameraAccess]);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'environment',
          height: frameRef.current?.offsetWidth || 300,
          width: frameRef.current?.offsetHeight || 300
        }
      });
      
      if (videoRef.current) {
        setCameraAccess(true);
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraAccess(false);
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleManualScan = () => {
    if (manualBarcode) {
      handleResult(manualBarcode);
      setManualBarcode('');
    }
  };

  const runBarcodeDetection = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const { videoWidth, videoHeight } = videoRef.current;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const barcodeDetector = new (window as any).BarcodeDetector({
      formats: ['upc_a', 'ean_8', 'ean_13']
    });

    if (!barcodeDetector) {
      setBarcodeDetectorSupported(false);
      return;
    }

    const detectInterval = setInterval(async () => {
      try {
        const barcodes = await barcodeDetector.detect(videoRef.current);
        
        if (barcodes.length > 0) {
          clearInterval(detectInterval);
          
          // Draw detection box
          ctx.clearRect(0, 0, videoWidth, videoHeight);
          ctx.drawImage(videoRef.current!, 0, 0, videoWidth, videoHeight);
          ctx.beginPath();
          ctx.lineWidth = 3;
          ctx.strokeStyle = "red";
          const points = barcodes[0].cornerPoints;
          ctx.moveTo(points[0].x, points[0].y);
          points.slice(1).forEach((point: { x: number; y: number }) => ctx.lineTo(point.x, point.y));
          ctx.closePath();
          ctx.stroke();

          // Send result and pause camera
          handleResult(barcodes[0].rawValue);
          setStatus(false);
        }
      } catch (error) {
        console.error('Barcode detection failed:', error);
      }
    }, 1000);

    return () => clearInterval(detectInterval);
  };

  return (
    <div className="space-y-4">
      {/* Camera scanner */}
      <div ref={frameRef} className="relative w-full aspect-square border rounded-2xl overflow-hidden">
        <video ref={videoRef} className="w-full h-full">
          Your browser does not support the video tag.
        </video>
        <canvas ref={canvasRef} className="absolute top-0 left-0" />
        
        {!status && (
          <FontAwesomeIcon
            icon={faClose}
            className="absolute top-0 right-0 m-4 text-2xl text-white cursor-pointer"
            onClick={() => setStatus(true)}
          />
        )}
        
        {!cameraAccess && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center p-3 text-center text-white">
            <p>Camera access is not granted!</p>
            <p>Please allow camera access to scan barcodes.</p>
          </div>
        )}
        
        {cameraAccess && !barcodeDetectorSupported && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center p-3 text-center text-white">
            <p>
              <a href="https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API" className="underline">
                Barcode Detector API
              </a> is not supported by your browser!
            </p>
            <p>Please use Chrome or Opera mobile.</p>
          </div>
        )}
      </div>

      {/* Manual barcode input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter barcode manually (e.g., 3017620422003)"
          value={manualBarcode}
          onChange={(e) => setManualBarcode(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <button
          onClick={handleManualScan}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Scan
        </button>
      </div>
    </div>
  );
}

function isBarcodeDetectorAvailable() {
  return typeof window !== 'undefined' && 'BarcodeDetector' in window;
}

