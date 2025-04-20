import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '@/context/LibraryContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Book, Search, QrCode, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import BetterISBNScanner from '@/components/BetterISBNScanner';
import AddBookDialog from '@/components/AddBookDialog';
import { searchBookByISBN } from '@/services/openLibraryService';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const ScannerPage = () => {
  const navigate = useNavigate();
  const { searchStudents, searchBooks } = useLibrary();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('books');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [matchedStudents, setMatchedStudents] = useState<any[]>([]);
  const [matchedBooks, setMatchedBooks] = useState<any[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [showAddBook, setShowAddBook] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    const foundStudents = searchStudents(searchQuery);
    const foundBooks = searchBooks(searchQuery);
    
    setMatchedStudents(foundStudents);
    setMatchedBooks(foundBooks);
    
    // If we found exactly one match of the active type, navigate there directly
    if (activeTab === 'students' && foundStudents.length === 1) {
      navigate(`/students/${foundStudents[0].id}`);
    } else if (activeTab === 'books' && foundBooks.length === 1) {
      navigate(`/books/${foundBooks[0].id}`);
    }
  };
  
  useEffect(() => {
    // Clear results when tab changes
    setMatchedStudents([]);
    setMatchedBooks([]);
    setSearchQuery('');
  }, [activeTab]);

  const handleScanISBN = async (isbn: string) => {
    setShowScanner(false);
    setScanResult(isbn);
    setSearchQuery(isbn);
    
    // Search for book in our library first
    const foundBooks = searchBooks(isbn);
    setMatchedBooks(foundBooks);
    
    if (foundBooks.length === 1) {
      navigate(`/books/${foundBooks[0].id}`);
    } else if (foundBooks.length === 0) {
      // If not found in our library, check OpenLibrary
      try {
        const bookData = await searchBookByISBN(isbn);
        if (bookData) {
          toast({
            title: "Libro encontrado en OpenLibrary",
            description: "Este libro existe pero no está en nuestra biblioteca. ¿Deseas añadirlo?",
            action: (
              <Button variant="outline" onClick={() => setShowAddBook(true)}>
                Añadir
              </Button>
            ),
          });
        } else {
          toast({
            title: "Libro no encontrado",
            description: "No se encontró el libro en nuestra biblioteca ni en OpenLibrary. ¿Deseas añadirlo manualmente?",
            action: (
              <Button variant="outline" onClick={() => setShowAddBook(true)}>
                Añadir
              </Button>
            ),
          });
        }
      } catch (error) {
        console.error("Error checking OpenLibrary:", error);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Búsqueda</h1>
        <p className="text-muted-foreground">Buscar estudiantes o libros por ISBN, nombre o código</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="students" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Estudiantes
          </TabsTrigger>
          <TabsTrigger value="books" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Libros
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="students" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Búsqueda de Estudiantes
              </CardTitle>
              <CardDescription>
                Buscar un estudiante por nombre o código
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ingresa nombre o código de estudiante"
                  onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>Buscar</Button>
              </div>
              
              {matchedStudents.length > 0 && (
                <div className="mt-4 space-y-4">
                  <h3 className="font-medium">Resultados de búsqueda:</h3>
                  <div className="grid gap-2">
                    {matchedStudents.map(student => (
                      <Card key={student.id}>
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.grade} • {student.code}</p>
                          </div>
                          <Button 
                            onClick={() => navigate(`/students/${student.id}`)}
                          >
                            Ver
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {searchQuery && matchedStudents.length === 0 && (
                <div className="mt-4 p-4 bg-amber-50 text-amber-700 rounded-md flex items-center">
                  <p>No se encontraron estudiantes que coincidan con: {searchQuery}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="books" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Búsqueda de Libros
              </CardTitle>
              <CardDescription>
                Buscar un libro por título, autor o ISBN
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ingresa título, autor o ISBN del libro"
                  onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setShowScanner(true)}
                >
                  <QrCode className="h-4 w-4" />
                </Button>
                <Button onClick={handleSearch}>Buscar</Button>
              </div>
              
              {matchedBooks.length > 0 && (
                <div className="mt-4 space-y-4">
                  <h3 className="font-medium">Resultados de búsqueda:</h3>
                  <div className="grid gap-2">
                    {matchedBooks.map(book => (
                      <Card key={book.id}>
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{book.title}</p>
                            <p className="text-sm text-muted-foreground">Por {book.author} • ISBN: {book.isbn}</p>
                          </div>
                          <Button 
                            onClick={() => navigate(`/books/${book.id}`)}
                          >
                            Ver
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {searchQuery && matchedBooks.length === 0 && (
                <div className="mt-4 p-4 bg-amber-50 text-amber-700 rounded-md">
                  <div className="flex flex-col space-y-2">
                    <p>No se encontraron libros que coincidan con: {searchQuery}</p>
                    <Button 
                      variant="outline" 
                      className="w-full mt-2"
                      onClick={() => setShowAddBook(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir un nuevo libro
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ISBN Scanner Modal */}
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="sm:max-w-[425px]">
          <BetterISBNScanner 
            onScan={handleScanISBN} 
            onClose={() => setShowScanner(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Add Book Dialog */}
      <AddBookDialog
        open={showAddBook}
        onOpenChange={setShowAddBook}
      />
    </div>
  );
};

export default ScannerPage;
