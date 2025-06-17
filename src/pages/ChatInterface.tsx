
import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, StopCircle, Moon, Sun, Menu } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { useChat } from "@/contexts/ChatContext";
import { AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useSidebar } from '@/components/ui/sidebar';

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
  const isCollapsed = state === 'collapsed';

  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = currentConversation?.messages || [];
  const showWelcome = messages.length === 0;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const message = inputValue.trim();
    setInputValue("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await sendMessage(message);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
    // Focus the textarea after setting the value
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter: new line (default behavior)
        return;
      } else {
        // Enter: send message
        e.preventDefault();
        handleSend();
      }
    }
  };
  
  const handleProfileChange = (profileId: string) => {
    setCurrentProfile(profileId);
    toast.success(`Profile switched!`);
  };

  return (
    <div className="flex flex-col h-full bg-background no-horizontal-scroll">
      {/* Chat Header - centered with logo */}
      <header className="flex items-center justify-between px-4 py-2 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10" style={{ minHeight: "48px", height: "48px" }}>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 ripple-button elegant-transition"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Centered title with logo and status */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
          <img 
            src={theme === 'dark' ? '/lovable-uploads/2fe14165-cccc-44c9-a268-7ab4c910b4d8.png' : '/lovable-uploads/f1345f48-4cf9-47e5-960c-3b6d62925c7f.png'} 
            alt="NyxChat" 
            className="app-logo"
          />
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-base">NyxChat</h1>
            <div className={`relative flex h-2 w-2 status-dot ${isTyping ? 'bg-red-500' : 'bg-green-500'}`} title={isTyping ? "AI Typing" : "Ready"}>
              <div className="absolute inline-flex h-full w-full rounded-full"></div>
              <div className="relative inline-flex rounded-full h-2 w-2"></div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="ripple-button elegant-transition"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 no-horizontal-scroll">
        {showWelcome ? (
          <WelcomeScreen onQuickPrompt={handleQuickPrompt} />
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <AnimatePresence>
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  index={index}
                />
              ))}
            </AnimatePresence>
            {isTyping && (
              <TypingIndicator />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="border-t bg-card/50 backdrop-blur-sm p-4 no-horizontal-scroll">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                className="min-h-[44px] max-h-32 resize-none pr-12 bg-background custom-scrollbar elegant-transition"
                disabled={isTyping}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInputValue("")}
                  disabled={!inputValue.trim()}
                  className="h-8 w-8 p-0 ripple-button elegant-transition"
                >
                  <StopCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              size="icon"
              className="h-11 w-11 rounded-full ripple-button elegant-transition elegant-hover"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-end items-center mt-2 text-xs text-muted-foreground">
            <span>{inputValue.length}/2000</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
