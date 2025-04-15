
import { useState, useEffect } from 'react';
import { useLibrary } from '@/context/LibraryContext';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, PlusCircle, BookOpen, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { genreColors } from '@/data/mockData';

const BooksPage = () => {
  const { books, searchBooks } = useLibrary();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBooks, setFilteredBooks] = useState(books);
  const [activeTab, setActiveTab] = useState(initialFilter);
  
  useEffect(() => {
    let result = books;
    
    // Apply tab filters
    if (activeTab === 'available') {
      result = books.filter(book => book.available);
    } else if (activeTab === 'borrowed') {
      result = books.filter(book => !book.available);
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      result = searchBooks(searchQuery).filter(book => {
        if (activeTab === 'available') return book.available;
        if (activeTab === 'borrowed') return !book.available;
        return true;
      });
    }
    
    setFilteredBooks(result);
  }, [searchQuery, books, activeTab, searchBooks]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Books</h1>
          <p className="text-muted-foreground">Browse and manage library books</p>
        </div>
        <Button className="sm:self-end">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Book
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search books by title, author or code..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Books</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="borrowed">Borrowed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <BookGrid books={filteredBooks} />
        </TabsContent>
        
        <TabsContent value="available" className="mt-4">
          <BookGrid books={filteredBooks} />
        </TabsContent>
        
        <TabsContent value="borrowed" className="mt-4">
          <BookGrid books={filteredBooks} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const BookGrid = ({ books }: { books: any[] }) => {
  if (books.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <p className="text-lg font-semibold">No books found</p>
          <p className="text-muted-foreground">Try adjusting your search or filter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => (
        <Link key={book.id} to={`/books/${book.id}`}>
          <Card className="overflow-hidden transition-shadow hover:shadow-md h-full">
            <CardContent className="p-0">
              <div className="flex h-full">
                <div 
                  className="w-2/5 bg-cover bg-center" 
                  style={{ backgroundImage: `url(${book.coverUrl || 'https://placehold.co/100x150/e5e7eb/a3a3a3?text=No+Cover'})` }}
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
                  <div className="mt-auto flex items-center">
                    {book.available ? (
                      <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                        <BookOpen className="h-3 w-3" />
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200">
                        <User className="h-3 w-3" />
                        Borrowed
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
  );
};

export default BooksPage;
