
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Camera, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimpleISBNScannerProps {
  onScan: (isbn: string) => void;
  onClose: () => void;
}

const SimpleISBNScanner: React.FC<SimpleISBNScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Error",
        description: "No se pudo acceder a la cámara. Por favor, verifica los permisos.",
        variant: "destructive",
      });
    }
  };

  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
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
            <Camera className="h-5 w-5 mr-2" />
            Escanear ISBN
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {isScanning ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <Button 
                variant="secondary" 
                className="absolute bottom-4 right-4"
                onClick={stopScanning}
              >
                Detener Cámara
              </Button>
            </div>
          ) : (
            <Button 
              onClick={startScanning} 
              className="w-full"
            >
              <Camera className="mr-2 h-4 w-4" />
              Iniciar Cámara
            </Button>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                o ingresa manualmente
              </span>
            </div>
          </div>

          <form onSubmit={handleManualInput} className="space-y-2">
            <input
              type="text"
              name="isbn"
              placeholder="Ingresa el ISBN manualmente"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button type="submit" className="w-full">
              Buscar ISBN
            </Button>
          </form>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center p-6 pt-0">
        <p className="text-sm text-muted-foreground text-center">
          Apunta la cámara al código de barras del libro o ingresa el ISBN manualmente
        </p>
      </CardFooter>
    </Card>
  );
};

export default SimpleISBNScanner;
