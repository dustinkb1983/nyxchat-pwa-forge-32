
import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { MemoryProvider } from "@/contexts/MemoryContext";
import MainLayout from "@/components/layout/MainLayout";
import ChatInterface from "@/pages/ChatInterface";
import MemoryManager from "@/pages/MemoryManager";
import ProfileManager from "@/pages/ProfileManager";
import Settings from "@/pages/Settings";
import NotFound from "./pages/NotFound";
import { SplashScreen } from "@/components/ui/SplashScreen";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import "./animations.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Initialize app with mobile-optimized loading
    const timer = setTimeout(() => setIsLoading(false), 1500);
    
    // Preload critical resources
    const preloadImages = [
      './icon-192.png',
      './icon-512.png',
      './lovable-uploads/2fe14165-cccc-44c9-a268-7ab4c910b4d8.png',
      './lovable-uploads/f1345f48-4cf9-47e5-960c-3b6d62925c7f.png'
    ];
    
    preloadImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
    
    return () => clearTimeout(timer);
  }, []);

  // Handle viewport height for mobile
  React.useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    
    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MemoryProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {isLoading ? (
              <SplashScreen />
            ) : (
              <BrowserRouter>
                <ChatProvider>
                  <div className="min-h-screen bg-background transition-colors duration-300" style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
                    <Routes>
                      <Route path="/" element={<MainLayout />}>
                        <Route index element={<ChatInterface />} />
                        <Route path="memory" element={<MemoryManager />} />
                        <Route path="profiles" element={<ProfileManager />} />
                        <Route path="settings" element={<Settings />} />
                      </Route>
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <PWAInstallPrompt />
                  </div>
                </ChatProvider>
              </BrowserRouter>
            )}
          </TooltipProvider>
        </MemoryProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
