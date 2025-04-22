
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ScanBarcode, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface SimpleISBNScannerProps {
  onScan: (isbn: string) => void;
  onClose: () => void;
}

const SimpleISBNScanner: React.FC<SimpleISBNScannerProps> = ({ onScan, onClose }) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerStarted, setScannerStarted] = useState(false);
  const qrScannerId = 'html5-qrcode-scanner';
  const { toast } = useToast();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const startScanner = () => {
    setIsScanning(true);
    setScannerStarted(true);
    setCameraError(null);

    try {
      // If scanner was previously initialized, clear it
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }

      // Remove any existing scanner elements
      const existingElement = document.getElementById(qrScannerId);
      if (existingElement) {
        existingElement.innerHTML = "";
      }

      // Create new scanner
      const html5QrcodeScanner = new Html5QrcodeScanner(
        qrScannerId,
        { 
          fps: 10, 
          qrbox: { width: 250, height: 100 },
          formatsToSupport: [0], // 0 = EAN-13 (ISBN-13)
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
        },
        /* verbose= */ false
      );

      scannerRef.current = html5QrcodeScanner;

      html5QrcodeScanner.render(
        (decodedText) => {
          // Success callback - ISBN barcode detected
          if (decodedText && decodedText.length >= 10) {
            // Clean up non-numeric characters
            const cleanedISBN = decodedText.replace(/[^0-9X]/gi, '');
            // Handle both ISBN-10 and ISBN-13
            if ((cleanedISBN.length === 10 || cleanedISBN.length === 13) && 
                /^(?:\d{10}|\d{13})$/i.test(cleanedISBN)) {
              toast({
                title: "ISBN escaneado",
                description: `Código detectado: ${cleanedISBN}`,
              });
              onScan(cleanedISBN);
            }
          }
        },
        (errorMessage) => {
          // Error callback - continuous scanning, so we don't need to handle most errors
          if (errorMessage.includes("Camera access denied")) {
            setCameraError("Permiso de cámara denegado. Por favor, permita el acceso a la cámara.");
            setIsScanning(false);
            if (scannerRef.current) {
              scannerRef.current.clear().catch(console.error);
            }
            toast({
              title: "Error de cámara",
              description: "Permiso de cámara denegado. Por favor, permita el acceso a la cámara.",
              variant: "destructive",
            });
          }
        }
      );
    } catch (error) {
      console.error('Error starting scanner:', error);
      setCameraError("No se pudo iniciar el escáner. Intente de nuevo o ingrese el ISBN manualmente.");
      setIsScanning(false);
      toast({
        title: "Error de escáner",
        description: "No se pudo iniciar el escáner. Intente de nuevo o ingrese el ISBN manualmente.",
        variant: "destructive",
      });
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      setIsScanning(false);
    }
  };

  const handleManualInput = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem('isbn') as HTMLInputElement;
    const isbn = input.value.trim();
    
    const isbnRegex = /^(?:\d{10}|\d{13})$/;
    if (isbnRegex.test(isbn)) {
      onScan(isbn);
    } else {
      toast({
        title: "ISBN inválido",
        description: "Por favor ingresa un ISBN válido (10 o 13 dígitos)",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <ScanBarcode className="h-5 w-5 mr-2" />
            Escanear ISBN
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Manual input section now first */}
          <form onSubmit={handleManualInput} className="space-y-2">
            <div className="font-medium text-sm mb-2">Ingresa manualmente:</div>
            <input
              type="text"
              name="isbn"
              placeholder="Ingresa el ISBN manualmente (10 o 13 dígitos)"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button type="submit" className="w-full">
              Buscar ISBN
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                o usa la cámara
              </span>
            </div>
          </div>

          {cameraError && (
            <div className="bg-destructive/10 rounded-md p-3 text-sm text-destructive mb-2">
              {cameraError}
            </div>
          )}

          {!isScanning ? (
            <Button 
              onClick={startScanner} 
              className="w-full"
              variant="outline"
            >
              <ScanBarcode className="mr-2 h-4 w-4" />
              Iniciar Cámara
            </Button>
          ) : (
            <div className="space-y-4">
              <div id={qrScannerId} className="w-full"></div>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={stopScanner}
              >
                Detener Cámara
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center p-6 pt-0">
        <p className="text-sm text-muted-foreground text-center">
          Ingresa el ISBN manualmente o usa la cámara para escanear el código de barras
        </p>
      </CardFooter>
    </Card>
  );
};

export default SimpleISBNScanner;
