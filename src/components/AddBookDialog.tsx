
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLibrary } from "@/context/LibraryContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Genre } from "@/types";
import { QrCode, Search, Book } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BetterISBNScanner from "./BetterISBNScanner";
import { searchBookByISBN, getCoverUrl, formatAuthor, mapGenre } from "@/services/openLibraryService";

interface AddBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const genres: Genre[] = ["literatura", "ficción", "ciencia", "historia", "arte"];

const formSchema = z.object({
  title: z.string().min(1, {
    message: "El título es obligatorio.",
  }),
  author: z.string().min(1, {
    message: "El autor es obligatorio.",
  }),
  isbn: z.string().min(1, {
    message: "El ISBN es obligatorio.",
  }),
  genre: z.enum(["literatura", "ficción", "ciencia", "historia", "arte"] as const),
  coverUrl: z.string().optional(),
  classificationNumber: z.string().optional(),
  inventoryNumber: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddBookDialog: React.FC<AddBookDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { addBook } = useLibrary();
  const { toast } = useToast();
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentApiSource, setCurrentApiSource] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      genre: "literatura",
      coverUrl: "",
      classificationNumber: "",
      inventoryNumber: "",
    },
  });

  async function onSubmit(values: FormValues) {
    // Ensure all required fields are explicitly set
    const book = {
      ...values,
      available: true,
      // Guarantee that non-optional fields are present
      title: values.title,
      author: values.author,
      isbn: values.isbn,
      genre: values.genre,
      // Optional fields
      classificationNumber: values.classificationNumber || undefined,
      inventoryNumber: values.inventoryNumber || undefined,
      coverUrl: values.coverUrl || undefined,
    };
    
    addBook(book);
    form.reset();
    onOpenChange(false);
  }

  const handleScanISBN = (isbn: string) => {
    setShowScanner(false);
    form.setValue("isbn", isbn);
    searchBookInfo(isbn);
  };

  const searchBookInfo = async (isbn: string) => {
    setLoading(true);
    setCurrentApiSource("buscando");
    
    try {
      const bookData = await searchBookByISBN(isbn);
      
      if (bookData) {
        // Fill form with book data
        form.setValue("title", bookData.title || "");
        form.setValue("author", formatAuthor(bookData.author_name) || "");
        
        if (bookData.subject && bookData.subject.length > 0) {
          form.setValue("genre", mapGenre(bookData.subject));
        }
        
        // Set cover URL from either Open Library or directly from bookData
        if (bookData.cover_i) {
          form.setValue("coverUrl", getCoverUrl(bookData.cover_i) || "");
          setCurrentApiSource("OpenLibrary");
        } else if (bookData.cover_url) {
          form.setValue("coverUrl", bookData.cover_url);
          setCurrentApiSource("Google Books");
        }
        
        toast({
          title: "Información encontrada",
          description: bookData.publisher === 'Fondo de Cultura Económica' ?
            "Se encontró información del libro en FCE." :
            bookData.cover_url?.includes('google') ?
              "Se encontró información del libro en Google Books." :
              "Se encontró información del libro en OpenLibrary.",
        });
      } else {
        setCurrentApiSource(null);
        toast({
          title: "Libro no encontrado",
          description: "No se encontró información en ninguna de las fuentes. Por favor, complete los detalles manualmente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error searching book:", error);
      setCurrentApiSource(null);
      toast({
        title: "Error",
        description: "Hubo un error al buscar la información del libro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = () => {
    const isbn = form.getValues("isbn");
    if (isbn) {
      searchBookInfo(isbn);
    } else {
      toast({
        title: "ISBN requerido",
        description: "Por favor, ingrese un ISBN para buscar.",
        variant: "destructive",
      });
    }
  };

  if (showScanner) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <BetterISBNScanner 
            onScan={handleScanISBN} 
            onClose={() => setShowScanner(false)} 
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir Libro</DialogTitle>
          <DialogDescription>
            Completa el formulario para registrar un nuevo libro.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="isbn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ISBN</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="Ej: 9780123456789" {...field} />
                    </FormControl>
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="outline" 
                      onClick={() => setShowScanner(true)}
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="outline" 
                      onClick={handleSearchClick}
                      disabled={loading}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  {loading && (
                    <p className="text-xs text-muted-foreground mt-1">Buscando en múltiples fuentes...</p>
                  )}
                  {currentApiSource && !loading && currentApiSource !== "buscando" && (
                    <p className="text-xs text-muted-foreground mt-1">Fuente: {currentApiSource}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título del libro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Autor</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del autor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="classificationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clasificación</FormLabel>
                    <FormControl>
                      <Input placeholder="Número de clasificación" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="inventoryNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inventario</FormLabel>
                    <FormControl>
                      <Input placeholder="Número de inventario" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Género</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un género" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre.charAt(0).toUpperCase() + genre.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la portada (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="URL de la imagen de portada" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={loading}>Guardar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBookDialog;
