
import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  MessageCircle,
  Code,
  BookOpen,
  Lightbulb,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface WelcomeScreenProps {
  onQuickPrompt: (prompt: string) => void;
}

const quickPrompts = [
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Creative Writing",
    prompt: "Write a short story about artificial intelligence discovering emotions"
  },
  {
    icon: <Code className="h-5 w-5" />,
    title: "Code Help",
    prompt: "Explain how to implement a REST API in Node.js with TypeScript"
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    title: "Learning",
    prompt: "Teach me about quantum computing in simple terms"
  },
  {
    icon: <Lightbulb className="h-5 w-5" />,
    title: "Ideas",
    prompt: "Give me 5 innovative startup ideas for 2024"
  },
  {
    icon: <MessageCircle className="h-5 w-5" />,
    title: "Conversation",
    prompt: "Let's have a philosophical discussion about consciousness"
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Quick Task",
    prompt: "Help me write a professional email to schedule a meeting"
  }
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onQuickPrompt }) => {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-8"
      >
        <div className="mb-6">
          <img 
            src={theme === 'dark' 
              ? "/lovable-uploads/c4ccfc25-8070-4b46-b114-db5d4bdfd2f7.png" 
              : "/lovable-uploads/42e8fcdc-df50-495f-a1c0-e9cd71e2f394.png"
            } 
            alt="NyxChat Logo" 
            className="w-20 h-20 mx-auto mb-4"
          />
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Welcome to NyxChat
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
          Your intelligent AI companion for conversations, creativity, and problem-solving.
          Choose a quick start below or begin typing your own message.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full"
      >
        {quickPrompts.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
          >
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-3 hover:shadow-lg transition-all duration-300 w-full"
              onClick={() => onQuickPrompt(item.prompt)}
            >
              <div className="text-primary">
                {item.icon}
              </div>
              <div>
                <div className="font-semibold text-sm mb-1">{item.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {item.prompt}
                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mt-8 text-sm text-muted-foreground"
      >
        <p>
          💡 Pro tip: Use <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> to send, 
          <kbd className="px-2 py-1 bg-muted rounded text-xs ml-1">Shift+Enter</kbd> for new line
        </p>
      </motion.div>
    </div>
  );
};
