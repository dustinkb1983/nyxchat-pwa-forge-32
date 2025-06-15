
import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot, AlertCircle } from 'lucide-react';
import { Message } from '@/lib/indexedDB';
import { Card } from '@/components/ui/card';

interface ChatMessageProps {
  message: Message;
  index: number;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, index }) => {
  const isUser = message.role === 'user';
  const isError = message.error;

  return (
    <motion.div
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
    >
      {!isUser && (
        <motion.div
          className="flex-shrink-0"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isError ? 'bg-destructive/10' : 'bg-primary/10'
          }`}>
            {isError ? (
              <AlertCircle className="w-4 h-4 text-destructive" />
            ) : (
              <Bot className="w-4 h-4 text-primary" />
            )}
          </div>
        </motion.div>
      )}

      <motion.div
        className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}
        initial={{ opacity: 0, x: isUser ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 + 0.1 }}
      >
        <Card className={`p-4 ${
          isUser 
            ? 'bg-primary text-primary-foreground ml-auto' 
            : isError 
              ? 'bg-destructive/5 border-destructive/20' 
              : 'bg-muted/50'
        }`}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </div>
          <div className={`text-xs mt-2 opacity-70 ${
            isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </Card>
      </motion.div>

      {isUser && (
        <motion.div
          className="flex-shrink-0"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
