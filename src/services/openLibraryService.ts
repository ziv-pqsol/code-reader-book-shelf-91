
import { OpenLibraryResponse, OpenLibraryDoc, Genre } from '@/types';

export const OPEN_LIBRARY_API_URL = 'https://openlibrary.org/search.json';

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

export async function searchBookByISBN(isbn: string): Promise<OpenLibraryDoc | null> {
  try {
    const response = await fetch(`${OPEN_LIBRARY_API_URL}?isbn=${isbn}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json() as OpenLibraryResponse;
    
    if (data.docs && data.docs.length > 0) {
      return data.docs[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching book data:', error);
    return null;
  }
}

export function getCoverUrl(coverId?: number): string | undefined {
  if (!coverId) return undefined;
  return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
}

export function formatAuthor(authors?: string[]): string {
  if (!authors || authors.length === 0) return 'Unknown Author';
  if (authors.length === 1) return authors[0];
  return authors.join(', ');
}
