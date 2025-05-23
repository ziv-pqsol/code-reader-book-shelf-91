
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Book, Student, mapSupabaseBook, mapSupabaseStudent, mapBookToSupabase, mapStudentToSupabase } from '../types';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addDays } from 'date-fns';

interface LibraryContextType {
  books: Book[];
  students: Student[];
  getBookById: (id: string) => Book | undefined;
  getStudentById: (id: string) => Student | undefined;
  searchBooks: (query: string) => Book[];
  searchStudents: (query: string) => Student[];
  borrowBook: (bookId: string, studentId: string) => void;
  returnBook: (bookId: string) => void;
  getStudentBooks: (studentId: string) => Book[];
  getBookStats: () => {
    totalBooks: number;
    availableBooks: number;
    borrowedBooks: number;
    mostBorrowedBooks: Book[];
  };
  addBook: (book: Omit<Book, 'id'>) => void;
  updateBook: (id: string, book: Partial<Book>) => void;
  addStudent: (student: Omit<Student, 'id'>) => void;
  isLoading: boolean;
  deleteStudent: (id: string) => void;
  deleteBook: (id: string) => void;
  extendReturnDate: (bookId: string, days: number) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary debe ser usado dentro de un LibraryProvider');
  }
  return context;
};

interface LibraryProviderProps {
  children: ReactNode;
}

