
import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbManager, Conversation, Message } from '@/lib/indexedDB';
import { useMemory } from './MemoryContext';

interface ChatContextType {
  currentConversation: Conversation | null;
  conversations: Conversation[];
  isLoading: boolean;
  isTyping: boolean;
  sendMessage: (content: string, model?: string) => Promise<void>;
  newConversation: () => void;
  loadConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  refreshConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { getRelevantMemories } = useMemory();

  const loadConversations = async () => {
    try {
      const loadedConversations = await dbManager.getConversations();
      setConversations(loadedConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const buildSystemPrompt = () => {
    const memories = getRelevantMemories(5);
    const memoryContext = memories.length > 0 
      ? `\n\nContext about the user:\n${memories.map(m => `- ${m.content}`).join('\n')}`
      : '';
    
    return `You are Vivica, an intelligent and helpful AI assistant. You have a warm, conversational tone and provide thoughtful, detailed responses.${memoryContext}`;
  };

  const sendMessage = async (content: string, model = 'openai/gpt-4o') => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    // Create new conversation if none exists
    let conversation = currentConversation;
    if (!conversation) {
      conversation = {
        id: crypto.randomUUID(),
        title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setCurrentConversation(conversation);
    }

    // Add user message
    const updatedMessages = [...conversation.messages, userMessage];
    const updatedConversation = {
      ...conversation,
      messages: updatedMessages,
      updatedAt: new Date(),
    };

    setCurrentConversation(updatedConversation);
    setIsTyping(true);

    try {
      // Prepare messages for API
      const systemPrompt = buildSystemPrompt();
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...updatedMessages.filter(m => m.role !== 'system').map(m => ({
          role: m.role,
          content: m.content,
        }))
      ];

      // Call OpenRouter API
      const apiKey = localStorage.getItem('openrouter-api-key');
      if (!apiKey) {
        throw new Error('OpenRouter API key not found. Please set it in Settings.');
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Vivica AI Assistant',
        },
        body: JSON.stringify({
          model,
          messages: apiMessages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const assistantContent = data.choices?.[0]?.message?.content;

      if (!assistantContent) {
        throw new Error('No response content received from API');
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      const finalConversation = {
        ...updatedConversation,
        messages: finalMessages,
      };

      setCurrentConversation(finalConversation);
      await dbManager.saveConversation(finalConversation);
      await loadConversations();

    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        error: true,
      };

      const errorConversation = {
        ...updatedConversation,
        messages: [...updatedMessages, errorMessage],
      };

      setCurrentConversation(errorConversation);
      await dbManager.saveConversation(errorConversation);
    } finally {
      setIsTyping(false);
    }
  };

  const newConversation = () => {
    setCurrentConversation(null);
  };

  const loadConversation = (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await dbManager.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const refreshConversations = async () => {
    await loadConversations();
  };

  return (
    <ChatContext.Provider value={{
      currentConversation,
      conversations,
      isLoading,
      isTyping,
      sendMessage,
      newConversation,
      loadConversation,
      deleteConversation,
      refreshConversations,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
