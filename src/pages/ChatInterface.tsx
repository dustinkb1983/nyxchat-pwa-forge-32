import React, { useState, useRef, useEffect } from "react";
import { Moon, Sun, Menu } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ChatFooter } from "@/components/chat/ChatFooter";
import { ScrollToBottomButton } from "@/components/chat/ScrollToBottomButton";
import { useChat } from "@/contexts/ChatContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ChatInterface = () => {
  const {
    currentConversation,
    isTyping,
    currentProfile,
    setCurrentProfile,
    sendMessage,
  } = useChat();
  const { theme, toggleTheme } = useTheme();
  const { state, toggleSidebar } = useSidebar();

  const [inputValue, setInputValue] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const messages = currentConversation?.messages || [];
  const showWelcome = messages.length === 0;

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Enhanced mobile keyboard handling with improved positioning
  useEffect(() => {
    let initialViewportHeight = window.visualViewport?.height || window.innerHeight;
    
    const handleViewportChange = () => {
      if (window.visualViewport) {
        const currentHeight = window.visualViewport.height;
        const heightDiff = initialViewportHeight - currentHeight;
        const newKeyboardHeight = Math.max(0, heightDiff);
        
        setKeyboardHeight(newKeyboardHeight);
        setIsKeyboardOpen(newKeyboardHeight > 100);
        
        // Auto-scroll when keyboard opens
        if (newKeyboardHeight > 100) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
          }, 150);
        }
      }
    };

    const handleResize = () => {
      if (!window.visualViewport) {
        const currentHeight = window.innerHeight;
        const heightDiff = initialViewportHeight - currentHeight;
        const newKeyboardHeight = Math.max(0, heightDiff);
        
        setKeyboardHeight(newKeyboardHeight);
        setIsKeyboardOpen(newKeyboardHeight > 150);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  // Monitor scroll position for scroll-to-bottom button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollToBottom(!isNearBottom && messages.length > 3);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const message = inputValue.trim();
    setInputValue("");

    await sendMessage(message);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        return;
      } else {
        e.preventDefault();
        handleSend();
      }
    }
  };
  
  const handleProfileChange = (profileId: string) => {
    setCurrentProfile(profileId);
    toast.success(`Profile switched!`);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    setShowScrollToBottom(false);
  };

  // Calculate the available height for the scrollable content
  const scrollableHeight = isKeyboardOpen 
    ? `calc(100vh - 64px - ${keyboardHeight + 64 + 12}px)` // header + footer + keyboard + padding
    : `calc(100vh - 64px - 64px)`; // header + footer

  return (
    <div 
      ref={chatContainerRef}
      className="flex flex-col bg-background relative h-screen overflow-hidden"
    >
      {/* Fixed Header - Always visible */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 border-b bg-card/95 backdrop-blur-md h-16">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 transition-transform duration-200 hover:scale-105"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
          <img 
            src={theme === 'dark' ? './lovable-uploads/2fe14165-cccc-44c9-a268-7ab4c910b4d8.png' : './lovable-uploads/f1345f48-4cf9-47e5-960c-3b6d62925c7f.png'} 
            alt="NyxChat" 
            className="w-8 h-8 transition-all duration-200"
          />
          <h1 className="font-semibold text-base">NyxChat</h1>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  isOnline ? 'bg-green-500' : 'bg-red-500'
                }`}
                aria-label={isOnline ? "Online" : "Offline"}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>{isOnline ? "Online" : "Offline"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 transition-transform duration-200 hover:scale-105"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Scrollable Content Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth overscroll-contain custom-scrollbar"
        style={{ 
          marginTop: '64px',
          height: scrollableHeight,
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {showWelcome ? (
          <WelcomeScreen 
            onQuickPrompt={handleQuickPrompt}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSend={handleSend}
            onKeyDown={handleKeyDown}
            isTyping={isTyping}
          />
        ) : (
          <div className="max-w-4xl mx-auto space-y-6 px-4 py-4">
            {messages.map((message, index) => (
              <div 
                key={message.id}
                className="opacity-100 transition-opacity duration-300"
              >
                <ChatMessage
                  message={message}
                  index={index}
                />
              </div>
            ))}
            {isTyping && (
              <div className="opacity-100 transition-opacity duration-300">
                <TypingIndicator />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Scroll to Bottom Button */}
      <ScrollToBottomButton
        show={showScrollToBottom && !showWelcome}
        onClick={scrollToBottom}
        isKeyboardOpen={isKeyboardOpen}
        keyboardHeight={keyboardHeight}
      />

      {/* Fixed Chat Footer - Always present */}
      <ChatFooter
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSend={handleSend}
        onKeyDown={handleKeyDown}
        isTyping={isTyping}
        isKeyboardOpen={isKeyboardOpen}
        keyboardHeight={keyboardHeight}
      />
    </div>
  );
};

export default ChatInterface;
