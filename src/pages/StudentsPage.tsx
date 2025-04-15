
import { useState, useEffect } from 'react';
import { useLibrary } from '@/context/LibraryContext';
import { Link } from 'react-router-dom';
import { Search, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const StudentsPage = () => {
  const { students, searchStudents, getStudentBooks } = useLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState(students);
  
  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredStudents(searchStudents(searchQuery));
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students, searchStudents]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">Manage and view student information</p>
        </div>
        <Button className="sm:self-end">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search students by name, code or grade..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => {
            const studentBooks = getStudentBooks(student.id);
            return (
              <Link key={student.id} to={`/students/${student.id}`}>
                <Card className="overflow-hidden transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{student.name}</h3>
                        <Badge variant="outline" className="ml-2">
                          {student.grade}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{student.code}</p>
                      <div className="mt-4 space-y-1">
                        <p className="text-sm font-medium">Books Borrowed: {studentBooks.length}</p>
                        {studentBooks.length > 0 && (
                          <div className="space-y-1">
                            {studentBooks.slice(0, 2).map((book) => (
                              <p key={book.id} className="text-xs text-muted-foreground truncate">
                                {book.title}
                              </p>
                            ))}
                            {studentBooks.length > 2 && (
                              <p className="text-xs text-library-primary">
                                +{studentBooks.length - 2} more
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full flex justify-center py-12">
            <div className="text-center">
              <p className="text-lg font-semibold">No students found</p>
              <p className="text-muted-foreground">Try adjusting your search query</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;
