
import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Lightbulb, Brain, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onQuickPrompt: (prompt: string) => void;
}

const quickActions = [
  {
    icon: Mail,
    label: 'Write Email',
    prompt: 'Help me write a professional email'
  },
  {
    icon: Lightbulb,
    label: 'Explain',
    prompt: 'Explain a complex concept'
  },
  {
    icon: Brain,
    label: 'Brainstorm',
    prompt: 'Help me brainstorm ideas'
  },
  {
    icon: Code,
    label: 'Code Review',
    prompt: 'Review my code'
  }
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onQuickPrompt }) => {
  return (
    <motion.div
      className="h-full flex items-center justify-center p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo/Icon */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: "spring", bounce: 0.4 }}
        >
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
            <Brain className="w-16 h-16 text-primary" />
          </div>
        </motion.div>

        {/* Welcome Text */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold mb-4">Welcome to NyxChat</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Start a conversation by typing a message below. I'm here to help with any questions or tasks you might have.
          </p>
        </motion.div>

        {/* Quick Actions - Updated to be uniform like HTML example */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {quickActions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                className="h-24 w-full flex flex-col items-center justify-center gap-3 hover:bg-accent/50 transition-all duration-200 border-2"
                onClick={() => onQuickPrompt(action.prompt)}
              >
                <action.icon className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};
