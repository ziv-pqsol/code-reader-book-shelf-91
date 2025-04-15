
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLibrary } from '@/context/LibraryContext';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, User, Search, ArrowLeft } from 'lucide-react';
import { genreColors } from '@/data/mockData';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { searchBooks, searchStudents } = useLibrary();
  const [activeTab, setActiveTab] = useState<string>('all');
  
  const [matchedBooks, setMatchedBooks] = useState(searchBooks(query));
  const [matchedStudents, setMatchedStudents] = useState(searchStudents(query));
  
  useEffect(() => {
    setMatchedBooks(searchBooks(query));
    setMatchedStudents(searchStudents(query));
  }, [query, searchBooks, searchStudents]);
  
  const totalResults = matchedBooks.length + matchedStudents.length;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resultados de Búsqueda</h1>
          <p className="text-muted-foreground">
            {totalResults} {totalResults === 1 ? 'resultado' : 'resultados'} para "{query}"
          </p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Todos ({totalResults})
          </TabsTrigger>
          <TabsTrigger value="books" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Libros ({matchedBooks.length})
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Estudiantes ({matchedStudents.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4 space-y-6">
          {totalResults === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
              <h2 className="mt-2 text-xl font-bold">No se encontraron resultados</h2>
              <p className="text-muted-foreground">Intenta buscar con otras palabras clave</p>
            </div>
          ) : (
            <>
              {matchedStudents.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Estudiantes</h2>
                    {matchedStudents.length > 2 && (
                      <Button 
                        variant="link" 
                        className="flex items-center"
                        onClick={() => setActiveTab('students')}
                      >
                        Ver todos los {matchedStudents.length} estudiantes
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {matchedStudents.slice(0, 3).map(student => (
                      <Link key={student.id} to={`/students/${student.id}`}>
                        <Card className="overflow-hidden transition-shadow hover:shadow-md">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{student.name}</h3>
                              <Badge variant="outline">{student.grade}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{student.code}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {matchedBooks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Libros</h2>
                    {matchedBooks.length > 2 && (
                      <Button 
                        variant="link" 
                        className="flex items-center"
                        onClick={() => setActiveTab('books')}
                      >
                        Ver todos los {matchedBooks.length} libros
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {matchedBooks.slice(0, 3).map(book => (
                      <Link key={book.id} to={`/books/${book.id}`}>
                        <Card className="overflow-hidden transition-shadow hover:shadow-md h-full">
                          <CardContent className="p-0">
                            <div className="flex h-full">
                              <div 
                                className="w-2/5 bg-cover bg-center" 
                                style={{ backgroundImage: `url(${book.coverUrl || 'https://placehold.co/100x150/e5e7eb/a3a3a3?text=Sin+Portada'})` }}
                              ></div>
                              <div className="w-3/5 p-4 flex flex-col">
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
                                </div>
                                <div className="mt-auto">
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
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="books" className="mt-4">
          {matchedBooks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {matchedBooks.map(book => (
                <Link key={book.id} to={`/books/${book.id}`}>
                  <Card className="overflow-hidden transition-shadow hover:shadow-md h-full">
                    <CardContent className="p-0">
                      <div className="flex h-full">
                        <div 
                          className="w-2/5 bg-cover bg-center" 
                          style={{ backgroundImage: `url(${book.coverUrl || 'https://placehold.co/100x150/e5e7eb/a3a3a3?text=Sin+Portada'})` }}
                        ></div>
                        <div className="w-3/5 p-4 flex flex-col">
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
                          </div>
                          <div className="mt-auto">
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
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
              <h2 className="mt-2 text-xl font-bold">No se encontraron libros</h2>
              <p className="text-muted-foreground">Intenta buscar con otras palabras clave</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="students" className="mt-4">
          {matchedStudents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {matchedStudents.map(student => (
                <Link key={student.id} to={`/students/${student.id}`}>
                  <Card className="overflow-hidden transition-shadow hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{student.name}</h3>
                        <Badge variant="outline">{student.grade}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{student.code}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
              <h2 className="mt-2 text-xl font-bold">No se encontraron estudiantes</h2>
              <p className="text-muted-foreground">Intenta buscar con otras palabras clave</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SearchResultsPage;
