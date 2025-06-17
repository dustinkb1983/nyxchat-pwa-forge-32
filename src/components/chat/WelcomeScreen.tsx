
import React from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Lightbulb,
  Brain,
  Code,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

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

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center no-horizontal-scroll">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-12"
      >
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full border-2 border-white/20 flex items-center justify-center bg-background/10">
            <div className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center">
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full bg-white/80"></div>
                <div className="w-3 h-3 rounded-full bg-white/60"></div>
              </div>
              <div className="absolute">
                <div className="w-1 h-1 bg-white/90 rounded-full animate-pulse" style={{ transform: 'translate(8px, -4px)' }}></div>
                <div className="w-0.5 h-0.5 bg-white/70 rounded-full animate-pulse" style={{ transform: 'translate(12px, -8px)', animationDelay: '0.5s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-2 gap-4 max-w-sm w-full"
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
  );
};
