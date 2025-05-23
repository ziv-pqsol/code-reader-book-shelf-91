
import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '@/context/LibraryContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, PlusCircle, User } from 'lucide-react';
import { genreColors } from '@/data/mockData';
import SearchableSelect from '@/components/SearchableSelect';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";

const StudentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getStudentById, getStudentBooks, returnBook, books = [], borrowBook } = useLibrary();
  const [isAssignBookOpen, setIsAssignBookOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  const student = getStudentById(id || '');
  const studentBooks = getStudentBooks(id || '');
  
  // Reset search and selection when dialog opens/closes
  useEffect(() => {
    if (!isAssignBookOpen) {
      setSearchQuery('');
      setSelectedBookId('');
    }
  }, [isAssignBookOpen]);
  
  // Filter available books based on search
  const availableBooks = useMemo(() => {
    if (!books || !Array.isArray(books)) return [];
    
    return books.filter(book => {
      if (!book.available) return false;
      
      if (!searchQuery) return true;
      
      const searchLower = searchQuery.toLowerCase();
      return (
        book.title.toLowerCase().includes(searchLower) ||
        book.author.toLowerCase().includes(searchLower) ||
        book.isbn.toLowerCase().includes(searchLower)
      );
    });
  }, [books, searchQuery]);
  
  const handleAssignBook = () => {
    if (!selectedBookId) {
      toast({
        title: "Error",
        description: "Por favor selecciona un libro",
        variant: "destructive",
      });
      return;
    }
    
    borrowBook(selectedBookId, id || '');
    setIsAssignBookOpen(false);
    setSelectedBookId('');
    
    toast({
      title: "Libro asignado",
      description: "El libro ha sido asignado correctamente",
    });
  };
  
  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-semibold mb-2">Estudiante No Encontrado</h1>
        <p className="text-muted-foreground mb-6">El estudiante que estás buscando no existe</p>
        <Button asChild>
          <Link to="/students">Volver a Estudiantes</Link>
        </Button>
      </div>
    );
  }
  
  // Prepare items for SearchableSelect
  const bookSelectItems = useMemo(() => {
    return availableBooks.map(book => ({
      id: book.id,
      label: `${book.title} - ${book.isbn}`
    }));
  }, [availableBooks]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link to="/students">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Perfil de Estudiante</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left column - Student info */}
        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-library-primary bg-opacity-10 mx-auto flex items-center justify-center">
                  <User className="h-12 w-12 text-library-primary" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-2xl font-bold">{student.name}</h2>
                  <p className="text-muted-foreground">Código: {student.code}</p>
                </div>
                
                <div className="pt-4 space-y-3 border-t">
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Grado</p>
                    <Badge variant="outline">{student.grade}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Libros Prestados</p>
                    <p className="font-medium">{studentBooks.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Books */}
        <div className="md:col-span-8">
          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Libros Actualmente Prestados</h2>
              <Button size="sm" onClick={() => setIsAssignBookOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Asignar Libro
              </Button>
            </div>
            
            {studentBooks.length > 0 ? (
              <div className="space-y-4">
                {studentBooks.map((book) => (
                  <Card 
                    key={book.id} 
                    className="overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => navigate(`/books/${book.id}`)}
                  >
                    <CardContent className="p-0">
                      <div className="flex">
                        <div 
                          className="w-1/4 bg-cover bg-center" 
                          style={{ backgroundImage: `url(${book.coverUrl || 'https://placehold.co/100x150/e5e7eb/a3a3a3?text=Sin+Portada'})` }}
                        ></div>
                        <div className="w-3/4 p-4">
                          <div className="flex justify-between">
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
                              <h3 className="font-semibold">{book.title}</h3>
                              <p className="text-sm text-muted-foreground">{book.author}</p>
                              <p className="text-sm mt-2">Código: {book.isbn}</p>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <Button 
                                variant="outline"
                                size="sm"
                                asChild
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent card click
                                  navigate(`/books/${book.id}`);
                                }}
                              >
                                <Link to={`/books/${book.id}`}>
                                  <BookOpen className="h-4 w-4 mr-2" />
                                  Ver
                                </Link>
                              </Button>
                              <Button 
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent card click
                                  returnBook(book.id);
                                  toast({
                                    title: "Libro devuelto",
                                    description: `${book.title} ha sido devuelto a la biblioteca`,
                                  });
                                }}
                              >
                                Devolver Libro
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <BookOpen className="h-12 w-12 text-muted-foreground opacity-20 mx-auto mb-2" />
                <h3 className="font-medium text-lg">Sin Libros Prestados</h3>
                <p className="text-muted-foreground">Este estudiante no tiene libros prestados actualmente.</p>
                <Button className="mt-4" size="sm" onClick={() => setIsAssignBookOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Asignar Libro
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Assign Book Dialog */}
      <Dialog open={isAssignBookOpen} onOpenChange={setIsAssignBookOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Asignar Libro</DialogTitle>
            <DialogDescription>
              Busca y selecciona un libro para asignar a este estudiante.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-2">
              <label className="text-sm font-medium mb-1 block">Buscar libro:</label>
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, autor o ISBN..." 
                className="mb-2"
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto border rounded-md">
              {bookSelectItems.length > 0 ? (
                bookSelectItems.map((item) => (
                  <div 
                    key={item.id}
                    className={`p-2 cursor-pointer hover:bg-accent ${selectedBookId === item.id ? 'bg-accent' : ''}`}
                    onClick={() => setSelectedBookId(item.id)}
                  >
                    {item.label}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  {availableBooks.length === 0 ? 
                    "No hay libros disponibles" : 
                    "No se encontraron resultados para esta búsqueda"}
                </div>
              )}
            </div>
            
            {bookSelectItems.length === 0 && (
              <Button 
                variant="outline" 
                className="w-full mt-2" 
                onClick={() => {
                  setIsAssignBookOpen(false);
                  navigate('/books?action=add');
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Añadir Nuevo Libro
              </Button>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAssignBookOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAssignBook}
              disabled={!selectedBookId}
            >
              Asignar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDetailPage;
