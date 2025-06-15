
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Profile {
  id: string;
  name: string;
  systemPrompt: string;
  model: string;
  temperature: number;
}

interface ProfileSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({ value, onChange }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = () => {
    const savedProfiles = localStorage.getItem('ai-profiles');
    if (savedProfiles) {
      const parsed = JSON.parse(savedProfiles);
      setProfiles(parsed);
    } else {
      // Create default profile if none exist
      const defaultProfile: Profile = {
        id: 'default',
        name: 'Default Assistant',
        systemPrompt: 'You are a helpful AI assistant. Be concise, accurate, and friendly.',
        model: 'openai/gpt-4o',
        temperature: 0.7
      };
      setProfiles([defaultProfile]);
      localStorage.setItem('ai-profiles', JSON.stringify([defaultProfile]));
    }
  };

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Select Profile" />
      </SelectTrigger>
      <SelectContent>
        {profiles.map((profile) => (
          <SelectItem key={profile.id} value={profile.id}>
            {profile.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
