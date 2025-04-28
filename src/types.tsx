export type Genre = "literatura" | "ficción" | "ciencia" | "historia" | "arte";

export interface User {
  username: string;
  password: string;
}

export interface Student {
  id: string;
  name: string;
  code: string;
  grade: string;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  genre: Genre;
  available: boolean;
  borrowerId?: string;
  borrowerName?: string;
  borrowerCode?: string;
  coverUrl?: string | null;
  borrowDate?: string | null; // Date when book was borrowed
  dueDate?: string | null;    // Date when book should be returned
  renewalCount?: number;      // Number of times the loan has been renewed
}

// Types for Supabase mappings
interface SupabaseBook {
  id: string;
  code: string;
  title: string;
  author: string;
  genre: string;
  available: boolean;
  borrower_id: string | null;
  borrower_name: string | null;
  borrower_code: string | null;
  cover_url: string | null;
  borrow_date: string | null;
  due_date: string | null;
  renewal_count: number | null;
}

interface SupabaseStudent {
  id: string;
  name: string;
  code: string;
  grade: string;
}

// Mapping functions
export const mapSupabaseBook = (book: SupabaseBook): Book => ({
  id: book.id,
  isbn: book.code,
  title: book.title,
  author: book.author,
  genre: book.genre as Genre,
  available: book.available,
  borrowerId: book.borrower_id || undefined,
  borrowerName: book.borrower_name || undefined,
  borrowerCode: book.borrower_code || undefined,
  coverUrl: book.cover_url,
  borrowDate: book.borrow_date,
  dueDate: book.due_date,
  renewalCount: book.renewal_count || 0
});

export const mapBookToSupabase = (book: Omit<Book, 'id'>): Omit<SupabaseBook, 'id'> => ({
  code: book.isbn,
  title: book.title,
  author: book.author,
  genre: book.genre,
  available: book.available,
  borrower_id: book.borrowerId || null,
  borrower_name: book.borrowerName || null,
  borrower_code: book.borrowerCode || null,
  cover_url: book.coverUrl || null,
  borrow_date: book.borrowDate || null,
  due_date: book.dueDate || null,
  renewal_count: book.renewalCount || 0
});

export const mapSupabaseStudent = (student: SupabaseStudent): Student => ({
  id: student.id,
  name: student.name,
  code: student.code,
  grade: student.grade,
});

export const mapStudentToSupabase = (student: Omit<Student, 'id'>): Omit<SupabaseStudent, 'id'> => ({
  name: student.name,
  code: student.code,
  grade: student.grade,
});