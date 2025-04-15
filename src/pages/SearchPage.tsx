
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '@/context/LibraryContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, User } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { searchBooks, searchStudents } = useLibrary();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(searchQuery)}`);
    } else {
      toast({
        title: "Empty search",
        description: "Please enter a search term",
        variant: "destructive",
      });
    }
  };

  const handleQuickSearch = (type: 'books' | 'students') => {
    if (type === 'books') {
      navigate('/books');
    } else {
      navigate('/students');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground">Search for books or students in the library</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                className="pl-10 py-6 text-lg"
                placeholder="Search by book title, author, student name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full py-6" size="lg">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Browse Books</h2>
                <p className="text-muted-foreground">View all books in the library</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => handleQuickSearch('books')}
            >
              Go to Books
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Browse Students</h2>
                <p className="text-muted-foreground">View all students in the system</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => handleQuickSearch('students')}
            >
              Go to Students
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SearchPage;
