
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScrollToBottomButtonProps {
  show: boolean;
  onClick: () => void;
}

export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
  show,
  onClick
}) => {
  if (!show) return null;

  return (
    <Button
      onClick={onClick}
      size="icon"
      className="fixed right-4 z-30 h-10 w-10 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
      style={{
        bottom: 'calc(56px + 1rem)', // Adjusted for new footer height
        opacity: show ? 1 : 0,
        visibility: show ? 'visible' : 'hidden',
      }}
    >
      <ChevronDown className="h-5 w-5" />
    </Button>
  );
};
