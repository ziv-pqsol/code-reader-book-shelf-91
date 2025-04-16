
import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface BookLoadingAnimationProps {
  onAnimationComplete?: () => void;
  durationMs?: number;
}

const BookLoadingAnimation = ({
  onAnimationComplete,
  durationMs = 2000,
}: BookLoadingAnimationProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [progress, setProgress] = useState(0);
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

    // Create a separate interval for smoother progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (durationMs / 50));
        return newProgress < 100 ? newProgress : 100;
      });
    }, 50);

    // Set a timeout to complete the animation
    const timeout = setTimeout(() => {
      clearInterval(interval);
      clearInterval(progressInterval);
      setProgress(100);
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, durationMs);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, [durationMs, onAnimationComplete, pageFlipInterval]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <div className="w-full max-w-md px-6 flex flex-col items-center">
        <div className="relative mb-12">
          <BookOpen 
            className={cn(
              "h-24 w-24 text-library-primary transition-all duration-300 ease-in-out",
              currentPage > 0 && "animate-pulse"
            )} 
            strokeWidth={1.5} 
          />
          
          {/* Pages flipping effect */}
          {[...Array(totalPages)].map((_, index) => (
            <div 
              key={index}
              className={cn(
                "absolute h-28 w-28 bg-white border border-library-primary/30 rounded-r shadow-md",
                "transition-all duration-300 ease-in-out",
                index < currentPage ? "opacity-0 rotate-90 translate-x-20" : "opacity-100"
              )}
              style={{ 
                transformOrigin: 'left center',
                zIndex: totalPages - index,
                left: '50%',
                top: '50%',
                marginLeft: -56 + index * 2, 
                marginTop: -56,
                transitionDelay: `${index * 100}ms`
              }}
            />
          ))}
        </div>
        
        <div className="w-full max-w-sm space-y-4">
          <div className="text-xl font-semibold text-library-primary text-center mb-3">
            {currentPage < totalPages * 0.3 && "Preparando..."}
            {currentPage >= totalPages * 0.3 && currentPage < totalPages * 0.6 && "Cargando biblioteca..."}
            {currentPage >= totalPages * 0.6 && currentPage < totalPages && "Casi listo..."}
            {currentPage >= totalPages && "¡Bienvenido!"}
          </div>
          
          <Progress 
            value={progress} 
            className="h-2 w-full bg-library-light" 
          />
          
          <div className="flex justify-center space-x-2 mt-2">
            <div 
              className={cn(
                "w-2 h-2 rounded-full bg-library-primary",
                progress > 30 && "animate-bounce"
              )}
              style={{ animationDelay: "0ms" }}
            />
            <div 
              className={cn(
                "w-2 h-2 rounded-full bg-library-primary",
                progress > 50 && "animate-bounce"
              )}
              style={{ animationDelay: "150ms" }}
            />
            <div 
              className={cn(
                "w-2 h-2 rounded-full bg-library-primary",
                progress > 70 && "animate-bounce"
              )}
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookLoadingAnimation;
