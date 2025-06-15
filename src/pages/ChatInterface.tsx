import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, StopCircle, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ProfileSelector } from "@/components/promptforge/ProfileSelector";
import { useChat } from "@/contexts/ChatContext";
import { AnimatePresence } from "framer-motion";

const QUICK_PROMPT_KEY = "nyxchat-quick-prompts-v1";
const DEFAULT_QUICK_PROMPTS = [
  "Explain Quantum Physics in simple terms",
  "Write a haiku about the moon",
  "Fix a bug in my code",
  "How do I stay motivated?"
];

const ChatInterface = () => {
  const {
    currentConversation,
    isTyping,
    currentProfile,
    setCurrentProfile,
    sendMessage,
  } = useChat();

  const [inputValue, setInputValue] = useState("");
  const [quickPrompts, setQuickPrompts] = useState<string[]>(DEFAULT_QUICK_PROMPTS);
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

  useEffect(() => {
    const stored = localStorage.getItem(QUICK_PROMPT_KEY);
    if (stored) setQuickPrompts(JSON.parse(stored));
  }, []);

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

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
    sendMessage(prompt);
  };
  
  const handleProfileChange = (profileId: string) => {
    setCurrentProfile(profileId);
    toast.success(`Profile switched!`);
  };

  const handleDownload = () => {
    if (!currentConversation) return;

    const content = currentConversation.messages
      .map(
        (msg) =>
          `[${new Date(msg.timestamp).toLocaleString()}] ${msg.role}:\n${
            msg.content
          }`
      )
      .join('\n\n' + '-'.repeat(20) + '\n\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversation-${currentConversation.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">N</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold">NYX</h1>
            <div className="relative flex h-2.5 w-2.5" title={isTyping ? "AI Typing" : "Ready"}>
              <div
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                  isTyping ? 'bg-red-400' : 'bg-green-400'
                }`}
              ></div>
              <div
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isTyping ? 'bg-red-500' : 'bg-green-500'
                }`}
              ></div>
            </div>
            {/* ADD: Active profile display */}
            <span className="ml-3 px-2 py-1 rounded bg-muted/30 text-xs text-muted-foreground" title="Active Profile">
              Profile: 
              <span className="font-semibold text-primary ml-1">
                {currentProfile}
              </span>
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ProfileSelector value={currentProfile} onChange={handleProfileChange} />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            disabled={!currentConversation || messages.length === 0}
            title="Download conversation"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {showWelcome ? (
          // WelcomeScreen with dynamic quickPrompts
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
      <div className="border-t bg-card/50 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                className="min-h-[44px] max-h-32 resize-none pr-12 bg-background"
                disabled={isTyping}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInputValue("")}
                  disabled={!inputValue.trim()}
                  className="h-8 w-8 p-0"
                >
                  <StopCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              size="icon"
              className="h-11 w-11 rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
            <span>Enter to send • Shift+Enter for new line</span>
            <span>{inputValue.length}/2000</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
