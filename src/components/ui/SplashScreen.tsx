
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export const SplashScreen = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="flex flex-col items-center space-y-6">
        <img 
          src="/lovable-uploads/c4ccfc25-8070-4b46-b114-db5d4bdfd2f7.png" 
          alt="NyxChat Logo" 
          className="w-24 h-24"
        />
        <h1 className="text-4xl font-bold text-white">NyxChat</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    </div>
  );
};
