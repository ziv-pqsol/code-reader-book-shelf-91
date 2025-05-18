
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Search, Menu, X, QrCode, FileSpreadsheet, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import BetterISBNScanner from '@/components/BetterISBNScanner';
import ExportDataDialog from '@/components/ExportDataDialog';

const Navbar = () => {
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      toast({
        title: "Búsqueda iniciada",
        description: `Buscando: ${searchQuery}`,
      });
    } else {
      toast({
        title: "Búsqueda vacía",
        description: "Por favor ingresa un término de búsqueda",
        variant: "destructive",
      });
    }
  };

  const handleScanISBN = (isbn: string) => {
    setShowScanner(false);
    setSearchQuery(isbn);
    navigate(`/search-results?q=${encodeURIComponent(isbn)}`);
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
              <div className="relative flex gap-2">
                <div className="relative flex-grow">
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
                <Button 
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowScanner(true)}
                >
                  <QrCode className="h-4 w-4" />
                </Button>
                <Button type="submit">Buscar</Button>
              </div>
            </form>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowExportDialog(true)}
              className="hidden sm:flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden md:inline">Exportar Datos</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                logout();
                toast({
                  title: "Sesión cerrada",
                  description: "Has cerrado sesión exitosamente",
                });
              }}
              className="text-sm"
            >
              Cerrar Sesión
            </Button>
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
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => { 
                navigate('/search');
                setMobileMenuOpen(false);
              }}
            >
              Búsqueda
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => { 
                setShowExportDialog(true);
                setMobileMenuOpen(false);
              }}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Datos
            </Button>
          </div>
        </div>
      )}

      {/* Scanner Dialog */}
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="sm:max-w-[425px]">
          <BetterISBNScanner 
            onScan={handleScanISBN}
            onClose={() => setShowScanner(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Export Data Dialog */}
      <ExportDataDialog 
        open={showExportDialog} 
        onOpenChange={setShowExportDialog} 
      />
    </header>
  );
};

export default Navbar;
