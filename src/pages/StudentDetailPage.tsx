
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLibrary } from '@/context/LibraryContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BookOpen, PlusCircle, User, Clock } from 'lucide-react';
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
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const StudentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getStudentById, getStudentBooks, returnBook, books, borrowBook, getStudentBorrowingHistory } = useLibrary();
  const [tab, setTab] = useState('books');
  const [isAssignBookOpen, setIsAssignBookOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const { toast } = useToast();
  
  const student = getStudentById(id || '');
  const studentBooks = getStudentBooks(id || '');
  const borrowingHistory = getStudentBorrowingHistory(id || '');
  
  // Filter only available books
  const availableBooks = books.filter(book => book.available);
  
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
                <Button size="sm" onClick={() => setIsAssignBookOpen(true)}>
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
                                  onClick={() => {
                                    returnBook(book.id);
                                    toast({
                                      title: "Book returned",
                                      description: `${book.title} has been returned to the library`,
                                    });
                                  }}
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
                  <Button className="mt-4" size="sm" onClick={() => setIsAssignBookOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Assign Book
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              {borrowingHistory.length > 0 ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Borrowing History</h2>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Genre</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {borrowingHistory.map((book) => (
                        <TableRow key={book.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div>{book.title}</div>
                                <div className="text-xs text-muted-foreground">{book.author}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{book.code}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              style={{ 
                                backgroundColor: genreColors[book.genre as keyof typeof genreColors] || '#e5e7eb',
                                borderColor: genreColors[book.genre as keyof typeof genreColors] || '#e5e7eb',
                              }}
                            >
                              {book.genre}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={!book.available ? "secondary" : "outline"}>
                              {!book.available ? "Borrowed" : "Returned"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <Clock className="h-12 w-12 text-muted-foreground opacity-20 mx-auto mb-2" />
                  <h3 className="font-medium text-lg">No Borrowing History</h3>
                  <p className="text-muted-foreground">This student hasn't borrowed any books yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Assign Book Dialog */}
      <Dialog open={isAssignBookOpen} onOpenChange={setIsAssignBookOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Book</DialogTitle>
            <DialogDescription>
              Select a book to assign to this student.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select value={selectedBookId} onValueChange={setSelectedBookId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a book" />
              </SelectTrigger>
              <SelectContent>
                {availableBooks.length > 0 ? (
                  availableBooks.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title} - {book.code}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No books available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAssignBookOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignBook}>
              Assign
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDetailPage;
