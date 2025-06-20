
import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ChatFooter } from "@/components/chat/ChatFooter";
import { ScrollToBottomButton } from "@/components/chat/ScrollToBottomButton";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { ModelSwitcher } from "@/components/ui/ModelSwitcher";
import { TokenCounter } from "@/components/ui/TokenCounter";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useChat } from "@/contexts/ChatContext";
import { useSidebar } from '@/components/ui/sidebar';

const SAMPLE_MODELS = [
  { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model' },
  { id: 'gpt-3.5', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
  { id: 'claude-3', name: 'Claude 3', description: 'Great for analysis' },
];

const ChatInterface = () => {
  const {
    currentConversation,
    isTyping,
    currentProfile,
    setCurrentProfile,
    sendMessage,
  } = useChat();
  const { setOpenMobile } = useSidebar();

  const [inputValue, setInputValue] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState('gpt-4');
  const [tokenCount, setTokenCount] = useState(0);
  
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

  // Update token count when messages change
  useEffect(() => {
    const estimatedTokens = messages.reduce((total, msg) => {
      return total + Math.ceil(msg.content.length / 4); // Rough estimate
    }, 0);
    setTokenCount(estimatedTokens);
  }, [messages]);

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

  const getScrollContainerHeight = () => {
    if (isKeyboardOpen) {
      return `calc(100vh - 64px - 64px - ${keyboardHeight}px)`;
    }
    return `calc(100vh - 64px - 64px)`;
  };

  return (
    <div 
      ref={chatContainerRef}
      className="flex flex-col bg-gradient-to-br from-background to-background/95 h-screen overflow-hidden"
    >
      <AppHeader isOnline={isOnline} />

      {/* Enhanced toolbar for desktop */}
      <div className="hidden md:flex items-center justify-between px-4 py-2 border-b bg-card/50 backdrop-blur-sm shadow-sm" style={{ marginTop: '64px' }}>
        <div className="flex items-center gap-3">
          <ModelSwitcher
            currentModel={currentModel}
            models={SAMPLE_MODELS}
            onModelChange={setCurrentModel}
          />
          <TokenCounter tokens={tokenCount} maxTokens={4000} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSettingsOpen(true)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Settings
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div 
        className="flex-1 relative"
        style={{ 
          marginTop: showWelcome ? '64px' : '0px',
          height: getScrollContainerHeight(),
          overflow: 'hidden'
        }}
      >
        <div 
          ref={messagesContainerRef}
          className="h-full overflow-y-auto scroll-smooth custom-scrollbar"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            paddingBottom: isKeyboardOpen ? '20px' : '20px'
          }}
        >
          {showWelcome ? (
            <div className="h-full">
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
