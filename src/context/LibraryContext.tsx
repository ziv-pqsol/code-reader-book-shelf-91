import React, { createContext, useState, useContext, ReactNode } from 'react';
import { mockBooks, mockStudents } from '../data/mockData';
import { Book, Student } from '../types';
import { useToast } from "@/hooks/use-toast";

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
  addStudent: (student: Omit<Student, 'id'>) => void;
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
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const { toast } = useToast();

  const addBook = (book: Omit<Book, 'id'>) => {
    const newBook: Book = {
      ...book,
      id: `book-${Date.now()}`,
      available: true
    };
    setBooks(prev => [...prev, newBook]);
    toast({
      title: "Libro añadido",
      description: "El libro se ha añadido correctamente",
    });
  };

  const addStudent = (student: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...student,
      id: `student-${Date.now()}`
    };
    setStudents(prev => [...prev, newStudent]);
    toast({
      title: "Estudiante añadido",
      description: "El estudiante se ha añadido correctamente",
    });
  };

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
        book.code.toLowerCase().includes(lowerQuery)
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
    const student = getStudentById(studentId);
    if (!student) return;

    setBooks(prevBooks =>
      prevBooks.map(book => {
        if (book.id === bookId) {
          return {
            ...book,
            available: false,
            borrowerId: studentId,
            borrowerName: student.name,
            borrowerCode: student.code
          };
        }
        return book;
      })
    );
  };

  const returnBook = (bookId: string): void => {
    setBooks(prevBooks =>
      prevBooks.map(book => {
        if (book.id === bookId) {
          return {
            ...book,
            available: true,
            borrowerId: undefined,
            borrowerName: undefined,
            borrowerCode: undefined
          };
        }
        return book;
      })
    );
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
        addStudent,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};
