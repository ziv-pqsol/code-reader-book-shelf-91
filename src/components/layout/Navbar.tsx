
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Search, Bell, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex md:hidden">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          <div className="flex flex-1 justify-center px-2 lg:ml-6 lg:justify-start">
            <form onSubmit={handleSearch} className="w-full max-w-lg">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-library-primary"
                  placeholder="Buscar libros, estudiantes..."
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>

          <div className="flex items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
              </Button>
              <Button 
                variant="outline" 
                onClick={logout}
                className="text-sm"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            <Button 
              variant="ghost"
              className="w-full justify-start" 
              onClick={() => { 
                navigate('/');
                setMobileMenuOpen(false);
              }}
            >
              Panel Principal
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => { 
                navigate('/students');
                setMobileMenuOpen(false);
              }}
            >
              Estudiantes
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => { 
                navigate('/books');
                setMobileMenuOpen(false);
              }}
            >
              Libros
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
