
import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScanBarcode, Book, X, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ISBNScannerProps {
  onScan: (isbn: string) => void;
  onClose: () => void;
}

const BetterISBNScanner: React.FC<ISBNScannerProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerContainerId = "better-isbn-scanner";
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [hasError, setHasError] = useState(false);
  const scannerDivRef = useRef<HTMLDivElement>(null);

  // This prevents multiple instances of the scanner
  const initializeScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }

    setHasError(false);
    setScanning(true);

    // Add a small delay to ensure the DOM element exists
    setTimeout(() => {
      try {
        if (!document.getElementById(scannerContainerId)) {
          throw new Error(`HTML Element with id=${scannerContainerId} not found`);
        }
        
        scannerRef.current = new Html5QrcodeScanner(
          scannerContainerId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13], // For ISBN barcodes
            rememberLastUsedCamera: true,
          },
          false
        );

        scannerRef.current.render(
          (decodedText) => {
            const isbnRegex = /^(?:\d{10}|\d{13})$/;
            if (isbnRegex.test(decodedText)) {
              // Process scan only once
              if (scannerRef.current) {
                scannerRef.current.clear();
                scannerRef.current = null;
                setScanning(false);
                onScan(decodedText);
              }
            } else {
              // Only show one error toast for invalid ISBN
              if (!hasError) {
                setHasError(true);
                toast({
                  title: "No es un ISBN válido",
                  description: "El código escaneado no parece ser un ISBN válido",
                  variant: "destructive",
                });
              }
            }
          },
          (error) => {
            // We'll handle errors at component level, not in the callback
            console.error("Scanner error:", error);
          }
        );
      } catch (err) {
        console.error("Error initializing scanner:", err);
        setHasError(true);
        setScanning(false);
        toast({
          title: "Error del escáner",
          description: "No se pudo iniciar el escáner. Asegúrate de permitir el acceso a la cámara.",
          variant: "destructive",
        });
      }
    }, 100); // Small delay to ensure DOM is ready
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanning(false);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ScanBarcode className="h-5 w-5 mr-2" />
          Escanear ISBN
        </CardTitle>
        <CardDescription>
          Escanea el código de barras del libro con la cámara
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" size="sm" onClick={onClose} className="absolute right-2 top-2">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {scanning ? (
          <div id={scannerContainerId} ref={scannerDivRef} className="w-full min-h-[300px]" />
        ) : (
          <div className="text-center py-8 space-y-4">
            <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              El escáner utilizará la cámara de tu dispositivo para leer el código ISBN del libro.
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center p-6 pt-0">
        {scanning ? (
          <Button variant="outline" onClick={stopScanner} className="w-full">
            Detener Cámara
          </Button>
        ) : (
          <Button onClick={initializeScanner} className="w-full">
            Iniciar Cámara
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BetterISBNScanner;
