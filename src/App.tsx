
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
import PromptForge from "@/pages/PromptForge";
import PromptGenerator from "@/pages/PromptGenerator";
import MemoryManager from "@/pages/MemoryManager";
import Settings from "@/pages/Settings";
import NotFound from "./pages/NotFound";
import "./animations.css";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize app
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MemoryProvider>
          <ChatProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="min-h-screen bg-background transition-colors duration-300">
                  <Routes>
                    <Route path="/" element={<MainLayout />}>
                      <Route index element={<ChatInterface />} />
                      <Route path="prompt-forge" element={<PromptForge />} />
                      <Route path="prompt-generator" element={<PromptGenerator />} />
                      <Route path="memory" element={<MemoryManager />} />
                      <Route path="settings" element={<Settings />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </ChatProvider>
        </MemoryProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
