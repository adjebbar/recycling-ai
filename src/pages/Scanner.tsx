"use client";

import { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { useUser } from '@/context/UserContext';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CameraOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const POINTS_PER_BOTTLE = 10;

// List of tags that identify a plastic bottle
const plasticBottleTags = [
  'en:plastic-bottle',
  'fr:bouteille-en-plastique',
];

const isPlasticBottle = (tags: string[]): boolean => {
  if (!tags || tags.length === 0) return false;

  // Check for specific, reliable tags first
  if (tags.some(tag => plasticBottleTags.includes(tag))) {
    return true;
  }

  // Fallback for more generic tags
  const hasPlastic = tags.some(tag => tag.includes('plastic'));
  const hasBottle = tags.some(tag => tag.includes('bottle') || tag.includes('bouteille'));
  const hasGlass = tags.some(tag => tag.includes('glass') || tag.includes('verre'));

  // It's a plastic bottle if it has plastic and bottle tags, but not glass
  return hasPlastic && hasBottle && !hasGlass;
};


const ScannerPage = () => {
  const { addPoints } = useUser();
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');

  const processBarcode = async (barcode: string) => {
    if (!barcode) return;

    if (barcode === lastScanned) {
      return;
    }
    
    setLastScanned(barcode);
    const loadingToast = showLoading('Checking barcode...');

    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      dismissToast(loadingToast);

      if (data.status === 1 && data.product) {
        const tags = data.product.packaging_tags || [];
        if (isPlasticBottle(tags)) {
          addPoints(POINTS_PER_BOTTLE);
          showSuccess(`Plastic bottle detected! +${POINTS_PER_BOTTLE} points.`);
        } else {
          showError('This item is not a recognized plastic bottle.');
        }
      } else {
        showError('Product not found in the database.');
        // Here we would add logic to save the new product.
      }
    } catch (err) {
      dismissToast(loadingToast);
      showError('Could not connect to the product database.');
      console.error(err);
    } finally {
      setTimeout(() => setLastScanned(null), 3000);
    }
  };

  const handleScanResult = (result: any, error: any) => {
    if (!!result) {
      const barcode = result.getText();
      processBarcode(barcode);
    }

    if (!!error) {
      // console.info(error);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processBarcode(manualBarcode.trim());
    setManualBarcode('');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Scan Barcode</h1>
      <p className="text-muted-foreground text-center mb-6">Center a product's barcode in the frame to scan it.</p>
      
      <Card className="max-w-lg mx-auto overflow-hidden">
        <CardContent className="p-0">
          <QrReader
            onResult={handleScanResult}
            constraints={{ facingMode: 'environment' }}
            videoContainerStyle={{ paddingTop: '75%' }} // 4:3 aspect ratio
            videoStyle={{ objectFit: 'cover' }}
            ViewFinder={() => (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <div className="w-3/4 h-1/2 border-4 border-white/50 rounded-lg shadow-lg" />
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Card className="max-w-lg mx-auto mt-6">
        <CardHeader>
          <CardTitle>Or Enter Barcode Manually</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleManualSubmit} className="flex space-x-2">
            <Input
              type="text"
              placeholder="Enter barcode number"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
            />
            <Button type="submit">Check</Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground flex items-center justify-center">
          <CameraOff className="w-4 h-4 mr-2" />
          If the camera doesn't appear, please grant camera permissions in your browser settings.
        </p>
      </div>
    </div>
  );
};

export default ScannerPage;