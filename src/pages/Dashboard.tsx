import { useEffect, useState } from 'react';
import { useLibrary } from '@/context/LibraryContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookLoadingAnimation from '@/components/BookLoadingAnimation';
import { format, parseISO } from 'date-fns';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const { getBookStats, isLoading, books, getOverdueBooks, getDueSoonBooks } = useLibrary();
  
  const stats = getBookStats();
  const overdueBooks = getOverdueBooks();
  const dueSoonBooks = getDueSoonBooks();
  
  useEffect(() => {
    // Simulate loading for a better UX
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading || isLoading) {
    return <BookLoadingAnimation />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground">Bienvenido a la biblioteca escolar.</p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Libros</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBooks}</div>
            <p className="text-xs text-muted-foreground">Libros en la biblioteca</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
            <BookOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableBooks}</div>
            <p className="text-xs text-muted-foreground">Libros disponibles para préstamo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prestados</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.borrowedBooks}</div>
            <p className="text-xs text-muted-foreground">Libros actualmente prestados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdueBooks}</div>
            <p className="text-xs text-muted-foreground">Libros con devolución atrasada</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Overdue Books Section */}
      {overdueBooks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <h2 className="text-xl font-semibold">Libros con devolución atrasada</h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {overdueBooks.map((book) => (
              <Link key={book.id} to={`/books/${book.id}`}>
                <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4 flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-medium line-clamp-1">{book.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{book.borrowerName}</p>
                        {book.dueDate && (
                          <div className="flex items-center mt-1">
                            <Clock className="h-3 w-3 text-red-500 mr-1" />
                            <p className="text-xs text-red-500">
                              Atrasado desde {format(parseISO(book.dueDate), 'dd/MM/yyyy')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Due Soon Books Section */}
      {dueSoonBooks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-amber-500 mr-2" />
            <h2 className="text-xl font-semibold">Libros a devolver pronto</h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dueSoonBooks.map((book) => (
              <Link key={book.id} to={`/books/${book.id}`}>
                <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-4 flex-shrink-0">
                        <Clock className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="font-medium line-clamp-1">{book.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{book.borrowerName}</p>
                        {book.dueDate && (
                          <div className="flex items-center mt-1">
                            <Clock className="h-3 w-3 text-amber-500 mr-1" />
                            <p className="text-xs text-amber-500">
                              Devolver antes del {format(parseISO(book.dueDate), 'dd/MM/yyyy')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Books */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Libros recientes</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.slice(0, 8).map((book) => (
            <Card key={book.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <Link to={`/books/${book.id}`}>
                <div className="aspect-[2/3] relative overflow-hidden bg-gray-100">
                  <img 
                    src={book.coverUrl || 'https://placehold.co/200x300/e5e7eb/a3a3a3?text=Sin+Portada'} 
                    alt={book.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {!book.available && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-amber-500/80 text-white text-xs rounded-full">
                        Prestado
                      </span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium line-clamp-1">{book.title}</h3>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                  
                  {!book.available && book.dueDate && (
                    <div className="flex items-center mt-2">
                      <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        Devolución: {format(parseISO(book.dueDate), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
