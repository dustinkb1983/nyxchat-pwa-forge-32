
import React, { useRef, useEffect } from 'react';
import { Send, Paperclip, Trash2 } from 'lucide-react';
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
      textareaRef.current.style.height = '40px';
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, 40), 80);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [inputValue]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
    }
  }, []);

  const handleAttachFile = () => {
    console.log('File attachment clicked');
  };

  const handleClearInput = () => {
    setInputValue('');
  };

  return (
    <div className="fixed left-0 right-0 bottom-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/20 glass-effect">
      <div className="flex items-end justify-center px-4 py-4">
        <div className="w-full max-w-4xl flex items-end gap-3">
          <div className="flex-1 relative">
            <div className="flex items-end bg-card/60 rounded-2xl border-2 border-border/30 hover:border-primary/40 focus-within:border-primary/60 transition-elegant shadow-elegant backdrop-blur-md px-4 py-3">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type your message..."
                className="flex-1 min-h-[40px] max-h-[80px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm leading-5 placeholder:text-muted-foreground/70"
                disabled={isTyping}
                rows={1}
                style={{ height: '40px' }}
              />
              
              <div className="flex items-center gap-2 ml-3 pb-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAttachFile}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl transition-elegant-fast ripple-modern"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearInput}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl transition-elegant-fast ripple-modern"
                  disabled={!inputValue.trim()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <Button
            onClick={onSend}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            className="h-12 w-12 rounded-2xl shadow-elegant-lg hover:shadow-elegant-xl disabled:shadow-elegant transition-elegant hover:scale-105 disabled:hover:scale-100 bg-primary hover:bg-primary/90 ripple-modern"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
