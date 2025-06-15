
import React from 'react';
import { Mail, Lightbulb, Brain, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onQuickPrompt: (prompt: string) => void;
}

// Uniform, modern quick actions as in HTML example
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
    <div className="h-full flex items-center justify-center p-8">
      <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
            <Brain className="w-16 h-16 text-primary" />
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-4">Welcome to NyxChat</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Start a conversation by typing a message below. I'm here to help with any questions or tasks you might have.
          </p>
        </div>

        {/* Four uniform quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-md">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-24 w-full flex flex-col items-center justify-center gap-3 rounded-lg shadow transition-all duration-200 border-2 bg-card hover:bg-accent/50"
              onClick={() => onQuickPrompt(action.prompt)}
            >
              <action.icon className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
