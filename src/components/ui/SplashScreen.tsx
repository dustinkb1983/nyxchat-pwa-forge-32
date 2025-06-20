
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export const SplashScreen = () => {
  const { theme } = useTheme();
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade in immediately
    setFadeIn(true);
    
    // Start fade out after 2.5 seconds (increased from 1.2s)
    const fadeOutTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    return () => clearTimeout(fadeOutTimer);
  }, []);

  return (
    <div className={`min-h-screen bg-black flex flex-col items-center justify-center transition-opacity duration-500 ${
      fadeIn && !fadeOut ? 'opacity-100' : 'opacity-0'
    } ${fadeOut ? 'animate-fade-out' : 'animate-fade-in'}`}>
      <div className="flex flex-col items-center space-y-8">
        <img 
          src="/lovable-uploads/c4ccfc25-8070-4b46-b114-db5d4bdfd2f7.png" 
          alt="NyxChat Logo" 
          className={`w-32 h-32 transition-all duration-700 ${
            fadeIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        />
        <h1 className={`text-5xl font-bold text-white transition-all duration-700 delay-200 ${
          fadeIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          NyxChat
        </h1>
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-white transition-all duration-700 delay-400 ${
          fadeIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}></div>
      </div>
    </div>
  );
};
