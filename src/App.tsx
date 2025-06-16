
import { useState, useEffect } from "react";
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
import "./animations.css";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize app
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MemoryProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ChatProvider>
                <div className="min-h-screen bg-background transition-colors duration-300">
                  <Routes>
                    <Route path="/" element={<MainLayout />}>
                      <Route index element={<ChatInterface />} />
                      <Route path="memory" element={<MemoryManager />} />
                      <Route path="profiles" element={<ProfileManager />} />
                      <Route path="settings" element={<Settings />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </ChatProvider>
            </BrowserRouter>
          </TooltipProvider>
        </MemoryProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
