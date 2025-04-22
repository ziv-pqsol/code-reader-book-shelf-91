import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { username: string } | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
  isLoginLoading: boolean;
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
  const [isLoginLoading, setIsLoginLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for session expiry
  useEffect(() => {
    const checkSessionExpiry = () => {
      const sessionExpiry = localStorage.getItem('library_session_expiry');
      
      if (sessionExpiry) {
        const expiryTime = parseInt(sessionExpiry, 10);
        if (Date.now() >= expiryTime) {
          logout();
        }
      }
    };

    // Check session expiry every minute
    const interval = setInterval(checkSessionExpiry, 60000);

    // Initial check
    checkSessionExpiry();

    return () => clearInterval(interval);
  }, []);

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if there's a user saved in localStorage from our custom auth
        const savedUser = localStorage.getItem('library_user');
        const sessionExpiry = localStorage.getItem('library_session_expiry');
        
        if (savedUser && sessionExpiry) {
          // Check if the session is still valid
          const expiryTime = parseInt(sessionExpiry, 10);
          if (Date.now() < expiryTime) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
            
            // If we're on the login page and already authenticated, redirect to home
            if (location.pathname === '/login') {
              navigate('/');
            }
          } else {
            // Session expired, clear it
            localStorage.removeItem('library_user');
            localStorage.removeItem('library_session_expiry');
            if (location.pathname !== '/login') {
              navigate('/login');
            }
          }
        } else if (location.pathname !== '/login') {
          // No valid session found and not on login page, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('Error checking session:', error);
        // On error, clear potentially corrupted session data
        localStorage.removeItem('library_user');
        localStorage.removeItem('library_session_expiry');
        if (location.pathname !== '/login') {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, [navigate, location.pathname]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoginLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .select('username, password')
        .eq('username', username)
        .single();
      
      if (error || !data) {
        setError('Usuario o contraseña incorrectos');
        setIsLoginLoading(false);
        return false;
      }
      
      if (data.password !== password) {
        setError('Usuario o contraseña incorrectos');
        setIsLoginLoading(false);
        return false;
      }
      
      const userData = { username: data.username };
      setUser(userData);
      
      // Set session expiry to 24 hours from now
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
      localStorage.setItem('library_user', JSON.stringify(userData));
      localStorage.setItem('library_session_expiry', expiryTime.toString());
      
      setIsAuthenticated(true);
      
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${username}!`,
      });
      
      return true;
      
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError('Error al iniciar sesión');
      setIsLoginLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('library_user');
    localStorage.removeItem('library_session_expiry');
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
        isLoginLoading,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
