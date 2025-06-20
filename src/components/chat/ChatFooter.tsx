
import React, { useRef, useEffect } from 'react';
import { Send, Paperclip, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatFooterProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isTyping: boolean;
}

export const ChatFooter: React.FC<ChatFooterProps> = ({
  inputValue,
  setInputValue,
  onSend,
  onKeyDown,
  isTyping
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Reset height first, then set to scroll height
      textareaRef.current.style.height = '40px';
      const scrollHeight = textareaRef.current.scrollHeight;
      if (scrollHeight > 40) {
        textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
      }
    }
  }, [inputValue]);

  const handleAttachFile = () => {
    console.log('File attachment clicked');
  };

  const handleVoiceInput = () => {
    console.log('Voice input clicked');
  };

  return (
    <div className="fixed left-0 right-0 bottom-0 z-[100] bg-card/95 backdrop-blur-md border-t shadow-lg h-[100px]">
      <div className="max-w-4xl mx-auto p-4 h-full flex items-center">
        <div className="flex items-end gap-3 w-full">
          <div className="flex-1 relative bg-background rounded-2xl border-2 border-input/50 shadow-sm hover:border-primary/30 transition-all duration-200 focus-within:border-primary/60 focus-within:shadow-md">
            <div className="flex items-end p-3 gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAttachFile}
                className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all duration-200"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type your message..."
                className="flex-1 min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base leading-6"
                disabled={isTyping}
                rows={1}
              />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleVoiceInput}
                className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all duration-200"
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Button
            onClick={onSend}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            className="h-12 w-12 rounded-2xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100 shrink-0 shadow-lg hover:shadow-xl disabled:shadow-sm"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
