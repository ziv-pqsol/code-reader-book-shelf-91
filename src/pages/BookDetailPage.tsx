import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '@/context/LibraryContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Edit, BookOpen } from 'lucide-react';
import { genreColors } from '@/data/mockData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import EditBookDialog from '@/components/EditBookDialog';
import SearchableSelect from '@/components/SearchableSelect';

const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getBookById, returnBook, getStudentById, students, borrowBook, books } = useLibrary();
  const [isEditBookOpen, setIsEditBookOpen] = useState(false);
  const [isAssignStudentOpen, setIsAssignStudentOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const book = getBookById(id || '');
  
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

    // Filter students based on search
    const availableStudents = Array.isArray(students) 
    ? students.filter(student => {
        const searchLower = searchQuery.toLowerCase();
        return (
          student.name.toLowerCase().includes(searchLower) ||
          student.code.toLowerCase().includes(searchLower)
        );
      })
    : [];
  
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
                      {students.slice(0, 4).map((student) => (
                        <Card key={student.id} className="overflow-hidden">
                          <Button 
                            variant="ghost" 
                            className="h-auto p-4 w-full justify-start"
                            onClick={() => {
                              borrowBook(book.id, student.id);
                              toast({
                                title: "Libro asignado",
                                description: `${book.title} ha sido asignado a ${student.name}`,
                              });
                            }}
                          >
                            <User className="h-5 w-5 mr-2 flex-shrink-0" />
                            <div className="text-left flex-grow truncate">
                              <p className="font-medium">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.grade} • {student.code}</p>
                            </div>
                          </Button>
                        </Card>
                      ))}
                    </div>
                    
                    {students.length > 4 && (
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
                  
                  <Card className="overflow-hidden">
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
                          asChild
                        >
                          <Link to={`/students/${borrower.id}`}>
                            Ver Perfil
                          </Link>
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
            <SearchableSelect
              items={availableStudents.map(student => ({
                id: student.id,
                label: `${student.name} - ${student.code}`
              }))}
              placeholder="Buscar estudiante por nombre o código..."
              onSelect={setSelectedStudentId}
              triggerText={selectedStudentId 
                ? availableStudents.find(s => s.id === selectedStudentId)?.name || "Seleccionar estudiante"
                : "Seleccionar estudiante"}
              searchText={searchQuery}
              onAddNew={() => {
                setIsAssignStudentOpen(false);
                // Here you can navigate to the add student form or open the add student dialog
              }}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAssignStudentOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignStudent}>
              Asignar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Replace the placeholder EditBookDialog with our new component */}
      <EditBookDialog 
        open={isEditBookOpen} 
        onOpenChange={setIsEditBookOpen} 
        book={book}
      />
    </div>
  );
};

export default BookDetailPage;
