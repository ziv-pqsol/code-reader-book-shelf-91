
import { Database } from '../integrations/supabase/types';

export type Genre = 
  | 'literatura' 
  | 'ficción' 
  | 'ciencia' 
  | 'historia' 
  | 'arte';

// Map Supabase books table to our Book interface
export interface Book {
  id: string;
  isbn: string;  // Changed from 'code' to 'isbn'
  title: string;
  author: string;
  genre: Genre;
  available: boolean;
  coverUrl?: string;
  borrowerId?: string;
  borrowerName?: string;
  borrowerCode?: string;
  borrowedDate?: string;
  returnDate?: string;
  classificationNumber?: string;
  inventoryNumber?: string;
}

export interface Student {
  id: string;
  name: string;
  code: string;
  grade: string;
}

export interface User {
  username: string;
  password: string;
}

// Interface for borrowing history records
export interface BorrowingRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  borrowedDate: string;
  returnedDate?: string;
  createdAt: string;
}

// Helper function to convert Supabase book to our Book interface
export function mapSupabaseBook(book: Database['public']['Tables']['books']['Row']): Book {
  return {
    id: book.id,
    isbn: book.code,  // Map 'code' to 'isbn'
    title: book.title,
    author: book.author,
    genre: book.genre as Genre,
    available: book.available,
    coverUrl: book.cover_url || undefined,
    borrowerId: book.borrower_id || undefined,
    borrowerName: book.borrower_name || undefined,
    borrowerCode: book.borrower_code || undefined,
    borrowedDate: book.borrowed_date || undefined,
    returnDate: book.return_date || undefined,
    classificationNumber: book.classification_number || undefined,
    inventoryNumber: book.inventory_number || undefined
  };
}

// Helper function to convert Supabase student to our Student interface
export function mapSupabaseStudent(student: Database['public']['Tables']['students']['Row']): Student {
  return {
    id: student.id,
    name: student.name,
    code: student.code,
    grade: student.grade
  };
}

// Helper function to map Supabase borrowing history to our BorrowingRecord interface
export function mapSupabaseBorrowingRecord(record: Database['public']['Tables']['borrowing_history']['Row']): BorrowingRecord {
  return {
    id: record.id,
    bookId: record.book_id,
    bookTitle: record.book_title,
    studentId: record.student_id,
    studentName: record.student_name,
    studentCode: record.student_code,
    borrowedDate: record.borrowed_date,
    returnedDate: record.returned_date || undefined,
    createdAt: record.created_at
  };
}

// Helper function to map our Book interface to Supabase book insert type
export function mapBookToSupabase(book: Omit<Book, 'id'>): Database['public']['Tables']['books']['Insert'] {
  return {
    code: book.isbn,  // Map 'isbn' to 'code'
    title: book.title,
    author: book.author,
    genre: book.genre,
    available: book.available,
    cover_url: book.coverUrl || null,
    borrower_id: book.borrowerId || null,
    borrower_name: book.borrowerName || null,
    borrower_code: book.borrowerCode || null,
    borrowed_date: book.borrowedDate || null,
    return_date: book.returnDate || null,
    classification_number: book.classificationNumber || null,
    inventory_number: book.inventoryNumber || null
  };
}

// Helper function to map our Student interface to Supabase student insert type
export function mapStudentToSupabase(student: Omit<Student, 'id'>): Database['public']['Tables']['students']['Insert'] {
  return {
    name: student.name,
    code: student.code,
    grade: student.grade
  };
}

// Open Library API response interfaces
export interface OpenLibraryResponse {
  isbn: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  subject?: string[];
  docs?: OpenLibraryDoc[];
}

export interface OpenLibraryDoc {
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
  subject?: string[];
  // Add the missing properties
  cover_url?: string;
  description?: string | null;
  language?: string | null;
  publisher?: string | null;
  publish_year?: number[];
}
