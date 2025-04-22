
import { OpenLibraryResponse, OpenLibraryDoc, Genre } from '@/types';

export const OPEN_LIBRARY_API_URL = 'https://openlibrary.org/search.json';
export const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

// Function to map an Open Library genre to our internal genre system
export function mapGenre(subjects: string[] = []): Genre {
  // Convert array to lowercase for easier comparison
  const lowercaseSubjects = subjects.map(s => s.toLowerCase());
  
  if (lowercaseSubjects.some(s => s.includes('literature') || s.includes('literatura')))
    return 'literatura';
  
  if (lowercaseSubjects.some(s => s.includes('fiction') || s.includes('ficción')))
    return 'ficción';
  
  if (lowercaseSubjects.some(s => s.includes('science') || s.includes('ciencia')))
    return 'ciencia';
  
  if (lowercaseSubjects.some(s => s.includes('history') || s.includes('historia')))
    return 'historia';
  
  if (lowercaseSubjects.some(s => s.includes('art') || s.includes('arte')))
    return 'arte';
  
  // Default to 'literatura' if no match
  return 'literatura';
}

// Primary function to search across multiple APIs
export async function searchBookByISBN(isbn: string) {
  // Try Open Library first
  try {
    const openLibraryData = await searchOpenLibrary(isbn);
    if (openLibraryData) {
      console.log("Book found in Open Library");
      return openLibraryData;
    }
    
    // If not found in Open Library, try Google Books
    const googleBooksData = await searchGoogleBooks(isbn);
    if (googleBooksData) {
      console.log("Book found in Google Books");
      return googleBooksData;
    }
    
    // If not found in any source
    console.log("Book not found in any source");
    return null;
  } catch (error) {
    console.error('Error searching for book:', error);
    return null;
  }
}

// Open Library API search
async function searchOpenLibrary(isbn: string): Promise<OpenLibraryDoc | null> {
  try {
    const response = await fetch(`${OPEN_LIBRARY_API_URL}?isbn=${isbn}`);
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json() as OpenLibraryResponse;
    
    if (data.docs && data.docs.length > 0) {
      return data.docs[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching from Open Library:', error);
    return null;
  }
}

// Google Books API search
async function searchGoogleBooks(isbn: string): Promise<OpenLibraryDoc | null> {
  try {
    const response = await fetch(`${GOOGLE_BOOKS_API_URL}?q=isbn:${isbn}`);
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const book = data.items[0].volumeInfo;
      
      // Convert Google Books format to OpenLibrary format
      return {
        title: book.title || '',
        author_name: book.authors || [],
        isbn: [isbn],
        subject: book.categories || [],
        cover_i: null, // Google Books uses a different cover system
        cover_url: book.imageLinks?.thumbnail || null,
        publisher: book.publisher || null,
        publish_year: book.publishedDate ? [parseInt(book.publishedDate.substring(0, 4))] : [],
        // Additional fields adapted from Google Books
        description: book.description || null,
        language: book.language || null
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching from Google Books:', error);
    return null;
  }
}

export function getCoverUrl(coverId?: number): string | undefined {
  if (!coverId) return undefined;
  return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
}

export function getGoogleBooksCoverUrl(bookId?: string): string | undefined {
  if (!bookId) return undefined;
  return `https://books.google.com/books/content?id=${bookId}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
}

export function formatAuthor(authors?: string[]): string {
  if (!authors || authors.length === 0) return 'Unknown Author';
  if (authors.length === 1) return authors[0];
  return authors.join(', ');
}
