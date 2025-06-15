import React from "react";
import { ArrowLeft, ArrowRight, Download, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";

const ChatInterface = () => {
  const [messages, setMessages] = React.useState([]);
  const [showWelcome, setShowWelcome] = React.useState(true); // Placeholder
  const { theme, toggleTheme } = useTheme();

  // Placeholder chat header actions
  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b bg-background/90 rounded-t-xl shadow-sm z-10"
        style={{
          background: 'var(--background)',
        }}>
        <div className="flex items-center gap-2">
          {/* Could add conversation title or icon */}
          <span className="font-bold text-lg">NyxChat</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" aria-label="Download/Export" className="rounded-md">
            <Download className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={toggleTheme} aria-label="Toggle Theme" className="rounded-md">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto px-2 md:px-6 py-5 rounded-b-xl bg-background transition-colors">
        {showWelcome ? (
          <WelcomeScreen
            onQuickPrompt={(prompt) => {
              setShowWelcome(false);
              // TODO: send prompt, add to messages
            }}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {/* Map over chat messages */}
          </div>
        )}
      </div>
      {/* Chat Footer would go here */}
    </div>
  );
};

export default ChatInterface;
