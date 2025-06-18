
import React, { useState, useRef, useEffect } from "react";
import { Send, Moon, Sun, Menu, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  // Enhanced mobile keyboard handling with smooth transitions
  useEffect(() => {
    let initialViewportHeight = window.visualViewport?.height || window.innerHeight;
    
    const handleViewportChange = () => {
      if (window.visualViewport) {
        const currentHeight = window.visualViewport.height;
        const heightDiff = initialViewportHeight - currentHeight;
        const newKeyboardHeight = Math.max(0, heightDiff);
        
        setKeyboardHeight(newKeyboardHeight);
        setIsKeyboardOpen(newKeyboardHeight > 50); // Threshold for keyboard detection
        
        // Smooth scroll to bottom when keyboard opens
        if (newKeyboardHeight > 50) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
          }, 150);
        }
      }
    };

    // Fallback for browsers without visualViewport
    const handleResize = () => {
      if (!window.visualViewport) {
        const currentHeight = window.innerHeight;
        const heightDiff = initialViewportHeight - currentHeight;
        const newKeyboardHeight = Math.max(0, heightDiff);
        
        setKeyboardHeight(newKeyboardHeight);
        setIsKeyboardOpen(newKeyboardHeight > 100);
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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const message = inputValue.trim();
    setInputValue("");
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await sendMessage(message);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
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

  return (
    <div 
      ref={chatContainerRef}
      className="flex flex-col bg-background relative transition-all duration-300 ease-out"
      style={{ 
        height: 'calc(var(--vh, 1vh) * 100)',
        transform: isKeyboardOpen ? `translateY(-${Math.min(keyboardHeight * 0.3, 100)}px)` : 'translateY(0)',
      }}
    >
      {/* Sticky Header - Always visible */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b bg-card/95 backdrop-blur-md shrink-0 transition-all duration-300">
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

      {/* Chat Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth overscroll-contain custom-scrollbar"
        style={{ 
          paddingBottom: isKeyboardOpen ? '120px' : '100px',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {showWelcome ? (
          <div className="opacity-100 transition-opacity duration-300">
            <WelcomeScreen onQuickPrompt={handleQuickPrompt} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
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

      {/* Scroll to Bottom Button */}
      {showScrollToBottom && (
        <Button
          onClick={scrollToBottom}
          size="icon"
          className="fixed right-4 z-20 h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
          style={{
            bottom: isKeyboardOpen ? `${120 + keyboardHeight * 0.1}px` : '120px',
          }}
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      )}

      {/* Sticky Chat Input Footer - Always visible */}
      <div 
        className="sticky bottom-0 z-30 border-t bg-card/95 backdrop-blur-md p-3 shrink-0 transition-all duration-300 ease-out"
        style={{
          transform: isKeyboardOpen ? 'translateY(0)' : 'translateY(0)',
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-h-[44px] max-h-[120px] resize-none pr-12 bg-background transition-all duration-200 text-base"
                disabled={isTyping}
                style={{ fontSize: '16px' }}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              size="icon"
              className="h-11 w-11 rounded-full transition-all duration-200 hover:scale-105 disabled:hover:scale-100 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-end items-center mt-1 text-xs text-muted-foreground">
            <span>{inputValue.length}/2000</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
