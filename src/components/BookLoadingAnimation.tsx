
import React, { useEffect, useState } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
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

  // Determine loading message based on progress
  const getLoadingMessage = () => {
    if (progress < 30) return "Preparando...";
    if (progress < 60) return "Cargando biblioteca...";
    if (progress < 90) return "Casi listo...";
    return "¡Bienvenido!";
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-white to-library-light/20 z-50">
      <div className="w-full max-w-md px-6 flex flex-col items-center">
        <div className="relative mb-12 group">
          {/* Book shadow */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-2 bg-black/10 rounded-full blur-md"></div>
          
          {/* Central book icon with glow effect */}
          <div className="relative">
            <div className="absolute inset-0 bg-library-primary/20 rounded-full blur-xl animate-pulse"></div>
            <BookOpen 
              className={cn(
                "h-24 w-24 text-library-primary relative z-10 transition-all duration-300 ease-in-out",
                currentPage > 0 && "animate-pulse"
              )} 
              strokeWidth={1.5} 
            />
            
            {/* Sparkle effects */}
            <Sparkles 
              className="absolute -top-2 -right-2 h-6 w-6 text-library-light animate-pulse" 
              style={{ animationDelay: "200ms" }}
            />
            <Sparkles 
              className="absolute bottom-0 -left-2 h-5 w-5 text-library-secondary animate-pulse" 
              style={{ animationDelay: "500ms" }}
            />
          </div>
          
          {/* Pages flipping effect with improved styling */}
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
                transitionDelay: `${index * 100}ms`,
                background: index % 2 === 0 ? 'white' : 'linear-gradient(to bottom, rgba(255,255,255,1), rgba(246,240,255,1))'
              }}
            >
              {/* Text lines on pages */}
              {index % 2 === 0 && (
                <div className="h-full w-full p-4 flex flex-col justify-center space-y-2">
                  <div className="h-1 w-3/4 bg-library-light/50 rounded"></div>
                  <div className="h-1 w-1/2 bg-library-light/50 rounded"></div>
                  <div className="h-1 w-4/5 bg-library-light/50 rounded"></div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="w-full max-w-sm space-y-4">
          <div className="text-xl font-semibold text-library-primary text-center mb-3">
            {getLoadingMessage()}
          </div>
          
          {/* Stylish progress bar with gradient */}
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden p-[1px]">
            <Progress 
              value={progress} 
              className="h-full w-full bg-gradient-to-r from-library-primary to-library-secondary rounded-full" 
            />
          </div>
          
          {/* Animated dots with better spacing and timing */}
          <div className="flex justify-center space-x-2 mt-2">
            {[0, 1, 2].map((i) => (
              <div 
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full bg-library-primary/80",
                  progress > (i + 1) * 25 && "animate-bounce"
                )}
                style={{ 
                  animationDelay: `${i * 150}ms`,
                  animationDuration: "0.8s"
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookLoadingAnimation;
