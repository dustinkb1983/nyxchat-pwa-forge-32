
import { useCallback } from 'react';
import { useMemory } from '@/contexts/MemoryContext';
import { MemoryEntry } from '@/lib/indexedDB';

export const useMemoryAutoSave = () => {
  const { addMemory } = useMemory();

  const extractMemoryFromMessage = useCallback(async (
    userMessage: string,
    assistantMessage: string,
    profileId?: string
  ) => {
    // Simple heuristic to extract potential memories
    const memories: Omit<MemoryEntry, 'id' | 'createdAt' | 'lastAccessed'>[] = [];

    // Extract user preferences (I like, I prefer, I want, I need)
    const preferencePatterns = [
      /I (?:like|love|prefer|enjoy|want|need) ([^.!?]+)/gi,
      /My (?:favorite|preference) (?:is|are) ([^.!?]+)/gi,
    ];

    preferencePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(userMessage)) !== null) {
        memories.push({
          type: 'preference',
          content: `User ${match[0].toLowerCase()}`,
          importance: 6,
          tags: [
            'auto-extracted',
            'preference',
            ...(profileId ? [`profile:${profileId}`] : [])
          ]
        });
      }
    });

    // Extract facts about user (My name is, I am, I work as)
    const factPatterns = [
      /(?:My name is|I'm called|Call me) ([^.!?,]+)/gi,
      /I (?:am|work as|am a) ([^.!?,]+)/gi,
      /I (?:live in|am from) ([^.!?,]+)/gi,
    ];

    factPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(userMessage)) !== null) {
        memories.push({
          type: 'fact',
          content: match[0],
          importance: 8,
          tags: [
            'auto-extracted',
            'personal-info',
            ...(profileId ? [`profile:${profileId}`] : [])
          ]
        });
      }
    });

    // Extract goals and objectives
    const goalPatterns = [
      /I (?:want to|plan to|hope to|aim to) ([^.!?]+)/gi,
      /My goal is to ([^.!?]+)/gi,
    ];

    goalPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(userMessage)) !== null) {
        memories.push({
          type: 'goal',
          content: `User wants to ${match[1]}`,
          importance: 7,
          tags: [
            'auto-extracted',
            'goal',
            ...(profileId ? [`profile:${profileId}`] : [])
          ]
        });
      }
    });

    // Save extracted memories
    for (const memory of memories) {
      await addMemory(memory);
    }

    return memories.length;
  }, [addMemory]);

  return { extractMemoryFromMessage };
};
