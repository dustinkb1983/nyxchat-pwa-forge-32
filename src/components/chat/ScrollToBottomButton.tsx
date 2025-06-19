
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScrollToBottomButtonProps {
  show: boolean;
  onClick: () => void;
  isKeyboardOpen?: boolean;
  keyboardHeight?: number;
}

export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
  show,
  onClick,
  isKeyboardOpen = false,
  keyboardHeight = 0
}) => {
  if (!show) return null;

  return (
    <Button
      onClick={onClick}
      size="icon"
      className="fixed right-4 z-20 h-10 w-10 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105 opacity-0 animate-in fade-in"
      style={{
        bottom: isKeyboardOpen ? `${80 + keyboardHeight * 0.1}px` : '80px',
        opacity: show ? 1 : 0,
      }}
    >
      <ChevronDown className="h-5 w-5" />
    </Button>
  );
};
