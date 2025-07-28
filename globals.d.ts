interface BarcodeDetector {
  new (options?: BarcodeDetectorOptions): BarcodeDetector;
  getSupportedFormats(): Promise<string[]>;
  detect(image: CanvasImageSource): Promise<DetectedBarcode[]>;
}

interface BarcodeDetectorOptions {
  formats: string[];
}

interface DetectedBarcode {
  boundingBox: DOMRectReadOnly;
  cornerPoints: DOMPoint[];
  format: string;
  rawValue: string;
}

declare var BarcodeDetector: {
  prototype: BarcodeDetector;
  new (options?: BarcodeDetectorOptions): BarcodeDetector;
};
