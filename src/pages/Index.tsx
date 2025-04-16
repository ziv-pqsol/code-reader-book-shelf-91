
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import BookLoadingAnimation from '@/components/BookLoadingAnimation';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Create a timeout to simulate loading
    const timeout = setTimeout(() => {
      if (isAuthenticated) {
        navigate('/');
      } else {
        navigate('/login');
      }
    }, 2500); // Show animation for 2.5 seconds
    
    return () => clearTimeout(timeout);
  }, [isAuthenticated, navigate]);

  return <BookLoadingAnimation durationMs={2500} />;
};

export default Index;
