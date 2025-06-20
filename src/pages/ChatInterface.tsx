
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!showWelcome) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isTyping, showWelcome]);

  // Monitor scroll position for scroll-to-bottom button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || showWelcome) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollToBottom(!isNearBottom && messages.length > 3);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages.length, showWelcome]);

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

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background to-background/95 overflow-hidden">
      <AppHeader isOnline={isOnline} />

      {/* Main Content - Fixed height with proper bottom padding */}
      <div 
        className="flex-1 relative"
        style={{ 
          height: 'calc(100vh - 64px - 80px)', // Account for header and footer
          marginTop: '64px'
        }}
      >
        {showWelcome ? (
          <div className="h-full overflow-hidden">
            <WelcomeScreen 
              onQuickPrompt={handleQuickPrompt}
              inputValue={inputValue}
              setInputValue={setInputValue}
              onSend={handleSend}
              onKeyDown={handleKeyDown}
              isTyping={isTyping}
            />
          </div>
        ) : (
          <div 
            ref={messagesContainerRef}
            className="h-full overflow-y-auto scroll-smooth custom-scrollbar"
            style={{ 
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain'
            }}
          >
            <div className="max-w-4xl mx-auto space-y-6 px-4 py-4 pb-8">
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
      />

      <ChatFooter
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSend={handleSend}
        onKeyDown={handleKeyDown}
        isTyping={isTyping}
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
