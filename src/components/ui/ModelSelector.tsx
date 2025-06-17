
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { availableModels } from '@/constants/models';
import { useSidebar } from '@/components/ui/sidebar';
import { toast } from 'sonner';

interface CustomModel {
  id: string;
  name: string;
  modelId: string;
}

interface ModelSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  showDeleteIcons?: boolean;
  onModelDelete?: (modelId: string, isCustom: boolean) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  value, 
  onChange, 
  className = "",
  showDeleteIcons = false,
  onModelDelete
}) => {
  const [availableModelOptions, setAvailableModelOptions] = useState<Array<{id: string, name: string, isCustom?: boolean}>>([]);
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
      ...validDefaultModels.map(m => ({ id: m.id, name: m.name, isCustom: false })),
      ...customModels.map(m => ({ id: m.modelId, name: m.name, isCustom: true }))
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

  const handleDeleteModel = (e: React.MouseEvent, modelId: string, isCustom: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onModelDelete) {
      onModelDelete(modelId, isCustom);
    }
  };

  if (isCollapsed && !showDeleteIcons) {
    return null; // Hide in collapsed state when used in sidebar
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
            <div className="flex items-center justify-between w-full group">
              <span>{model.name}</span>
              {showDeleteIcons && model.isCustom && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity ripple-button"
                  onClick={(e) => handleDeleteModel(e, model.id, model.isCustom || false)}
                  title="Delete model"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
