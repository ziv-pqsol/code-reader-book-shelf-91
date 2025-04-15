
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
    code: 'B12345',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'literature',
    available: true,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/To_Kill_a_Mockingbird_%28first_edition_cover%29.jpg'
  },
  {
    id: '2',
    code: 'B12346',
    title: '1984',
    author: 'George Orwell',
    genre: 'fiction',
    available: false,
    borrowerId: '1',
    borrowerName: 'Emma Johnson',
    borrowerCode: 'S10001',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/1984first.jpg'
  },
  {
    id: '3',
    code: 'B12347',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'literature',
    available: true,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg'
  },
  {
    id: '4',
    code: 'B12348',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    genre: 'science',
    available: true,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/6/6e/A_brief_history_of_time.jpg'
  },
  {
    id: '5',
    code: 'B12349',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    genre: 'literature',
    available: false,
    borrowerId: '5',
    borrowerName: 'Ava Davis',
    borrowerCode: 'S10005',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/17/PrideAndPrejudiceTitlePage.jpg'
  },
  {
    id: '6',
    code: 'B12350',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    genre: 'fiction',
    available: true,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4a/TheHobbit_FirstEdition.jpg'
  },
  {
    id: '7',
    code: 'B12351',
    title: 'The Origin of Species',
    author: 'Charles Darwin',
    genre: 'science',
    available: false,
    borrowerId: '3',
    borrowerName: 'Olivia Brown',
    borrowerCode: 'S10003',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Origin_of_Species_title_page.jpg'
  },
  {
    id: '8',
    code: 'B12352',
    title: 'The Art of War',
    author: 'Sun Tzu',
    genre: 'history',
    available: true,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Lionel_Giles_The_Art_of_War.jpg'
  },
  {
    id: '9',
    code: 'B12353',
    title: 'The Iliad',
    author: 'Homer',
    genre: 'literature',
    available: true,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Beginning_of_the_Iliad.jpg/800px-Beginning_of_the_Iliad.jpg'
  },
  {
    id: '10',
    code: 'B12354',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    genre: 'fiction',
    available: false,
    borrowerId: '7',
    borrowerName: 'William Anderson',
    borrowerCode: 'S10007',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c4/TheAlchemist.jpg'
  },
  {
    id: '11',
    code: 'B12355',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    genre: 'history',
    available: true,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/4/45/Sapiens_A_Brief_History_of_Humankind.jpg'
  },
  {
    id: '12',
    code: 'B12356',
    title: 'Hamlet',
    author: 'William Shakespeare',
    genre: 'literature',
    available: true,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Edwin_Booth_Hamlet_1870.jpg'
  },
  {
    id: '13',
    code: 'B12357',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    genre: 'science',
    available: true,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c1/Thinking%2C_Fast_and_Slow.jpg'
  },
  {
    id: '14',
    code: 'B12358',
    title: 'War and Peace',
    author: 'Leo Tolstoy',
    genre: 'literature',
    available: false,
    borrowerId: '9',
    borrowerName: 'James Taylor',
    borrowerCode: 'S10009',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Tolstoy_-_War_and_Peace_-_first_edition%2C_1869.jpg'
  },
  {
    id: '15',
    code: 'B12359',
    title: 'The Elements of Style',
    author: 'William Strunk Jr.',
    genre: 'arts',
    available: true,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/9/91/Elementsofstyle.jpg'
  }
];

export const mockUser: User = {
  username: 'admin',
  password: 'admin123'
};

export const genreColors: Record<Genre, string> = {
  fiction: '#E5DEFF',
  nonfiction: '#D3E4FD',
  science: '#F2FCE2',
  history: '#FEF7CD',
  arts: '#FFDEE2',
  literature: '#FDE1D3',
};
