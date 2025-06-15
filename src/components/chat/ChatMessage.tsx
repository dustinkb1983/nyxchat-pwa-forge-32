
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bot, AlertCircle, Copy, RefreshCw, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/contexts/ThemeContext';
import { useChat } from '@/contexts/ChatContext';
import { Message } from '@/lib/indexedDB';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ChatMessageProps {
  message: Message;
  index: number;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, index }) => {
  const { retryMessage, isTyping } = useChat();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isError = message.error;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast({ title: 'Copied to clipboard!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRetry = async () => {
    if (isTyping) return;
    await retryMessage();
  };

  const CodeBlock = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <div className="relative">
          <SyntaxHighlighter
            style={theme === 'dark' ? vscDarkPlus : oneLight}
            language={match[1]}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="bg-muted/50 rounded-sm px-1 py-0.5 font-mono text-sm" {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <motion.div
      className={`group/message flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
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
        className={`max-w-[80%] relative ${isUser ? 'order-first' : ''}`}
        initial={{ opacity: 0, x: isUser ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 + 0.1 }}
      >
        <Card className={`p-4 group/card relative ${
          isUser 
            ? 'bg-primary text-primary-foreground ml-auto' 
            : isError 
              ? 'bg-destructive/5 border-destructive/20' 
              : 'bg-muted/50'
        }`}>
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={CodeBlock}
              linkTarget="_blank"
            >
              {message.content}
            </ReactMarkdown>
          </div>
          <div className={`text-xs mt-2 opacity-70 ${
            isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
          
          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
            {isError && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRetry} disabled={isTyping} title="Retry">
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy} title="Copy">
              {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            </Button>
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
