
// This file is quite long, so we'll only add the necessary changes for the new fields
import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '@/context/LibraryContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Edit, BookOpen, PlusCircle, CalendarClock } from 'lucide-react';
import { genreColors } from '@/data/mockData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";
import EditBookDialog from '@/components/EditBookDialog';
import ExtendReturnDateDialog from '@/components/ExtendReturnDateDialog';
import { Input } from '@/components/ui/input';
import { format, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';

const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getBookById, returnBook, getStudentById, students = [], borrowBook } = useLibrary();
  const [isEditBookOpen, setIsEditBookOpen] = useState(false);
  const [isAssignStudentOpen, setIsAssignStudentOpen] = useState(false);
  const [isExtendDateOpen, setIsExtendDateOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const book = getBookById(id || '');
  
  // Reset search and selection when dialog opens/closes
  useEffect(() => {
    if (!isAssignStudentOpen) {
      setSearchQuery('');
      setSelectedStudentId('');
    }
  }, [isAssignStudentOpen]);

  // Format date helper function
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  // Check if return date is overdue
  const isOverdue = useMemo(() => {
    if (book?.returnDate) {
      return isAfter(new Date(), new Date(book.returnDate));
    }
    return false;
  }, [book?.returnDate]);
  
  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-semibold mb-2">Libro No Encontrado</h1>
        <p className="text-muted-foreground mb-6">El libro que estás buscando no existe</p>
        <Button asChild>
          <Link to="/books">Volver a Libros</Link>
        </Button>
      </div>
    );
  }
  
  const borrower = book.borrowerId ? getStudentById(book.borrowerId) : null;
  
  // Here we'd fetch the real book cover; for the demo using the cover URL or placeholder
  const coverUrl = book.coverUrl || 'https://placehold.co/300x450/e5e7eb/a3a3a3?text=Sin+Portada';
  
  const handleAssignStudent = () => {
    if (!selectedStudentId) {
      toast({
        title: "Error",
        description: "Por favor selecciona un estudiante",
        variant: "destructive",
      });
      return;
    }
    
    borrowBook(book.id, selectedStudentId);
    setIsAssignStudentOpen(false);
    setSelectedStudentId('');
    
    toast({
      title: "Libro asignado",
      description: "El libro ha sido asignado correctamente al estudiante",
    });
  };

  // Filter students based on search and ensure it's always a valid array
  const availableStudents = useMemo(() => {
    if (!students || !Array.isArray(students)) return [];
    
    if (!searchQuery) return students;
    
    const searchLower = searchQuery.toLowerCase();
    return students.filter(student => (
      student.name.toLowerCase().includes(searchLower) ||
      student.code.toLowerCase().includes(searchLower)
    ));
  }, [students, searchQuery]);
  
  // Prepare items for display
  const studentItems = useMemo(() => {
    return availableStudents.map(student => ({
      id: student.id,
      label: `${student.name} - ${student.code}`
    }));
  }, [availableStudents]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link to="/books">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Detalles del Libro</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left column - Book cover and info */}
        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-center mb-4">
                <img 
                  src={coverUrl}
                  alt={`Portada de ${book.title}`}
                  className="w-full max-w-[200px] rounded shadow-md"
                />
              </div>
              
              <div className="space-y-4 mt-4">
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
                  <h2 className="text-2xl font-bold">{book.title}</h2>
                  <p className="text-lg text-muted-foreground">{book.author}</p>
                </div>
                
                <div className="pt-4 space-y-3 border-t">
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Código del Libro</p>
                    <p className="font-medium">{book.isbn}</p>
                  </div>
                  {book.classificationNumber && (
                    <div className="flex justify-between">
                      <p className="text-muted-foreground">Clasificación</p>
                      <p className="font-medium">{book.classificationNumber}</p>
                    </div>
                  )}
                  {book.inventoryNumber && (
                    <div className="flex justify-between">
                      <p className="text-muted-foreground">N° Inventario</p>
                      <p className="font-medium">{book.inventoryNumber}</p>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Estado</p>
                    {book.available ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Disponible
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Prestado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => setIsEditBookOpen(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Libro
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Book status and related info */}
        <div className="md:col-span-8">
          <div className="mt-4 space-y-4">
            {book.available ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-green-100 mr-4 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Libro Disponible</h3>
                        <p className="text-sm text-muted-foreground">Este libro está disponible para préstamo</p>
                      </div>
                    </div>
                    <Button onClick={() => setIsAssignStudentOpen(true)}>Asignar a Estudiante</Button>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-4">El libro puede ser asignado a:</h3>
                    <div className="grid gap-2 md:grid-cols-2">
                      {students && students.slice(0, 4).map((student) => (
                        <Card 
                          key={student.id} 
                          className="overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
                          onClick={() => navigate(`/students/${student.id}`)}
                        >
                          <div className="p-4">
                            <div className="flex items-center space-x-3">
                              <User className="h-5 w-5 flex-shrink-0" />
                              <div className="text-left flex-grow truncate">
                                <p className="font-medium">{student.name}</p>
                                <p className="text-xs text-muted-foreground">{student.grade} • {student.code}</p>
                              </div>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent card click
                                  borrowBook(book.id, student.id);
                                  toast({
                                    title: "Libro asignado",
                                    description: `${book.title} ha sido asignado a ${student.name}`,
                                  });
                                }}
                              >
                                Asignar
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                    
                    {students && students.length > 4 && (
                      <div className="mt-2 text-center">
                        <Button 
                          variant="link"
                          onClick={() => setIsAssignStudentOpen(true)}
                        >
                          Ver más estudiantes
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : borrower ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-amber-100 mr-4 flex items-center justify-center">
                        <User className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Actualmente Prestado</h3>
                        <p className="text-sm text-muted-foreground">Este libro está actualmente prestado a un estudiante</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline"
                        onClick={() => setIsExtendDateOpen(true)}
                      >
                        <CalendarClock className="h-4 w-4 mr-2" />
                        Extender plazo
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => {
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
                  
                  <div className="mb-6 p-4 rounded-lg border border-amber-200 bg-amber-50">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-amber-800">Prestado desde</p>
                        <p className="text-sm">{formatDate(book.borrowedDate)}</p>
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isOverdue ? 'text-red-800' : 'text-amber-800'}`}>
                          Fecha de devolución {isOverdue ? '(vencida)' : ''}
                        </p>
                        <p className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                          {formatDate(book.returnDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Card 
                    className="overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => navigate(`/students/${borrower.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-library-primary bg-opacity-10 mr-4 flex items-center justify-center">
                            <User className="h-6 w-6 text-library-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{borrower.name}</h3>
                            <p className="text-sm text-muted-foreground">{borrower.grade} • {borrower.code}</p>
                          </div>
                        </div>
                        <Button 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            navigate(`/students/${borrower.id}`);
                          }}
                        >
                          Ver Perfil
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-6">
                    <h3 className="font-semibold text-lg">Información del Prestatario Faltante</h3>
                    <p className="text-muted-foreground mb-4">
                      Este libro está marcado como prestado pero la información del prestatario no está disponible.
                    </p>
                    <div className="flex justify-center space-x-2">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          returnBook(book.id);
                          toast({
                            title: "Libro disponible",
                            description: `${book.title} ha sido marcado como disponible`,
                          });
                        }}
                      >
                        Marcar como Disponible
                      </Button>
                      <Button onClick={() => setIsAssignStudentOpen(true)}>Asignar a Estudiante</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Assign Student Dialog */}
      <Dialog open={isAssignStudentOpen} onOpenChange={setIsAssignStudentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Asignar Libro a Estudiante</DialogTitle>
            <DialogDescription>
              Busca y selecciona un estudiante para asignarle este libro.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-2">
              <label className="text-sm font-medium mb-1 block">Buscar estudiante:</label>
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o código..." 
                className="mb-2"
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto border rounded-md">
              {studentItems.length > 0 ? (
                studentItems.map((item) => (
                  <div 
                    key={item.id}
                    className={`p-2 cursor-pointer hover:bg-accent ${selectedStudentId === item.id ? 'bg-accent' : ''}`}
                    onClick={() => setSelectedStudentId(item.id)}
                  >
                    {item.label}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  {availableStudents.length === 0 ? 
                    "No hay estudiantes disponibles" : 
                    "No se encontraron resultados para esta búsqueda"}
                </div>
              )}
            </div>
            
            {studentItems.length === 0 && (
              <Button 
                variant="outline" 
                className="w-full mt-2" 
                onClick={() => {
                  setIsAssignStudentOpen(false);
                  navigate('/students?action=add');
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Añadir Nuevo Estudiante
              </Button>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAssignStudentOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAssignStudent}
              disabled={!selectedStudentId}
            >
              Asignar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Book Dialog */}
      <EditBookDialog 
        open={isEditBookOpen} 
        onOpenChange={setIsEditBookOpen} 
        book={book}
      />

      {/* Extend Return Date Dialog */}
      <ExtendReturnDateDialog
        open={isExtendDateOpen}
        onOpenChange={setIsExtendDateOpen}
        bookId={book.id}
        currentReturnDate={book.returnDate}
      />
    </div>
  );
};

export default BookDetailPage;
