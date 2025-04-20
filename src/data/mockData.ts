
import { Student, Book, User, Genre } from '../types';

export const mockStudents: Student[] = [
  { 
    id: '1', 
    name: 'Emma Johnson', 
    code: 'S10001', 
    grade: '10A' 
  },
  { 
    id: '2', 
    name: 'Noah Smith', 
    code: 'S10002', 
    grade: '9B' 
  },
  { 
    id: '3', 
    name: 'Olivia Brown', 
    code: 'S10003', 
    grade: '11C' 
  },
  { 
    id: '4', 
    name: 'Liam Wilson', 
    code: 'S10004', 
    grade: '12A' 
  },
  { 
    id: '5', 
    name: 'Ava Davis', 
    code: 'S10005', 
    grade: '9A' 
  },
  { 
    id: '6', 
    name: 'Sophia Martinez', 
    code: 'S10006', 
    grade: '10B' 
  },
  { 
    id: '7', 
    name: 'William Anderson', 
    code: 'S10007', 
    grade: '11A' 
  },
  { 
    id: '8', 
    name: 'Isabella Thomas', 
    code: 'S10008', 
    grade: '12B' 
  },
  { 
    id: '9', 
    name: 'James Taylor', 
    code: 'S10009', 
    grade: '10C' 
  },
  { 
    id: '10', 
    name: 'Charlotte Lee', 
    code: 'S10010', 
    grade: '9C' 
  },
];

export const mockBooks: Book[] = [
  {
    id: '1',
    isbn: 'B12345',
    title: 'Matar un Ruiseñor',
    author: 'Harper Lee',
    genre: 'literatura',
    available: true,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/To_Kill_a_Mockingbird_%28first_edition_cover%29.jpg'
  },
  {
    id: '2',
    isbn: 'B12346',
    title: '1984',
    author: 'George Orwell',
    genre: 'ficción',
    available: false,
    borrowerId: '1',
    borrowerName: 'Emma Johnson',
    borrowerCode: 'S10001',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/1984first.jpg'
  },
  {
    id: '3',
    isbn: 'B12347',
    title: 'El Gran Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'literatura',
    available: true,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg'
  },
  {
    id: '4',
    isbn: 'B12348',
    title: 'Una Breve Historia del Tiempo',
    author: 'Stephen Hawking',
    genre: 'ciencia',
    available: true,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/6/6e/A_brief_history_of_time.jpg'
  },
  {
    id: '5',
    isbn: 'B12349',
    title: 'Orgullo y Prejuicio',
    author: 'Jane Austen',
    genre: 'literatura',
    available: false,
    borrowerId: '5',
    borrowerName: 'Ava Davis',
    borrowerCode: 'S10005',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/17/PrideAndPrejudiceTitlePage.jpg'
  },
  {
    id: '6',
    isbn: 'B12350',
    title: 'El Hobbit',
    author: 'J.R.R. Tolkien',
    genre: 'ficción',
    available: true,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4a/TheHobbit_FirstEdition.jpg'
  },
  {
    id: '7',
    isbn: 'B12351',
    title: 'El Origen de las Especies',
    author: 'Charles Darwin',
    genre: 'ciencia',
    available: false,
    borrowerId: '3',
    borrowerName: 'Olivia Brown',
    borrowerCode: 'S10003',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Origin_of_Species_title_page.jpg'
  },
  {
    id: '8',
    isbn: 'B12352',
    title: 'El Arte de la Guerra',
    author: 'Sun Tzu',
    genre: 'historia',
    available: true,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Lionel_Giles_The_Art_of_War.jpg'
  },
  {
    id: '9',
    isbn: 'B12353',
    title: 'La Ilíada',
    author: 'Homer',
    genre: 'literatura',
    available: true,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Beginning_of_the_Iliad.jpg/800px-Beginning_of_the_Iliad.jpg'
  },
  {
    id: '10',
    isbn: 'B12354',
    title: 'El Alquimista',
    author: 'Paulo Coelho',
    genre: 'ficción',
    available: false,
    borrowerId: '7',
    borrowerName: 'William Anderson',
    borrowerCode: 'S10007',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c4/TheAlchemist.jpg'
  },
  {
    id: '11',
    isbn: 'B12355',
    title: 'Sapiens: Una Breve Historia de la Humanidad',
    author: 'Yuval Noah Harari',
    genre: 'historia',
    available: true,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/4/45/Sapiens_A_Brief_History_of_Humankind.jpg'
  },
  {
    id: '12',
    isbn: 'B12356',
    title: 'Hamlet',
    author: 'William Shakespeare',
    genre: 'literatura',
    available: true,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Edwin_Booth_Hamlet_1870.jpg'
  },
  {
    id: '13',
    isbn: 'B12357',
    title: 'Pensar rápido, pensar despacio',
    author: 'Daniel Kahneman',
    genre: 'ciencia',
    available: true,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c1/Thinking%2C_Fast_and_Slow.jpg'
  },
  {
    id: '14',
    isbn: 'B12358',
    title: 'Guerra y Paz',
    author: 'Leo Tolstoy',
    genre: 'literatura',
    available: false,
    borrowerId: '9',
    borrowerName: 'James Taylor',
    borrowerCode: 'S10009',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Tolstoy_-_War_and_Peace_-_first_edition%2C_1869.jpg'
  },
  {
    id: '15',
    isbn: 'B12359',
    title: 'Los elementos del estilo',
    author: 'William Strunk Jr.',
    genre: 'arte',
    available: true,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/9/91/Elementsofstyle.jpg'
  }
];

export const mockUser: User = {
  username: 'admin',
  password: 'admin123'
};

export const genreColors: Record<Genre, string> = {
  ficción: '#E5DEFF',
  ciencia: '#F2FCE2',
  historia: '#FEF7CD',
  arte: '#FFDEE2',
  literatura: '#FDE1D3',
};
