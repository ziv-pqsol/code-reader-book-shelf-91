import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '@/context/LibraryContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Edit, BookOpen, PlusCircle, Calendar, AlertTriangle, Clock } from 'lucide-react';
import { genreColors } from '@/data/mockData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";
import EditBookDialog from '@/components/EditBookDialog';
import { Input } from '@/components/ui/input';
import { parseISO, format, differenceInDays, isAfter } from 'date-fns';

const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getBookById, returnBook, getStudentById, students = [], borrowBook, extendBookLoan } = useLibrary();
  const [isEditBookOpen, setIsEditBookOpen] = useState(false);
  const [isAssignStudentOpen, setIsAssignStudentOpen] = useState(false);
  const [isExtendLoanOpen, setIsExtendLoanOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [extensionDays, setExtensionDays] = useState<number>(5);
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
  
  // Calculate days remaining or overdue
  const getDaysStatus = () => {
    if (!book.dueDate) return null;
    
    const today = new Date();
    const dueDate = parseISO(book.dueDate);
    const daysRemaining = differenceInDays(dueDate, today);
    
    if (daysRemaining < 0) {
      return { status: 'overdue', days: Math.abs(daysRemaining) };
    } else {
      return { status: 'remaining', days: daysRemaining };
    }
  };
  
  const daysStatus = book.dueDate ? getDaysStatus() : null;
  
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

  const handleExtendLoan = () => {
    if (extensionDays < 1) {
      toast({
        title: "Error",
        description: "La extensión debe ser de al menos 1 día",
        variant: "destructive",
      });
      return;
    }
    
    extendBookLoan(book.id, extensionDays);
    setIsExtendLoanOpen(false);
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
                  {!book.available && book.borrowDate && (
                    <div className="flex justify-between">
                      <p className="text-muted-foreground">Fecha de préstamo</p>
                      <p className="font-medium">{format(parseISO(book.borrowDate), 'dd/MM/yyyy')}</p>
                    </div>
                  )}
                  {!book.available && book.dueDate && (
                    <div className="flex justify-between">
                      <p className="text-muted-foreground">Fecha de devolución</p>
                      <p className="font-medium">{format(parseISO(book.dueDate), 'dd/MM/yyyy')}</p>
                    </div>
                  )}
                  {!book.available && book.renewalCount !== undefined && (
                    <div className="flex justify-between">
                      <p className="text-muted-foreground">Renovaciones</p>
                      <p className="font-medium">{book.renewalCount}/3</p>
                    </div>
                  )}
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
                      <div className={`w-10 h-10 rounded-full mr-4 flex items-center justify-center ${
                        daysStatus?.status === 'overdue' 
                          ? 'bg-red-100' 
                          : daysStatus?.days && daysStatus.days <= 2 
                            ? 'bg-amber-100' 
                            : 'bg-blue-100'
                      }`}>
                        {daysStatus?.status === 'overdue' ? (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        ) : (
                          <Calendar className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {daysStatus?.status === 'overdue' 
                            ? 'Devolución Atrasada' 
                            : 'Libro Prestado'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {daysStatus?.status === 'overdue' 
                            ? `Retrasado por ${daysStatus.days} día${daysStatus.days !== 1 ? 's' : ''}` 
                            : daysStatus?.days !== undefined
                              ? `${daysStatus.days} día${daysStatus.days !== 1 ? 's' : ''} restantes para la devolución`
                              : 'Préstamo activo'}
                        </p>
                      </div>
                    </div>
                    <div className="space-x-2">
                      {book.renewalCount !== undefined && book.renewalCount < 3 && (
                        <Button 
                          variant="outline" 
                          onClick={() => setIsExtendLoanOpen(true)}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Extender
                        </Button>
                      )}
                      <Button 
                        onClick={() => {
                          returnBook(book.id);
                        }}
                      >
                        Devolver
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-4">Información del préstamo:</h3>
                    <Card className="overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
                      onClick={() => navigate(`/students/${borrower.id}`)}
                    >
                      <div className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-slate-100 mr-4 flex items-center justify-center">
                            <User className="h-5 w-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-medium">{borrower.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {borrower.grade} • {borrower.code}
                            </p>
                            {book.borrowDate && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Prestado el {format(parseISO(book.borrowDate), 'dd/MM/yyyy')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
      
      {/* Edit Book Dialog */}
      <EditBookDialog
        open={isEditBookOpen}
        onOpenChange={setIsEditBookOpen}
        book={book}
      />
      
      {/* Assign Student Dialog */}
      <Dialog open={isAssignStudentOpen} onOpenChange={setIsAssignStudentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Asignar Libro a Estudiante</DialogTitle>
            <DialogDescription>
              Selecciona un estudiante para prestarle este libro.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Buscar por nombre o código..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="mb-4"
            />
            <div className="max-h-60 overflow-y-auto space-y-2">
              {availableStudents.length === 0 ? (
                <p className="text-center text-muted-foreground py-2">No se encontraron estudiantes</p>
              ) : (
                availableStudents.map(student => (
                  <Card
                    key={student.id}
                    className={`overflow-hidden transition-shadow hover:shadow-md cursor-pointer ${
                      selectedStudentId === student.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedStudentId(student.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.grade} • {student.code}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignStudentOpen(false)}>Cancelar</Button>
            <Button onClick={handleAssignStudent} disabled={!selectedStudentId}>Asignar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Extend Loan Dialog */}
      <Dialog open={isExtendLoanOpen} onOpenChange={setIsExtendLoanOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Extender Préstamo</DialogTitle>
            <DialogDescription>
              Define el número de días adicionales para el préstamo.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="extension-days" className="text-sm font-medium">
                  Días adicionales
                </label>
                <Input
                  id="extension-days"
                  type="number"
                  min="1"
                  max="30"
                  value={extensionDays}
                  onChange={e => setExtensionDays(parseInt(e.target.value) || 5)}
                />
                <p className="text-xs text-muted-foreground">
                  Puedes extender el préstamo hasta un máximo de 3 veces.
                  <br />
                  Renovaciones actuales: {book.renewalCount || 0}/3
                </p>
              </div>
              
              {book.dueDate && (
                <div className="border rounded p-3 bg-slate-50">
                  <p className="text-sm font-medium">Información del préstamo:</p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div>Fecha actual de devolución:</div>
                    <div className="font-medium">{format(parseISO(book.dueDate), 'dd/MM/yyyy')}</div>
                    
                    <div>Nueva fecha de devolución:</div>
                    <div className="font-medium">
                      {format(addDays(parseISO(book.dueDate), extensionDays), 'dd/MM/yyyy')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExtendLoanOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExtendLoan}>
              Confirmar Extensión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookDetailPage;
