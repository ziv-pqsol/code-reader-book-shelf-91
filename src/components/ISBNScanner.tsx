
import React, { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ScanBarcode, Book, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ISBNScannerProps {
  onScan: (isbn: string) => void;
  onClose: () => void;
}

const ISBNScanner: React.FC<ISBNScannerProps> = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerContainerId = "isbn-scanner";
  const { toast } = useToast();

  useEffect(() => {
    if (scanning) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        try {
          // Initialize the scanner
          scannerRef.current = new Html5QrcodeScanner(
            scannerContainerId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              rememberLastUsedCamera: true,
            },
            /* verbose= */ false
          );

          scannerRef.current.render(
            (decodedText) => {
              // Check if it's a valid ISBN (simple numeric check for now)
              const isbnRegex = /^(?:\d{10}|\d{13})$/;
              
              if (isbnRegex.test(decodedText)) {
                onScan(decodedText);
                stopScanner();
              } else {
                toast({
                  title: "No es un ISBN válido",
                  description: "El código escaneado no parece ser un ISBN. Por favor, inténtalo de nuevo.",
                  variant: "destructive",
                });
              }
            },
            (errorMessage) => {
              console.error("Scanner error:", errorMessage);
            }
          );
        } catch (err) {
          console.error("Error initializing scanner:", err);
          setScanning(false);
          toast({
            title: "Error del escáner",
            description: "No se pudo iniciar el escáner. Asegúrate de permitir el acceso a la cámara.",
            variant: "destructive",
          });
        }
      }, 100);
    }

    return () => {
      stopScanner();
    };
  }, [scanning, onScan, toast]);

  const startScanner = () => {
    setScanning(true);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanning(false);
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

        {!scanning ? (
          <div className="text-center py-8 space-y-4">
            <Book className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              El escáner utilizará la cámara de tu dispositivo para leer el código ISBN del libro.
            </p>
          </div>
        ) : (
          <div id={scannerContainerId} className="w-full min-h-[300px]"></div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center space-x-2 p-6 pt-0">
        {!scanning ? (
          <Button onClick={startScanner} className="w-full">
            Iniciar Escáner
          </Button>
        ) : (
          <Button variant="outline" onClick={stopScanner} className="w-full">
            Detener Escáner
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ISBNScanner;
