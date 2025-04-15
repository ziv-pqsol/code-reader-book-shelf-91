
export type Student = {
  id: string;
  name: string;
  code: string;
  grade: string;
};

export type Book = {
  id: string;
  code: string;
  title: string;
  author: string;
  genre: string;
  available: boolean;
  borrowerId?: string;
  borrowerName?: string;
  borrowerCode?: string;
  coverUrl?: string;
};

export type User = {
  username: string;
  password: string;
};

export type Genre = 'fiction' | 'nonfiction' | 'science' | 'history' | 'arts' | 'literature';
