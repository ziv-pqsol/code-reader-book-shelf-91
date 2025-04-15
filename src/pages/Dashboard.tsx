
import { useLibrary } from '@/context/LibraryContext';
import { Book, BookOpen, User, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { books, students, getBookStats } = useLibrary();
  
  const { totalBooks, availableBooks, borrowedBooks, mostBorrowedBooks } = getBookStats();
  const borrowedPercentage = Math.round((borrowedBooks / totalBooks) * 100);
  
  // Get students with borrowed books
  const studentsWithBooks = students.filter(student => {
    return books.some(book => book.borrowerId === student.id);
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Library management system overview</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBooks}</div>
            <p className="text-xs text-muted-foreground">Books in the library</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableBooks}</div>
            <p className="text-xs text-muted-foreground">Books available for borrowing</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Borrowed Books</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{borrowedBooks}</div>
            <p className="text-xs text-muted-foreground">Currently borrowed by students</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsWithBooks.length}</div>
            <p className="text-xs text-muted-foreground">Students with borrowed books</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Book Borrowing Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Borrowed vs Available
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {borrowedBooks} out of {totalBooks} books are borrowed
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
            <CardTitle>Currently Borrowed Books</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mostBorrowedBooks.length > 0 ? (
                mostBorrowedBooks.slice(0, 4).map((book) => (
                  <div key={book.id} className="flex items-center">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{book.title}</p>
                      <p className="truncate text-sm text-muted-foreground">Borrowed by {book.borrowerName}</p>
                    </div>
                    <Link 
                      to={`/books/${book.id}`}
                      className="ml-2 text-sm text-library-primary hover:underline"
                    >
                      View
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No books are currently borrowed</p>
              )}
              
              {mostBorrowedBooks.length > 4 && (
                <Link 
                  to="/books?filter=borrowed"
                  className="text-sm font-medium text-library-primary hover:underline"
                >
                  View all borrowed books
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Students with Books</CardTitle>
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
                            <p className="text-xs text-muted-foreground">Borrowed books ({studentBooks.length})</p>
                            <div className="space-y-1">
                              {studentBooks.slice(0, 2).map(book => (
                                <p key={book.id} className="text-xs truncate">{book.title}</p>
                              ))}
                              {studentBooks.length > 2 && (
                                <p className="text-xs text-library-primary">+{studentBooks.length - 2} more</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Link 
                            to={`/students/${student.id}`}
                            className="text-sm font-medium text-library-primary hover:underline"
                          >
                            View student
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No students currently have borrowed books</p>
              )}
              
              {studentsWithBooks.length > 6 && (
                <Link 
                  to="/students"
                  className="text-sm font-medium text-library-primary hover:underline"
                >
                  View all students
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
