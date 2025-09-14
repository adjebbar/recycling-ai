"use client";

import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
}

const BarcodeScanner = ({ onScanSuccess, onScanFailure }: BarcodeScannerProps) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader', // The ID of the div element
      {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        supportedScanTypes: [0], // 0 represents CODE_128, EAN_13, etc.
      },
      false // verbose
    );

    scanner.render(onScanSuccess, onScanFailure);

    // Cleanup function to stop the scanner when the component unmounts
    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5-qrcode-scanner.", error);
      });
    };
  }, [onScanSuccess, onScanFailure]);

  return <div id="reader" className="w-full" />;
};

export default BarcodeScanner;