
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Lightbulb,
  Brain,
  Code,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { ChatFooter } from './ChatFooter';

interface WelcomeScreenProps {
  onQuickPrompt: (prompt: string) => void;
}

const quickPrompts = [
  {
    icon: <Mail className="h-6 w-6" />,
    label: "Write Email",
    prompt: "Help me write a professional email to schedule a meeting"
  },
  {
    icon: <Lightbulb className="h-6 w-6" />,
    label: "Explain",
    prompt: "Explain a complex topic in simple, easy-to-understand terms"
  },
  {
    icon: <Brain className="h-6 w-6" />,
    label: "Brainstorm",
    prompt: "Help me brainstorm creative ideas for my project"
  },
  {
    icon: <Code className="h-6 w-6" />,
    label: "Code Review",
    prompt: "Review my code and suggest improvements for better performance and readability"
  }
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onQuickPrompt }) => {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (inputValue.trim()) {
      onQuickPrompt(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="flex flex-col px-4 text-center no-horizontal-scroll" style={{ paddingBottom: '80px' }}>
        {/* Logo container with specified positioning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center"
          style={{ 
            marginTop: '10vh',
            height: '25vh'
          }}
        >
          <div className="w-32 h-32 flex items-center justify-center">
            <img 
              src={theme === 'dark' ? '/lovable-uploads/ef071ded-72e2-42cb-a46b-47bf922f911f.png' : '/lovable-uploads/de22cf8d-553d-4c51-a283-91a089a844be.png'} 
              alt="NyxChat Logo" 
              className="w-24 h-24"
            />
          </div>
        </motion.div>

        {/* Quick action buttons - positioned to maintain same distance from logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 gap-4 max-w-sm w-full mx-auto"
        >
          {quickPrompts.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="w-full"
            >
              <Button
                variant="outline"
                className="h-20 w-full flex flex-col items-center justify-center gap-2 bg-card/50 border-border/50 hover:bg-card/80 transition-all duration-200"
                onClick={() => onQuickPrompt(item.prompt)}
                title={item.prompt}
              >
                <div className="text-foreground">
                  {item.icon}
                </div>
                <div className="text-sm font-medium text-foreground">
                  {item.label}
                </div>
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Use the same ChatFooter component for consistency */}
      <ChatFooter
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSend={handleSend}
        onKeyDown={handleKeyDown}
        isTyping={false}
      />
    </>
  );
};
