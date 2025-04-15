
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLibrary } from '@/context/LibraryContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BookOpen, PlusCircle, User, Edit } from 'lucide-react';
import { genreColors } from '@/data/mockData';

const StudentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getStudentById, getStudentBooks, returnBook } = useLibrary();
  const [tab, setTab] = useState('books');
  
  const student = getStudentById(id || '');
  const studentBooks = getStudentBooks(id || '');
  
  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-semibold mb-2">Student Not Found</h1>
        <p className="text-muted-foreground mb-6">The student you're looking for doesn't exist</p>
        <Button asChild>
          <Link to="/students">Go Back to Students</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link to="/students">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Student Profile</h1>
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
                  <p className="text-muted-foreground">Student Code: {student.code}</p>
                </div>
                
                <div className="pt-4 space-y-3 border-t">
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Grade</p>
                    <Badge variant="outline">{student.grade}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Books Borrowed</p>
                    <p className="font-medium">{studentBooks.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button variant="outline" className="w-full" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Student
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">QR Code</h3>
              <div className="bg-white p-4 rounded-lg flex items-center justify-center">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${student.code}&size=150x150`} 
                  alt="Student QR Code"
                  className="w-full max-w-[150px]" 
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                This QR code contains the student's code: {student.code}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Books and History */}
        <div className="md:col-span-8">
          <Tabs defaultValue={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="books">Borrowed Books</TabsTrigger>
              <TabsTrigger value="history">Borrowing History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="books" className="mt-4 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Currently Borrowed Books</h2>
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Assign Book
                </Button>
              </div>
              
              {studentBooks.length > 0 ? (
                <div className="space-y-4">
                  {studentBooks.map((book) => (
                    <Card key={book.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex">
                          <div 
                            className="w-1/4 bg-cover bg-center" 
                            style={{ backgroundImage: `url(${book.coverUrl || 'https://placehold.co/100x150/e5e7eb/a3a3a3?text=No+Cover'})` }}
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
                                <p className="text-sm mt-2">Code: {book.code}</p>
                              </div>
                              <div className="flex flex-col space-y-2">
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  asChild
                                >
                                  <Link to={`/books/${book.id}`}>
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    View
                                  </Link>
                                </Button>
                                <Button 
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => returnBook(book.id)}
                                >
                                  Return Book
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
                  <h3 className="font-medium text-lg">No Books Borrowed</h3>
                  <p className="text-muted-foreground">This student isn't currently borrowing any books.</p>
                  <Button className="mt-4" size="sm">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Assign Book
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <div className="text-center py-12 border rounded-lg">
                <h3 className="font-medium text-lg">Borrowing History</h3>
                <p className="text-muted-foreground">
                  The borrowing history feature is not implemented in this demo version.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage;