export const LibraryProvider: React.FC<LibraryProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch books
  const { 
    data: books = [], 
    isLoading: isBooksLoading,
    error: booksError
  } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*');
      
      if (error) {
        console.error('Error fetching books:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los libros",
          variant: "destructive",
        });
        return [];
      }
      
      return data.map(mapSupabaseBook);
    }
  });

  // Fetch students
  const { 
    data: students = [], 
    isLoading: isStudentsLoading,
    error: studentsError 
  } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*');
      
      if (error) {
        console.error('Error fetching students:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los estudiantes",
          variant: "destructive",
        });
        return [];
      }
      
      return data.map(mapSupabaseStudent);
    }
  });

  // Add book mutation
  const addBookMutation = useMutation({
    mutationFn: async (book: Omit<Book, 'id'>) => {
      const { data, error } = await supabase
        .from('books')
        .insert(mapBookToSupabase(book))
        .select()
        .single();
      
      if (error) {
        console.error('Error adding book:', error);
        throw error;
      }
      
      return mapSupabaseBook(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast({
        title: "Libro añadido",
        description: "El libro se ha añadido correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo añadir el libro",
        variant: "destructive",
      });
    }
  });

  // Add student mutation
  const addStudentMutation = useMutation({
    mutationFn: async (student: Omit<Student, 'id'>) => {
      const { data, error } = await supabase
        .from('students')
        .insert(mapStudentToSupabase(student))
        .select()
        .single();
      
      if (error) {
        console.error('Error adding student:', error);
        throw error;
      }
      
      return mapSupabaseStudent(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: "Estudiante añadido",
        description: "El estudiante se ha añadido correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo añadir el estudiante",
        variant: "destructive",
      });
    }
  });

  // Add update book mutation
  const updateBookMutation = useMutation({
    mutationFn: async ({ id, book }: { id: string, book: Partial<Book> }) => {
      // Convert book data to Supabase format
      const supabaseData: any = {
        title: book.title,
        author: book.author,
        genre: book.genre,
        code: book.isbn, // Use isbn for code field in database
        cover_url: book.coverUrl,
        classification_number: book.classificationNumber,
        inventory_number: book.inventoryNumber
      };
      
      // Only include defined fields
      const cleanedData = Object.fromEntries(
        Object.entries(supabaseData).filter(([_, v]) => v !== undefined)
      );
      
      const { data, error } = await supabase
        .from('books')
        .update(cleanedData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating book:', error);
        throw error;
      }
      
      return mapSupabaseBook(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast({
        title: "Libro actualizado",
        description: "El libro se ha actualizado correctamente",
      });
    },
    onError: (error) => {
      console.error("Update book error:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el libro",
        variant: "destructive",
      });
    }
  });

  // Borrow book mutation
  const borrowBookMutation = useMutation({
    mutationFn: async ({ bookId, studentId }: { bookId: string, studentId: string }) => {
      const student = getStudentById(studentId);
      if (!student) {
        throw new Error("Estudiante no encontrado");
      }
      
      const now = new Date().toISOString();
      // Default return date is 5 days from now
      const returnDate = addDays(new Date(), 5).toISOString();
      
      const { data, error } = await supabase
        .from('books')
        .update({
          available: false,
          borrower_id: studentId,
          borrower_name: student.name,
          borrower_code: student.code,
          borrowed_date: now,
          return_date: returnDate
        })
        .eq('id', bookId)
        .select()
        .single();
      
      if (error) {
        console.error('Error borrowing book:', error);
        throw error;
      }
      
      return mapSupabaseBook(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast({
        title: "Libro prestado",
        description: "El libro se ha prestado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo prestar el libro",
        variant: "destructive",
      });
    }
  });

  // Return book mutation
  const returnBookMutation = useMutation({
    mutationFn: async (bookId: string) => {
      const { data, error } = await supabase
        .from('books')
        .update({
          available: true,
          borrower_id: null,
          borrower_name: null,
          borrower_code: null,
          borrowed_date: null,
          return_date: null
        })
        .eq('id', bookId)
        .select()
        .single();
      
      if (error) {
        console.error('Error returning book:', error);
        throw error;
      }
      
      return mapSupabaseBook(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast({
        title: "Libro devuelto",
        description: "El libro se ha devuelto correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo devolver el libro",
        variant: "destructive",
      });
    }
  });

  // Extend return date mutation
  const extendReturnDateMutation = useMutation({
    mutationFn: async ({ bookId, days }: { bookId: string, days: number }) => {
      const book = getBookById(bookId);
      if (!book || !book.returnDate) {
        throw new Error("Libro no encontrado o no prestado");
      }
      
      const currentReturnDate = new Date(book.returnDate);
      const newReturnDate = addDays(currentReturnDate, days).toISOString();
      
      const { data, error } = await supabase
        .from('books')
        .update({
          return_date: newReturnDate
        })
        .eq('id', bookId)
        .select()
        .single();
      
      if (error) {
        console.error('Error extending return date:', error);
        throw error;
      }
      
      return mapSupabaseBook(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast({
        title: "Fecha extendida",
        description: "La fecha de devolución ha sido extendida correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo extender la fecha de devolución",
        variant: "destructive",
      });
    }
  });

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting student:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el estudiante",
        variant: "destructive",
      });
    }
  });

  // Delete book mutation
  const deleteBookMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting book:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el libro",
        variant: "destructive",
      });
    }
  });

  // Handle API errors
  useEffect(() => {
    if (booksError) {
      console.error('Books error:', booksError);
      toast({
        title: "Error",
        description: "No se pudieron cargar los libros",
        variant: "destructive",
      });
    }
    
    if (studentsError) {
      console.error('Students error:', studentsError);
      toast({
        title: "Error",
        description: "No se pudieron cargar los estudiantes",
        variant: "destructive",
      });
    }
  }, [booksError, studentsError, toast]);

  const getBookById = (id: string): Book | undefined => {
    return books.find(book => book.id === id);
  };

  const getStudentById = (id: string): Student | undefined => {
    return students.find(student => student.id === id);
  };

  const searchBooks = (query: string): Book[] => {
    const lowerQuery = query.toLowerCase();
    return books.filter(
      book =>
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery) ||
        book.isbn.toLowerCase().includes(lowerQuery) ||
        (book.classificationNumber && book.classificationNumber.toLowerCase().includes(lowerQuery)) ||
        (book.inventoryNumber && book.inventoryNumber.toLowerCase().includes(lowerQuery))
    );
  };

  const searchStudents = (query: string): Student[] => {
    const lowerQuery = query.toLowerCase();
    return students.filter(
      student =>
        student.name.toLowerCase().includes(lowerQuery) ||
        student.code.toLowerCase().includes(lowerQuery) ||
        student.grade.toLowerCase().includes(lowerQuery)
    );
  };

  const borrowBook = (bookId: string, studentId: string): void => {
    borrowBookMutation.mutate({ bookId, studentId });
  };

  const returnBook = (bookId: string): void => {
    returnBookMutation.mutate(bookId);
  };

  const extendReturnDate = (bookId: string, days: number): void => {
    extendReturnDateMutation.mutate({ bookId, days });
  };

  const getStudentBooks = (studentId: string): Book[] => {
    return books.filter(book => book.borrowerId === studentId);
  };

  const getBookStats = () => {
    const totalBooks = books.length;
    const availableBooks = books.filter(book => book.available).length;
    const borrowedBooks = totalBooks - availableBooks;
    
    const mostBorrowedBooks = books.filter(book => !book.available).slice(0, 5);
    
    return {
      totalBooks,
      availableBooks,
      borrowedBooks,
      mostBorrowedBooks
    };
  };

  const addBook = (book: Omit<Book, 'id'>) => {
    addBookMutation.mutate(book);
  };

  const updateBook = (id: string, book: Partial<Book>) => {
    updateBookMutation.mutate({ id, book });
  };

  const addStudent = (student: Omit<Student, 'id'>) => {
    addStudentMutation.mutate(student);
  };

  const deleteStudent = (id: string) => {
    deleteStudentMutation.mutate(id);
  };

  const deleteBook = (id: string) => {
    deleteBookMutation.mutate(id);
  };

  const isLoading = isBooksLoading || isStudentsLoading;

  return (
    <LibraryContext.Provider
      value={{
        books,
        students,
        getBookById,
        getStudentById,
        searchBooks,
        searchStudents,
        borrowBook,
        returnBook,
        getStudentBooks,
        getBookStats,
        addBook,
        updateBook,
        addStudent,
        isLoading,
        deleteStudent,
        deleteBook,
        extendReturnDate,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};
