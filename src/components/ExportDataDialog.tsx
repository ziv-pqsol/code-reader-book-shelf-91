
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileSpreadsheet, Download } from "lucide-react";
import { useLibrary } from "@/context/LibraryContext";
import * as XLSX from 'xlsx';
import { useToast } from "@/hooks/use-toast";

interface ExportDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExportDataDialog = ({ open, onOpenChange }: ExportDataDialogProps) => {
  const { books, students } = useLibrary();
  const { toast } = useToast();
  const [selectedDatasets, setSelectedDatasets] = useState<{ [key: string]: boolean }>({
    students: false,
    books: false,
  });

  const handleCheckboxChange = (dataset: string) => {
    setSelectedDatasets((prev) => ({
      ...prev,
      [dataset]: !prev[dataset],
    }));
  };

  const exportToExcel = () => {
    // Check if anything is selected
    if (!Object.values(selectedDatasets).some(Boolean)) {
      toast({
        title: "Selección requerida",
        description: "Por favor selecciona al menos un conjunto de datos para exportar",
        variant: "destructive",
      });
      return;
    }

    try {
      const workbook = XLSX.utils.book_new();

      // Process Students data if selected
      if (selectedDatasets.students) {
        const studentsData = students.map(student => ({
          ID: student.id,
          Nombre: student.name,
          Código: student.code,
          Grado: student.grade
        }));
        
        const studentsWorksheet = XLSX.utils.json_to_sheet(studentsData);
        XLSX.utils.book_append_sheet(workbook, studentsWorksheet, "Estudiantes");
      }

      // Process Books data if selected
      if (selectedDatasets.books) {
        const booksData = books.map(book => ({
          ID: book.id,
          Título: book.title,
          Autor: book.author,
          Género: book.genre,
          ISBN: book.isbn,
          Disponible: book.available ? "Sí" : "No",
          "Número de clasificación": book.classificationNumber || "",
          "Número de inventario": book.inventoryNumber || "",
          "Prestado a": book.borrowerName || "",
          "Fecha de préstamo": book.borrowedDate || "",
          "Fecha de devolución": book.returnDate || ""
        }));
        
        const booksWorksheet = XLSX.utils.json_to_sheet(booksData);
        XLSX.utils.book_append_sheet(workbook, booksWorksheet, "Libros");
      }

      // Generate and download the Excel file
      const currentDate = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `biblioteca_datos_${currentDate}.xlsx`);

      toast({
        title: "Datos exportados",
        description: "Los datos han sido exportados exitosamente",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al exportar los datos",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Exportar Datos
          </DialogTitle>
          <DialogDescription>
            Selecciona los conjuntos de datos que deseas exportar como archivo Excel.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="students" 
                checked={selectedDatasets.students}
                onCheckedChange={() => handleCheckboxChange("students")}
              />
              <label htmlFor="students" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Base de datos de Estudiantes
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="books" 
                checked={selectedDatasets.books}
                onCheckedChange={() => handleCheckboxChange("books")}
              />
              <label htmlFor="books" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Base de datos de Libros
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={exportToExcel} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Selección
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDataDialog;
