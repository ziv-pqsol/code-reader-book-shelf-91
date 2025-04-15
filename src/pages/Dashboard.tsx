
import { useLibrary } from '@/context/LibraryContext';
import { Book, BookOpen, User, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { books, students, getBookStats } = useLibrary();
  
  const { totalBooks, availableBooks, borrowedBooks, mostBorrowedBooks } = getBookStats();
  const borrowedPercentage = Math.round((borrowedBooks / totalBooks) * 100);
  
  const studentsWithBooks = students.filter(student => {
    return books.some(book => book.borrowerId === student.id);
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel Principal</h1>
        <p className="text-muted-foreground">Vista general del sistema de biblioteca</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Libros</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBooks}</div>
            <p className="text-xs text-muted-foreground">Libros en la biblioteca</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Libros Disponibles</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableBooks}</div>
            <p className="text-xs text-muted-foreground">Libros disponibles para préstamo</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Libros Prestados</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{borrowedBooks}</div>
            <p className="text-xs text-muted-foreground">Actualmente prestados a estudiantes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes Activos</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsWithBooks.length}</div>
            <p className="text-xs text-muted-foreground">Estudiantes con libros prestados</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Estado de Préstamos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Prestados vs Disponibles
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {borrowedBooks} de {totalBooks} libros están prestados
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">{borrowedPercentage}%</div>
              </div>
              <Progress value={borrowedPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Libros Actualmente Prestados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mostBorrowedBooks.length > 0 ? (
                mostBorrowedBooks.slice(0, 4).map((book) => (
                  <div key={book.id} className="flex items-center">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{book.title}</p>
                      <p className="truncate text-sm text-muted-foreground">Prestado a {book.borrowerName}</p>
                    </div>
                    <Link 
                      to={`/books/${book.id}`}
                      className="ml-2 text-sm text-library-primary hover:underline"
                    >
                      Ver
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No hay libros prestados actualmente</p>
              )}
              
              {mostBorrowedBooks.length > 4 && (
                <Link 
                  to="/books?filter=borrowed"
                  className="text-sm font-medium text-library-primary hover:underline"
                >
                  Ver todos los libros prestados
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Estudiantes con Libros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentsWithBooks.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {studentsWithBooks.slice(0, 6).map((student) => {
                    const studentBooks = books.filter(book => book.borrowerId === student.id);
                    return (
                      <div key={student.id} className="rounded-lg border bg-card p-4 shadow-sm">
                        <div className="space-y-2">
                          <h3 className="font-medium">{student.name}</h3>
                          <p className="text-sm text-muted-foreground">{student.grade} | {student.code}</p>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Libros prestados ({studentBooks.length})</p>
                            <div className="space-y-1">
                              {studentBooks.slice(0, 2).map(book => (
                                <p key={book.id} className="text-xs truncate">{book.title}</p>
                              ))}
                              {studentBooks.length > 2 && (
                                <p className="text-xs text-library-primary">+{studentBooks.length - 2} más</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Link 
                            to={`/students/${student.id}`}
                            className="text-sm font-medium text-library-primary hover:underline"
                          >
                            Ver estudiante
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay estudiantes con libros prestados actualmente</p>
              )}
              
              {studentsWithBooks.length > 6 && (
                <Link 
                  to="/students"
                  className="text-sm font-medium text-library-primary hover:underline"
                >
                  Ver todos los estudiantes
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
