import { useState, useEffect } from 'react';
import { useLibrary } from '@/context/LibraryContext';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, PlusCircle, BookOpen, User, QrCode, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { genreColors } from '@/data/mockData';
import AddBookDialog from '@/components/AddBookDialog';
import ISBNScanner from '@/components/ISBNScanner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const BookGrid = ({ books }: { books: any[] }) => {
  const { deleteBook } = useLibrary();
  const { toast } = useToast();
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);
  
  const handleDeleteBook = (book: any) => {
    if (!book.available) {
      toast({
        title: "No se puede eliminar",
        description: "El libro está prestado actualmente. Devuélvalo primero.",
        variant: "destructive",
      });
      return;
    }
    setBookToDelete(book.id);
  };

  if (books.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <p className="text-lg font-semibold">No se encontraron libros</p>
          <p className="text-muted-foreground">Intenta ajustar tu búsqueda o filtro</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <Card key={book.id} className="overflow-hidden transition-shadow hover:shadow-md h-full">
            <CardContent className="p-0">
              <div className="flex h-full">
                
                <div 
                  className="w-2/5 bg-cover bg-center" 
                  style={{ backgroundImage: `url(${book.coverUrl || 'https://placehold.co/100x150/e5e7eb/a3a3a3?text=Sin+Portada'})` }}
                ></div>
                <div className="w-3/5 p-4 flex flex-col relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteBook(book);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  
                  <div>
                    <Badge 
                      variant="outline"
                      className="mb-2"
                      style={{ 
                        backgroundColor: genreColors[book.genre as keyof typeof genreColors] || '#e5e7eb',
                        borderColor: genreColors[book.genre as keyof typeof genreColors] || '#e5e7eb',
                      }}
                    >
                      {book.genre}
                    </Badge>
                    <h3 className="font-semibold line-clamp-2">{book.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                    <p className="text-xs text-muted-foreground">ISBN: {book.isbn}</p>
                  </div>
                  <div className="mt-auto flex items-center">
                    {book.available ? (
                      <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                        <BookOpen className="h-3 w-3" />
                        Disponible
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200">
                        <User className="h-3 w-3" />
                        Prestado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!bookToDelete} onOpenChange={() => setBookToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el libro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (bookToDelete) {
                  deleteBook(bookToDelete);
                  setBookToDelete(null);
                  toast({
                    title: "Libro eliminado",
                    description: "El libro ha sido eliminado exitosamente",
                  });
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const BooksPage = () => {
  const { books, searchBooks } = useLibrary();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBooks, setFilteredBooks] = useState(books);
  const [activeTab, setActiveTab] = useState(initialFilter);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
  useEffect(() => {
    let result = books;
    
    // Apply tab filters
    if (activeTab === 'available') {
      result = books.filter(book => book.available);
    } else if (activeTab === 'borrowed') {
      result = books.filter(book => !book.available);
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      result = searchBooks(searchQuery).filter(book => {
        if (activeTab === 'available') return book.available;
        if (activeTab === 'borrowed') return !book.available;
        return true;
      });
    }
    
    setFilteredBooks(result);
  }, [searchQuery, books, activeTab, searchBooks]);
  
  const handleScanISBN = (isbn: string) => {
    setShowScanner(false);
    setSearchQuery(isbn);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Libros</h1>
          <p className="text-muted-foreground">Gestionar y ver información de libros</p>
        </div>
        <Button className="sm:self-end" onClick={() => setIsAddBookOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Libro
        </Button>
      </div>
      
      <div className="relative flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, autor o ISBN..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && setSearchQuery(e.currentTarget.value)}
          />
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setShowScanner(true)}
        >
          <QrCode className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="available">Disponibles</TabsTrigger>
          <TabsTrigger value="borrowed">Prestados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <BookGrid books={filteredBooks} />
        </TabsContent>
        
        <TabsContent value="available" className="mt-4">
          <BookGrid books={filteredBooks} />
        </TabsContent>
        
        <TabsContent value="borrowed" className="mt-4">
          <BookGrid books={filteredBooks} />
        </TabsContent>
      </Tabs>

      <AddBookDialog
        open={isAddBookOpen}
        onOpenChange={setIsAddBookOpen}
      />
      
      {/* ISBN Scanner Modal */}
      {showScanner && (
        <Dialog open={showScanner} onOpenChange={setShowScanner}>
          <DialogContent className="sm:max-w-[425px]">
            <ISBNScanner 
              onScan={handleScanISBN} 
              onClose={() => setShowScanner(false)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BooksPage;
