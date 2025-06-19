
import React, { useRef, useEffect } from 'react';
import { Send, Trash2, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatFooterProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isTyping: boolean;
  isKeyboardOpen?: boolean;
}

export const ChatFooter: React.FC<ChatFooterProps> = ({
  inputValue,
  setInputValue,
  onSend,
  onKeyDown,
  isTyping,
  isKeyboardOpen = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleClearInput = () => {
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  const handleAttachFile = () => {
    // Placeholder for file attachment functionality
    console.log('File attachment clicked');
  };

  return (
    <div 
      className="sticky bottom-0 z-30 border-t bg-card/95 backdrop-blur-md shrink-0 transition-all duration-300 ease-out"
      style={{
        height: '64px',
        padding: '0.75rem 1rem',
        transform: isKeyboardOpen ? 'translateY(0)' : 'translateY(0)',
      }}
    >
      <div className="max-w-4xl mx-auto h-full">
        <div className="flex items-center gap-3 h-full">
          {/* Input area with icons */}
          <div className="flex-1 relative bg-background rounded-lg border border-input flex items-center" style={{ padding: '0.5rem 1rem' }}>
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type your message..."
              className="flex-1 min-h-[36px] max-h-[120px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={isTyping}
              style={{ fontSize: '1rem' }}
            />
            
            {/* Icons container */}
            <div className="flex items-center gap-2 ml-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearInput}
                disabled={!inputValue.trim()}
                className="h-9 w-9 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAttachFile}
                className="h-9 w-9 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Send button */}
          <Button
            onClick={onSend}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            className="h-11 w-11 rounded-full transition-all duration-200 hover:scale-105 disabled:hover:scale-100 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
