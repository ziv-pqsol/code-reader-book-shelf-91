
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { username: string } | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if there's a user saved in localStorage from our custom auth
        const savedUser = localStorage.getItem('library_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      
      // Check credentials in users table
      const { data, error } = await supabase
        .from('users')
        .select('username, password')
        .eq('username', username)
        .single();
      
      if (error || !data) {
        setError('Usuario o contraseña incorrectos');
        return false;
      }
      
      if (data.password !== password) {
        setError('Usuario o contraseña incorrectos');
        return false;
      }
      
      // Save user to state and localStorage
      const userData = { username: data.username };
      setUser(userData);
      localStorage.setItem('library_user', JSON.stringify(userData));
      setIsAuthenticated(true);
      
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${username}!`,
      });
      
      return true;
      
    } catch (err) {
      console.error('Login error:', err);
      setError('Error al iniciar sesión');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('library_user');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        error,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
