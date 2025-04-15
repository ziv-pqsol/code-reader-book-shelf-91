
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '@/context/LibraryContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Book, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const ScannerPage = () => {
  const navigate = useNavigate();
  const { searchStudents, searchBooks } = useLibrary();
  const [activeTab, setActiveTab] = useState<string>('students');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [matchedStudents, setMatchedStudents] = useState<any[]>([]);
  const [matchedBooks, setMatchedBooks] = useState<any[]>([]);
  
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    const foundStudents = searchStudents(searchQuery);
    const foundBooks = searchBooks(searchQuery);
    
    setMatchedStudents(foundStudents);
    setMatchedBooks(foundBooks);
    
    // If we found exactly one match of the active type, navigate there directly
    if (activeTab === 'students' && foundStudents.length === 1) {
      navigate(`/students/${foundStudents[0].id}`);
    } else if (activeTab === 'books' && foundBooks.length === 1) {
      navigate(`/books/${foundBooks[0].id}`);
    }
  };
  
  useEffect(() => {
    // Clear results when tab changes
    setMatchedStudents([]);
    setMatchedBooks([]);
    setSearchQuery('');
  }, [activeTab]);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground">Search for students or books by code or name</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="students" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="books" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Books
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="students" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Student Search
              </CardTitle>
              <CardDescription>
                Search for a student by name or code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter student name or code"
                  onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>Search</Button>
              </div>
              
              {matchedStudents.length > 0 && (
                <div className="mt-4 space-y-4">
                  <h3 className="font-medium">Search Results:</h3>
                  <div className="grid gap-2">
                    {matchedStudents.map(student => (
                      <Card key={student.id}>
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.grade} • {student.code}</p>
                          </div>
                          <Button 
                            onClick={() => navigate(`/students/${student.id}`)}
                          >
                            View
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {searchQuery && matchedStudents.length === 0 && (
                <div className="mt-4 p-4 bg-amber-50 text-amber-700 rounded-md flex items-center">
                  <p>No students found matching: {searchQuery}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="books" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Book Search
              </CardTitle>
              <CardDescription>
                Search for a book by title, author or code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter book title, author or code"
                  onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>Search</Button>
              </div>
              
              {matchedBooks.length > 0 && (
                <div className="mt-4 space-y-4">
                  <h3 className="font-medium">Search Results:</h3>
                  <div className="grid gap-2">
                    {matchedBooks.map(book => (
                      <Card key={book.id}>
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{book.title}</p>
                            <p className="text-sm text-muted-foreground">By {book.author} • {book.code}</p>
                          </div>
                          <Button 
                            onClick={() => navigate(`/books/${book.id}`)}
                          >
                            View
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {searchQuery && matchedBooks.length === 0 && (
                <div className="mt-4 p-4 bg-amber-50 text-amber-700 rounded-md flex items-center">
                  <p>No books found matching: {searchQuery}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScannerPage;
