"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CameraOff, Keyboard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BarcodeScanner from '@/components/BarcodeScanner';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const POINTS_PER_BOTTLE = 10;

const isPlasticBottle = (product: {
  packaging_tags?: string[];
  packaging?: string;
  packaging_en?: string;
  packagings?: { material?: string; shape?: string }[];
  product_name?: string;
  generic_name?: string;
  categories_tags?: string[];
}): boolean => {
  if (!product) return false;

  const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Gather all relevant text fields into one array
  const allTextSources = [
    product.packaging || '',
    product.packaging_en || '',
    product.product_name || '',
    product.generic_name || '',
    ...(product.packaging_tags || []),
    ...(product.categories_tags || []),
    ...(product.packagings?.map(p => `${p.material || ''} ${p.shape || ''}`) || [])
  ].map(normalize);

  const combinedString = allTextSources.join(' ');

  const bottleKeywords = ['bottle', 'bouteille', 'botella', 'beverage', 'water', 'soda', 'juice', 'drink'];
  const plasticKeywords = ['plastic', 'plastique', 'plastico', 'pet', 'hdpe'];
  const glassKeywords = ['glass', 'verre', 'vidrio'];

  const isLikelyBottle = bottleKeywords.some(kw => combinedString.includes(kw));
  const isLikelyPlastic = plasticKeywords.some(kw => combinedString.includes(kw));
  const isNotGlass = !glassKeywords.some(kw => combinedString.includes(kw));

  // If packaging is explicitly mentioned, it's a strong signal.
  if (isLikelyPlastic && isLikelyBottle) {
    return isNotGlass;
  }
  
  // Fallback for when 'plastic' isn't mentioned but it's a beverage not in glass.
  if (isLikelyBottle && isNotGlass) {
    return true;
  }

  return false;
};


const ScannerPage = () => {
  const { t } = useTranslation();
  const { addPoints, user } = useAuth();
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const navigate = useNavigate();

  const processBarcode = async (barcode: string) => {
    if (!barcode || barcode === lastScanned) {
      return;
    }
    
    setLastScanned(barcode);
    const loadingToast = showLoading(t('scanner.verifying'));

    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      dismissToast(loadingToast);

      if (data.status === 1 && data.product) {
        if (isPlasticBottle(data.product)) {
          await addPoints(POINTS_PER_BOTTLE, barcode);
          showSuccess(t('scanner.success', { points: POINTS_PER_BOTTLE }));
          
          if (!user) {
            const hasShownToast = sessionStorage.getItem('signupToastShown');
            if (!hasShownToast) {
              setTimeout(() => {
                toast.info(t('scanner.signupPromptTitle'), {
                  description: t('scanner.signupPromptDescription'),
                  action: {
                    label: t('nav.signup'),
                    onClick: () => navigate('/signup'),
                  },
                  duration: 10000,
                });
                sessionStorage.setItem('signupToastShown', 'true');
              }, 1500);
            }
          }
        } else {
          showError(t('scanner.notPlastic'));
        }
      } else {
        showError(t('scanner.notFound'));
      }
    } catch (err) {
      dismissToast(loadingToast);
      showError(t('scanner.connectionError'));
      console.error(err);
    } finally {
      setTimeout(() => setLastScanned(null), 3000);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processBarcode(manualBarcode.trim());
    setManualBarcode('');
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center animate-fade-in-up">
      <div className="text-center max-w-lg w-full">
        <h1 className="text-3xl font-bold mb-4">{t('scanner.title')}</h1>
        <p className="text-muted-foreground mb-6">{t('scanner.subtitle')}</p>
      </div>
      
      <Tabs defaultValue="camera" className="w-full max-w-lg">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="camera">
            <Camera className="mr-2 h-4 w-4" />
            {t('scanner.cameraTab')}
          </TabsTrigger>
          <TabsTrigger value="manual">
            <Keyboard className="mr-2 h-4 w-4" />
            {t('scanner.manualTab')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="camera">
          <Card className="overflow-hidden bg-card/60 backdrop-blur-md">
            <CardContent className="p-4">
              <BarcodeScanner onScanSuccess={processBarcode} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="manual">
          <Card className="bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>{t('scanner.manualTitle')}</CardTitle>
              <CardDescription>{t('scanner.manualDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualSubmit} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder={t('scanner.manualPlaceholder')}
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                />
                <Button type="submit">{t('scanner.manualButton')}</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-center mt-6 max-w-lg w-full">
        <p className="text-sm text-muted-foreground flex items-center justify-center">
          <CameraOff className="w-4 h-4 mr-2" />
          {t('scanner.cameraPermission')}
        </p>
      </div>
    </div>
  );
};

export default ScannerPage;