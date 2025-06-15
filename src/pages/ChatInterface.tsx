
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Trash2, Download, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useChat } from '@/contexts/ChatContext';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { WelcomeScreen } from '@/components/chat/WelcomeScreen';
import { TypingIndicator } from '@/components/chat/TypingIndicator';

const ChatInterface = () => {
  const { currentConversation, sendMessage, isTyping } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [showChat, setShowChat] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasMessages = currentConversation?.messages?.length > 0;

  useEffect(() => {
    if (hasMessages && !showChat) {
      setShowChat(true);
    }
  }, [hasMessages, showChat]);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const message = inputValue.trim();
    setInputValue('');
    
    if (!showChat) {
      setShowChat(true);
    }
    
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearInput = () => {
    setInputValue('');
    inputRef.current?.focus();
  };

  const insertQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">NyxChat</h1>
          <div className="flex items-center gap-1">
            <Circle className="h-2 w-2 fill-green-500 text-green-500" />
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Chat Body */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {!showChat ? (
            <WelcomeScreen 
              key="welcome"
              onQuickPrompt={insertQuickPrompt}
            />
          ) : (
            <motion.div
              key="chat"
              className="h-full flex flex-col"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {currentConversation?.messages.map((message, index) => (
                    <ChatMessage 
                      key={message.id} 
                      message={message}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
                
                {/* Typing Indicator */}
                <AnimatePresence>
                  {isTyping && <TypingIndicator key="typing" />}
                </AnimatePresence>
                
                <div ref={messagesEndRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Input */}
      <motion.div 
        className="p-4 border-t bg-background/80 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <div className="flex-1">
            <div className="relative flex items-center">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="pr-20 py-3 text-base resize-none"
                disabled={isTyping}
              />
              
              <div className="absolute right-2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearInput}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Input Hint */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  className="flex items-center gap-2 mt-2 text-sm text-muted-foreground"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex gap-1">
                    <motion.div
                      className="w-1 h-1 bg-primary rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                    />
                    <motion.div
                      className="w-1 h-1 bg-primary rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-1 h-1 bg-primary rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                    />
                  </div>
                  <span>AI is typing...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <Button 
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="h-12 px-6 rounded-lg"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatInterface;
