
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { availableModels } from '@/constants/models';
import { useSidebar } from '@/components/ui/sidebar';

interface CustomModel {
  id: string;
  name: string;
  modelId: string;
}

interface ModelSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  value, 
  onChange, 
  className = "" 
}) => {
  const [availableModelOptions, setAvailableModelOptions] = useState<Array<{id: string, name: string}>>([]);
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const loadAvailableModels = () => {
    const appSettings = localStorage.getItem('app-settings');
    const deletedDefaultModels = JSON.parse(localStorage.getItem('deleted-default-models') || '[]');
    
    // Get non-deleted default models
    const validDefaultModels = availableModels.filter(m => !deletedDefaultModels.includes(m.id));
    
    // Get custom models
    let customModels: CustomModel[] = [];
    if (appSettings) {
      const settings = JSON.parse(appSettings);
      if (settings.customModels && Array.isArray(settings.customModels)) {
        customModels = settings.customModels;
      }
    }
    
    // Combine all available models
    const allModels = [
      ...validDefaultModels.map(m => ({ id: m.id, name: m.name })),
      ...customModels.map(m => ({ id: m.modelId, name: m.name }))
    ];
    
    setAvailableModelOptions(allModels);
  };

  useEffect(() => {
    loadAvailableModels();
    
    // Listen for storage changes to update models dynamically
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app-settings' || e.key === 'deleted-default-models') {
        loadAvailableModels();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getDisplayName = (modelId?: string) => {
    if (!modelId) return 'Select Model';
    const model = availableModelOptions.find(m => m.id === modelId);
    return model ? model.name : modelId;
  };

  if (isCollapsed) {
    return null; // Hide in collapsed state
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`w-full bg-background border-input ${className}`}>
        <SelectValue placeholder="Select Model">
          {getDisplayName(value)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="z-50 bg-popover border border-border">
        {availableModelOptions.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
