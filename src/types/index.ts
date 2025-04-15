
export type Genre = 
  | 'literatura' 
  | 'ficción' 
  | 'ciencia' 
  | 'historia' 
  | 'arte';

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
