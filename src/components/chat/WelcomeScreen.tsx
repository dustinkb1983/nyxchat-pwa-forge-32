
import React from 'react';
import { Mail, Lightbulb, Code, PenTool, Calculator, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

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
    prompt: 'Explain quantum physics in simple terms'
  },
  {
    icon: Code,
    label: 'Code Review',
    prompt: 'Review and improve this code'
  },
  {
    icon: PenTool,
    label: 'Creative Writing',
    prompt: 'Help me write a creative story'
  },
  {
    icon: Calculator,
    label: 'Problem Solving',
    prompt: 'Help me solve a complex problem step by step'
  },
  {
    icon: Globe,
    label: 'Research',
    prompt: 'Research the latest trends in artificial intelligence'
  }
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onQuickPrompt }) => {
  const { theme } = useTheme();

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
        {/* Centered Logo */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
            <img
              src={theme === 'dark' ? '/logo.png' : '/logo2.png'}
              alt="NyxChat Logo"
              className="w-24 h-24 object-contain select-none"
              style={{
                filter: theme === 'dark' ? "brightness(1.2)" : "none",
                opacity: 0.9
              }}
              draggable={false}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to NyxChat
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Your intelligent AI companion is ready to help. Start a conversation below or choose from these quick prompts to get started.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-20 w-full flex flex-col items-center justify-center gap-2 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md border-2 hover:border-primary/50"
              onClick={() => onQuickPrompt(action.prompt)}
            >
              <action.icon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          ))}
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          <p>💡 Tip: Use <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> to send, <kbd className="px-2 py-1 bg-muted rounded text-xs">Shift+Enter</kbd> for new line</p>
        </div>
      </div>
    </div>
  );
};
