
import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { QrCode, Book, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ISBNScannerProps {
  onScan: (isbn: string) => void;
  onClose: () => void;
}

const BetterISBNScanner: React.FC<ISBNScannerProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerContainerId = "better-isbn-scanner";
  const { toast } = useToast();

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      scannerContainerId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        formatsToSupport: ['EAN_13'], // For ISBN barcodes
        rememberLastUsedCamera: true,
      },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        const isbnRegex = /^(?:\d{10}|\d{13})$/;
        if (isbnRegex.test(decodedText)) {
          onScan(decodedText);
          if (scannerRef.current) {
            scannerRef.current.clear();
          }
        } else {
          toast({
            title: "No es un ISBN válido",
            description: "El código escaneado no parece ser un ISBN válido",
            variant: "destructive",
          });
        }
      },
      (error) => {
        console.error("Scanner error:", error);
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [onScan, toast]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <QrCode className="h-5 w-5 mr-2" />
            Escanear ISBN
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div id={scannerContainerId} className="w-full min-h-[300px]" />
      </CardContent>
      
      <CardFooter className="flex justify-center p-6 pt-0">
        <p className="text-sm text-muted-foreground text-center">
          Alinea el código ISBN del libro con el escáner
        </p>
      </CardFooter>
    </Card>
  );
};

export default BetterISBNScanner;
