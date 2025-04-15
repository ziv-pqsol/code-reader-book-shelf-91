
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
  code: string;
  title: string;
  author: string;
  genre: Genre;
  available: boolean;
  coverUrl?: string;
  borrowerId?: string;
  borrowerName?: string;
  borrowerCode?: string;
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

// Helper function to convert Supabase book to our Book interface
export function mapSupabaseBook(book: Database['public']['Tables']['books']['Row']): Book {
  return {
    id: book.id,
    code: book.code,
    title: book.title,
    author: book.author,
    genre: book.genre as Genre,
    available: book.available,
    coverUrl: book.cover_url || undefined,
    borrowerId: book.borrower_id || undefined,
    borrowerName: book.borrower_name || undefined,
    borrowerCode: book.borrower_code || undefined
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

// Helper function to map our Book interface to Supabase book insert type
export function mapBookToSupabase(book: Omit<Book, 'id'>): Database['public']['Tables']['books']['Insert'] {
  return {
    code: book.code,
    title: book.title,
    author: book.author,
    genre: book.genre,
    available: book.available,
    cover_url: book.coverUrl || null,
    borrower_id: book.borrowerId || null,
    borrower_name: book.borrowerName || null,
    borrower_code: book.borrowerCode || null
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
