import { useState, useEffect } from 'react';
import { useLibrary } from '@/context/LibraryContext';
import { Link } from 'react-router-dom';
import { Search, UserPlus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import AddStudentDialog from '@/components/AddStudentDialog';
import { useToast } from '@/hooks/use-toast';

const StudentsPage = () => {
  const { students, searchStudents, getStudentBooks, deleteStudent } = useLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState(students);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  const { toast } = useToast();
  
  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredStudents(searchStudents(searchQuery));
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students, searchStudents]);

  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  
  const handleDeleteStudent = (studentId: string) => {
    const studentBooks = getStudentBooks(studentId);
    if (studentBooks.length > 0) {
      toast({
        title: "No se puede eliminar",
        description: "El estudiante tiene libros prestados. Devuélvalos primero.",
        variant: "destructive",
      });
      return;
    }
    setStudentToDelete(studentId);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estudiantes</h1>
          <p className="text-muted-foreground">Administrar y ver información de estudiantes</p>
        </div>
        <Button className="sm:self-end" onClick={() => setIsAddStudentOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Añadir Estudiante
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, código o grado..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => {
            const studentBooks = getStudentBooks(student.id);
            return (
              <Card key={student.id} className="overflow-hidden transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Link to={`/students/${student.id}`} className="flex-grow">
                        <h3 className="text-lg font-semibold">{student.name}</h3>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteStudent(student.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{student.code}</p>
                      <div className="mt-4 space-y-1">
                        <p className="text-sm font-medium">Libros Prestados: {studentBooks.length}</p>
                        {studentBooks.length > 0 && (
                          <div className="space-y-1">
                            {studentBooks.slice(0, 2).map((book) => (
                              <p key={book.id} className="text-xs text-muted-foreground truncate">
                                {book.title}
                              </p>
                            ))}
                            {studentBooks.length > 2 && (
                              <p className="text-xs text-library-primary">
                                +{studentBooks.length - 2} más
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full flex justify-center py-12">
            <div className="text-center">
              <p className="text-lg font-semibold">No se encontraron estudiantes</p>
              <p className="text-muted-foreground">Intenta ajustar tu búsqueda</p>
            </div>
          </div>
        )}
      </div>

      <AddStudentDialog
        open={isAddStudentOpen}
        onOpenChange={setIsAddStudentOpen}
      />

      <AlertDialog open={!!studentToDelete} onOpenChange={() => setStudentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente al estudiante.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (studentToDelete) {
                  deleteStudent(studentToDelete);
                  setStudentToDelete(null);
                  toast({
                    title: "Estudiante eliminado",
                    description: "El estudiante ha sido eliminado exitosamente",
                  });
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentsPage;
