
import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ChatFooter } from "@/components/chat/ChatFooter";
import { ScrollToBottomButton } from "@/components/chat/ScrollToBottomButton";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useChat } from "@/contexts/ChatContext";
import { useSidebar } from '@/components/ui/sidebar';

const ChatInterface = () => {
  const {
    currentConversation,
    isTyping,
    sendMessage,
  } = useChat();
  const { setOpenMobile } = useSidebar();

  const [inputValue, setInputValue] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
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

  // Enhanced mobile keyboard handling
  useEffect(() => {
    let initialViewportHeight = window.visualViewport?.height || window.innerHeight;
    
    const handleViewportChange = () => {
      if (window.visualViewport) {
        const currentHeight = window.visualViewport.height;
        const heightDiff = initialViewportHeight - currentHeight;
        const newKeyboardHeight = Math.max(0, heightDiff);
        
        setKeyboardHeight(newKeyboardHeight);
        setIsKeyboardOpen(newKeyboardHeight > 100);
        
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    setShowScrollToBottom(false);
  };

  const getScrollContainerHeight = () => {
    if (isKeyboardOpen) {
      return `calc(100vh - 64px - 80px - ${keyboardHeight}px)`;
    }
    return `calc(100vh - 64px - 80px)`;
  };

  return (
    <div 
      ref={chatContainerRef}
      className="flex flex-col bg-gradient-to-br from-background to-background/95 h-screen overflow-hidden"
    >
      <AppHeader isOnline={isOnline} />

      {/* Main Content Container */}
      <div 
        className="flex-1 relative"
        style={{ 
          marginTop: '64px',
          height: getScrollContainerHeight(),
          overflow: 'hidden'
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
          <div 
            ref={messagesContainerRef}
            className="h-full overflow-y-auto scroll-smooth custom-scrollbar"
            style={{ 
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              paddingBottom: isKeyboardOpen ? '20px' : '20px'
            }}
          >
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
          </div>
        )}
      </div>

      <ScrollToBottomButton
        show={showScrollToBottom && !showWelcome}
        onClick={scrollToBottom}
        isKeyboardOpen={isKeyboardOpen}
        keyboardHeight={keyboardHeight}
      />

      <ChatFooter
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSend={handleSend}
        onKeyDown={handleKeyDown}
        isTyping={isTyping}
        isKeyboardOpen={isKeyboardOpen}
        keyboardHeight={keyboardHeight}
      />

      <AppFooter />
      
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
};

export default ChatInterface;
