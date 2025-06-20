
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
      textareaRef.current.style.height = '20px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 80)}px`;
    }
  }, [inputValue]);

  const handleAttachFile = () => {
    console.log('File attachment clicked');
  };

  const handleClearInput = () => {
    setInputValue('');
  };

  return (
    <div className="fixed left-0 right-0 bottom-0 z-50 bg-background/95 backdrop-blur-md border-t" style={{ height: '80px' }}>
      <div className="h-full flex items-center justify-center px-4">
        <div className="w-full max-w-4xl flex items-center gap-3">
          <div className="flex-1 relative">
            <div className="flex items-center bg-muted/50 rounded-full border-2 border-input/50 hover:border-primary/30 focus-within:border-primary/60 transition-all duration-200 px-4 py-2">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type your message..."
                className="flex-1 min-h-[20px] max-h-[80px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm leading-5 placeholder:text-muted-foreground"
                disabled={isTyping}
                rows={1}
              />
              
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAttachFile}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearInput}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
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
            className="h-10 w-10 rounded-full shrink-0 shadow-lg hover:shadow-xl disabled:shadow-sm transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
