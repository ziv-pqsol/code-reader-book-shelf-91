
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, isLoginLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Only proceed if we have username and password
    if (username.trim() && password.trim()) {
      const success = await login(username, password);
      if (success) {
        // Directly navigate to dashboard without animation
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="mx-auto mb-4 flex items-center justify-center bg-library-primary bg-opacity-10 rounded-full p-3">
            <Book className="h-10 w-10 text-library-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Biblioteca Escolar</CardTitle>
          <CardDescription className="text-center">
            Ingrese sus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input 
                id="username"
                placeholder="Ingrese su usuario" 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                disabled={isLoginLoading}
                autoComplete="username"
                className="focus:ring-2 focus:ring-library-primary focus:border-library-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password"
                placeholder="Ingrese su contraseña" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                disabled={isLoginLoading}
                autoComplete="current-password"
                className="focus:ring-2 focus:ring-library-primary focus:border-library-primary"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            <Button 
              type="submit" 
              className="w-full" 
              variant="default" 
              disabled={isLoginLoading || !username.trim() || !password.trim()}
            >
              {isLoginLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            <span className="font-medium">Nota:</span> Contacte al administrador para obtener sus credenciales de acceso.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
