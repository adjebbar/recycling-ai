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

const POINTS_PER_BOTTLE = 10;

// Définir la structure d'un article d'emballage de l'API
interface Packaging {
  material?: string;
  shape?: string;
}

// Fonction mise à jour pour vérifier les bouteilles en plastique en fonction des détails de l'emballage
const isPlasticBottle = (packagings: Packaging[]): boolean => {
  if (!packagings || packagings.length === 0) {
    return false;
  }

  // Vérifier si un article d'emballage est une bouteille faite d'un matériau plastique
  return packagings.some(pkg => {
    const shape = pkg.shape?.toLowerCase() || '';
    const material = pkg.material?.toLowerCase() || '';

    const isBottleShape = shape.includes('bottle') || shape.includes('bouteille');
    const isPlasticMaterial = material.includes('plastic') || material.includes('pet') || material.includes('hdpe');
    const isNotGlass = !material.includes('glass') && !material.includes('verre');

    return isBottleShape && isPlasticMaterial && isNotGlass;
  });
};


const ScannerPage = () => {
  const { addPoints, user } = useAuth();
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const navigate = useNavigate();

  const processBarcode = async (barcode: string) => {
    if (!barcode || barcode === lastScanned) {
      return;
    }
    
    setLastScanned(barcode);
    const loadingToast = showLoading('Vérification du code-barres...');

    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      dismissToast(loadingToast);

      if (data.status === 1 && data.product) {
        const packagings = data.product.packagings || [];
        if (isPlasticBottle(packagings)) {
          await addPoints(POINTS_PER_BOTTLE, barcode);
          showSuccess(`Bouteille en plastique détectée ! +${POINTS_PER_BOTTLE} points.`);
          
          if (!user) {
            setTimeout(() => {
              toast.info("Voulez-vous sauvegarder votre progression ?", {
                description: "Inscrivez-vous pour suivre votre score et obtenir des récompenses.",
                action: {
                  label: "S'inscrire",
                  onClick: () => navigate('/signup'),
                },
                duration: 5000,
              });
            }, 1500);
          }
        } else {
          showError("Cet article n'est pas une bouteille en plastique reconnue.");
        }
      } else {
        showError('Produit non trouvé dans la base de données.');
      }
    } catch (err) {
      dismissToast(loadingToast);
      showError('Impossible de se connecter à la base de données des produits.');
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
    <div className="container mx-auto p-4 flex flex-col items-center">
      <div className="text-center max-w-lg w-full">
        <h1 className="text-3xl font-bold mb-4">Scanner le code-barres</h1>
        <p className="text-muted-foreground mb-6">Choisissez une méthode pour scanner le code-barres d'un produit.</p>
      </div>
      
      <Tabs defaultValue="camera" className="w-full max-w-lg">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="camera">
            <Camera className="mr-2 h-4 w-4" />
            Caméra
          </TabsTrigger>
          <TabsTrigger value="manual">
            <Keyboard className="mr-2 h-4 w-4" />
            Manuel
          </TabsTrigger>
        </TabsList>
        <TabsContent value="camera">
          <Card className="overflow-hidden bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <BarcodeScanner onScanSuccess={processBarcode} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="manual">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Entrez le code-barres</CardTitle>
              <CardDescription>Entrez le numéro sous le code-barres et cliquez sur Vérifier.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualSubmit} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Entrez le numéro du code-barres"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                />
                <Button type="submit">Vérifier</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-center mt-6 max-w-lg w-full">
        <p className="text-sm text-muted-foreground flex items-center justify-center">
          <CameraOff className="w-4 h-4 mr-2" />
          Si la caméra n'apparaît pas, veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur.
        </p>
      </div>
    </div>
  );
};

export default ScannerPage;