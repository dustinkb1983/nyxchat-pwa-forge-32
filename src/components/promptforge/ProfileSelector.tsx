
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Profile = {
  value: string;
  label: string;
};

const PROFILES: Profile[] = [
  { value: 'default', label: 'Default' },
  { value: 'writer', label: 'Writer' },
  { value: 'developer', label: 'Developer' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'business', label: 'Business' },
];

interface ProfileSelectorProps {
  value: string;
  onChange: (profile: string) => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">Profile:</span>
      <select
        className="rounded-md border bg-card px-3 py-1 pr-8 font-medium appearance-none shadow text-foreground"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ minWidth: 120 }}
      >
        {PROFILES.map((profile) => (
          <option key={profile.value} value={profile.value}>
            {profile.label}
          </option>
        ))}
      </select>
      <ChevronDown className="-ml-7 h-4 w-4 pointer-events-none text-muted-foreground" />
    </div>
  );
};
