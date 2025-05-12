
import { cn } from '@/lib/utils';
import { Book, BarChart3, Users, History } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-5">
          <Link to="/" className="flex items-center">
            <Book className="w-8 h-8 text-library-primary" />
            <span className="ml-2 text-xl font-bold text-gray-800">Biblioteca Escolar</span>
          </Link>
        </div>
        <div className="flex flex-col flex-grow">
          <nav className="flex-1 space-y-1 px-2">
            <Link
              to="/"
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                isActive('/')
                  ? "bg-library-primary bg-opacity-10 text-library-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <BarChart3 className={cn(
                "mr-3 h-5 w-5",
                isActive('/') ? "text-library-primary" : "text-gray-400 group-hover:text-gray-500"
              )} />
              Panel Principal
            </Link>
            
            <Link
              to="/students"
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                isActive('/students')
                  ? "bg-library-primary bg-opacity-10 text-library-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Users className={cn(
                "mr-3 h-5 w-5",
                isActive('/students') ? "text-library-primary" : "text-gray-400 group-hover:text-gray-500"
              )} />
              Estudiantes
            </Link>
            
            <Link
              to="/books"
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                isActive('/books')
                  ? "bg-library-primary bg-opacity-10 text-library-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Book className={cn(
                "mr-3 h-5 w-5",
                isActive('/books') ? "text-library-primary" : "text-gray-400 group-hover:text-gray-500"
              )} />
              Libros
            </Link>
            
            <Link
              to="/history"
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                isActive('/history')
                  ? "bg-library-primary bg-opacity-10 text-library-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <History className={cn(
                "mr-3 h-5 w-5",
                isActive('/history') ? "text-library-primary" : "text-gray-400 group-hover:text-gray-500"
              )} />
              Historial
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
