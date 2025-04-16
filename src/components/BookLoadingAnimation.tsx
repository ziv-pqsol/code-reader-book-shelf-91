
import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookLoadingAnimationProps {
  onAnimationComplete?: () => void;
  durationMs?: number;
}

const BookLoadingAnimation = ({
  onAnimationComplete,
  durationMs = 2000,
}: BookLoadingAnimationProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 5; // Number of page flips in the animation
  const pageFlipInterval = durationMs / totalPages;

  useEffect(() => {
    // Start the page flipping animation
    const interval = setInterval(() => {
      setCurrentPage(prev => {
        const next = prev + 1;
        return next <= totalPages ? next : prev;
      });
    }, pageFlipInterval);

    // Set a timeout to complete the animation
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, durationMs);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [durationMs, onAnimationComplete, pageFlipInterval]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-library-primary/10 z-50">
      <div className="relative">
        <BookOpen 
          className={cn(
            "h-20 w-20 text-library-primary transition-all duration-300 ease-in-out",
            currentPage > 0 && "animate-pulse"
          )} 
          strokeWidth={1.5} 
        />
        <div className={cn(
          "absolute -bottom-8 left-1/2 transform -translate-x-1/2 transition-all",
          currentPage >= totalPages ? "opacity-100" : "opacity-0"
        )}>
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-2 h-2 rounded-full bg-library-primary",
                  currentPage >= totalPages && "animate-bounce"
                )}
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8 text-xl font-semibold text-library-primary">
        {currentPage < totalPages * 0.3 && "Preparando..."}
        {currentPage >= totalPages * 0.3 && currentPage < totalPages * 0.6 && "Cargando biblioteca..."}
        {currentPage >= totalPages * 0.6 && currentPage < totalPages && "Casi listo..."}
        {currentPage >= totalPages && "¡Bienvenido!"}
      </div>

      {/* Pages flipping effect */}
      {[...Array(totalPages)].map((_, index) => (
        <div 
          key={index}
          className={cn(
            "absolute h-24 w-24 bg-white border border-library-primary/30 rounded-r shadow-md",
            "transition-all duration-300 ease-in-out",
            index < currentPage ? "opacity-0 rotate-90 translate-x-20" : "opacity-100"
          )}
          style={{ 
            transformOrigin: 'left center',
            zIndex: totalPages - index,
            left: '50%',
            top: '50%',
            marginLeft: -60 + index * 2, 
            marginTop: -48,
            transitionDelay: `${index * 100}ms`
          }}
        />
      ))}
    </div>
  );
};

export default BookLoadingAnimation;
