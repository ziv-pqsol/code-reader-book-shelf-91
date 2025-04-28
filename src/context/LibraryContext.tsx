import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Book, Student, mapSupabaseBook, mapSupabaseStudent, mapBookToSupabase, mapStudentToSupabase } from '../types';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addDays, format, isAfter, parseISO } from 'date-fns';

interface LibraryContextType {
  books: Book[];
  students: Student[];
  getBookById: (id: string) => Book | undefined;
  getStudentById: (id: string) => Student | undefined;
  searchBooks: (query: string) => Book[];
  searchStudents: (query: string) => Student[];
  borrowBook: (bookId: string, studentId: string) => void;
  returnBook: (bookId: string) => void;
  extendBookLoan: (bookId: string, days?: number) => void;
  getStudentBooks: (studentId: string) => Book[];
  getBookStats: () => {
    totalBooks: number;
    availableBooks: number;
    borrowedBooks: number;
    mostBorrowedBooks: Book[];
    overdueBooks: number;
  };
  addBook: (book: Omit<Book, 'id'>) => void;
  updateBook: (id: string, book: Partial<Book>) => void;
  addStudent: (student: Omit<Student, 'id'>) => void;
  isLoading: boolean;
  deleteStudent: (id: string) => void;
  deleteBook: (id: string) => void;
  getOverdueBooks: () => Book[];
  getDueSoonBooks: () => Book[];
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

// Default loan period in days
const DEFAULT_LOAN_PERIOD = 5;
// Maximum number of renewals allowed
const MAX_RENEWALS = 3; 

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
      const supabaseData = {
        title: book.title,
        author: book.author,
        genre: book.genre,
        code: book.isbn, // Use isbn for code field in database
        cover_url: book.coverUrl,
        borrow_date: book.borrowDate,
        due_date: book.dueDate,
        renewal_count: book.renewalCount
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
      
      // Get current date and calculate due date (5 days from now)
      const borrowDate = format(new Date(), 'yyyy-MM-dd');
      const dueDate = format(addDays(new Date(), DEFAULT_LOAN_PERIOD), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('books')
        .update({
          available: false,
          borrower_id: studentId,
          borrower_name: student.name,
          borrower_code: student.code,
          borrow_date: borrowDate,
          due_date: dueDate,
          renewal_count: 0
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast({
        title: "Libro prestado",
        description: `El libro "${data.title}" se ha prestado correctamente. Debe devolverse antes del ${format(parseISO(data.dueDate || ''), 'dd/MM/yyyy')}.`,
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
          borrow_date: null,
          due_date: null,
          renewal_count: null
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast({
        title: "Libro devuelto",
        description: `El libro "${data.title}" ha sido devuelto correctamente.`,
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

  // Extend loan mutation
  const extendLoanMutation = useMutation({
    mutationFn: async ({ bookId, days = DEFAULT_LOAN_PERIOD }: { bookId: string, days?: number }) => {
      // Get the existing book first
      const book = getBookById(bookId);
      if (!book || book.available) {
        throw new Error("El libro no está prestado actualmente");
      }
      
      if (book.renewalCount && book.renewalCount >= MAX_RENEWALS) {
        throw new Error(`El préstamo ya ha sido renovado el máximo de ${MAX_RENEWALS} veces`);
      }
      
      // Calculate new due date based on current due date or today
      let startDate = new Date();
      if (book.dueDate) {
        const currentDueDate = parseISO(book.dueDate);
        // If current due date is in the future, extend from there
        if (isAfter(currentDueDate, new Date())) {
          startDate = currentDueDate;
        }
      }
      
      const newDueDate = format(addDays(startDate, days), 'yyyy-MM-dd');
      const newRenewalCount = (book.renewalCount || 0) + 1;
      
      const { data, error } = await supabase
        .from('books')
        .update({
          due_date: newDueDate,
          renewal_count: newRenewalCount
        })
        .eq('id', bookId)
        .select()
        .single();
      
      if (error) {
        console.error('Error extending loan:', error);
        throw error;
      }
      
      return mapSupabaseBook(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast({
        title: "Préstamo extendido",
        description: `El préstamo para "${data.title}" ha sido extendido hasta el ${format(parseISO(data.dueDate || ''), 'dd/MM/yyyy')}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo extender el préstamo",
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
        book.isbn.toLowerCase().includes(lowerQuery)
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

  const extendBookLoan = (bookId: string, days?: number): void => {
    extendLoanMutation.mutate({ bookId, days });
  };

  const getStudentBooks = (studentId: string): Book[] => {
    return books.filter(book => book.borrowerId === studentId);
  };

  const getOverdueBooks = (): Book[] => {
    const today = new Date();
    return books.filter(book => {
      if (!book.dueDate || book.available) return false;
      const dueDate = parseISO(book.dueDate);
      return isAfter(today, dueDate);
    });
  };

  const getDueSoonBooks = (): Book[] => {
    const today = new Date();
    const threeDaysFromNow = addDays(today, 3);
    return books.filter(book => {
      if (!book.dueDate || book.available) return false;
      const dueDate = parseISO(book.dueDate);
      return isAfter(threeDaysFromNow, dueDate) && isAfter(dueDate, today);
    });
  };

  const getBookStats = () => {
    const totalBooks = books.length;
    const availableBooks = books.filter(book => book.available).length;
    const borrowedBooks = totalBooks - availableBooks;
    const overdueBooks = getOverdueBooks().length;
    
    const mostBorrowedBooks = books.filter(book => !book.available).slice(0, 5);
    
    return {
      totalBooks,
      availableBooks,
      borrowedBooks,
      mostBorrowedBooks,
      overdueBooks
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
        extendBookLoan,
        getStudentBooks,
        getBookStats,
        addBook,
        updateBook,
        addStudent,
        isLoading,
        deleteStudent,
        deleteBook,
        getOverdueBooks,
        getDueSoonBooks,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};
