
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLibrary } from '@/context/LibraryContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Edit, BookOpen } from 'lucide-react';
import { genreColors } from '@/data/mockData';

const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getBookById, returnBook, getStudentById, students, borrowBook } = useLibrary();
  const [tab, setTab] = useState('details');
  
  const book = getBookById(id || '');
  
  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-semibold mb-2">Book Not Found</h1>
        <p className="text-muted-foreground mb-6">The book you're looking for doesn't exist</p>
        <Button asChild>
          <Link to="/books">Go Back to Books</Link>
        </Button>
      </div>
    );
  }
  
  const borrower = book.borrowerId ? getStudentById(book.borrowerId) : null;
  
  // Here we'd fetch the real book cover; for the demo using the cover URL or placeholder
  const coverUrl = book.coverUrl || 'https://placehold.co/300x450/e5e7eb/a3a3a3?text=No+Cover';
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link to="/books">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Book Details</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left column - Book cover and info */}
        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-center mb-4">
                <img 
                  src={coverUrl}
                  alt={`Cover of ${book.title}`}
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
                    <p className="text-muted-foreground">Book Code</p>
                    <p className="font-medium">{book.code}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Status</p>
                    {book.available ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Borrowed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button variant="outline" className="w-full" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Book
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">QR Code</h3>
              <div className="bg-white p-4 rounded-lg flex items-center justify-center">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${book.code}&size=150x150`} 
                  alt="Book QR Code"
                  className="w-full max-w-[150px]" 
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                This QR code contains the book's code: {book.code}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Book status and related info */}
        <div className="md:col-span-8">
          <Tabs defaultValue={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Borrowing Status</TabsTrigger>
              <TabsTrigger value="history">Borrowing History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-4 space-y-4">
              {book.available ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-green-100 mr-4 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Book Available</h3>
                          <p className="text-sm text-muted-foreground">This book is available for borrowing</p>
                        </div>
                      </div>
                      <Button>Assign to Student</Button>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-4">Book can be assigned to:</h3>
                      <div className="grid gap-2 md:grid-cols-2">
                        {students.slice(0, 4).map((student) => (
                          <Card key={student.id} className="overflow-hidden">
                            <Button 
                              variant="ghost" 
                              className="h-auto p-4 w-full justify-start"
                              onClick={() => borrowBook(book.id, student.id)}
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
                          <Button variant="link">View more students</Button>
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
                          <h3 className="font-semibold">Currently Borrowed</h3>
                          <p className="text-sm text-muted-foreground">This book is currently borrowed by a student</p>
                        </div>
                      </div>
                      <Button 
                        variant="destructive"
                        onClick={() => returnBook(book.id)}
                      >
                        Return Book
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
                              View Profile
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
                      <h3 className="font-semibold text-lg">Borrower Information Missing</h3>
                      <p className="text-muted-foreground mb-4">
                        This book is marked as borrowed but the borrower information is not available.
                      </p>
                      <div className="flex justify-center space-x-2">
                        <Button 
                          variant="outline"
                          onClick={() => returnBook(book.id)}
                        >
                          Mark as Available
                        </Button>
                        <Button>Assign to Student</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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

export default BookDetailPage;
