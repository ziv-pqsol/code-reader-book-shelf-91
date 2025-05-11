
import React, { useState } from 'react';
import { useLibrary } from '@/context/LibraryContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ExtendReturnDateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  currentReturnDate?: string;
}

const ExtendReturnDateDialog: React.FC<ExtendReturnDateDialogProps> = ({
  open,
  onOpenChange,
  bookId,
  currentReturnDate
}) => {
  const { extendReturnDate } = useLibrary();
  const [days, setDays] = useState<number>(5);

  const handleExtend = () => {
    extendReturnDate(bookId, days);
    onOpenChange(false);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  const getNewDate = () => {
    if (!currentReturnDate) return "N/A";
    try {
      const date = new Date(currentReturnDate);
      date.setDate(date.getDate() + days);
      return formatDate(date.toISOString());
    } catch (e) {
      return "Fecha inválida";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Extender Fecha de Devolución</DialogTitle>
          <DialogDescription>
            Extender el plazo de devolución del libro.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Fecha de devolución actual</p>
            <p className="text-sm">{formatDate(currentReturnDate)}</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Días a extender</label>
            <div className="flex items-center space-x-2">
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDays(Math.max(1, days - 1))}
              >
                -
              </Button>
              <Input
                type="number"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 0)}
                className="text-center w-20"
                min={1}
              />
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDays(days + 1)}
              >
                +
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Nueva fecha de devolución</p>
            <p className="text-sm font-bold">{getNewDate()}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExtend}>
            Confirmar extensión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExtendReturnDateDialog;
