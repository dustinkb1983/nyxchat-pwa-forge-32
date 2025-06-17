
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { availableModels } from '@/constants/models';
import { useSidebar } from '@/components/ui/sidebar';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteModel, setPendingDeleteModel] = useState<{id: string, name: string, isCustom: boolean} | null>(null);
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
    
    // Listen for custom events for same-window updates
    const handleCustomStorageUpdate = () => {
      loadAvailableModels();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('modelSettingsUpdated', handleCustomStorageUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('modelSettingsUpdated', handleCustomStorageUpdate);
    };
  }, []);

  const getDisplayName = (modelId?: string) => {
    if (!modelId) return 'Select Model';
    const model = availableModelOptions.find(m => m.id === modelId);
    return model ? model.name : modelId;
  };

  const handleDeleteRequest = (e: React.MouseEvent, modelId: string, modelName: string, isCustom: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    
    setPendingDeleteModel({ id: modelId, name: modelName, isCustom });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDeleteModel) return;
    
    const { id, isCustom } = pendingDeleteModel;
    
    if (isCustom) {
      // Delete custom model
      const appSettings = localStorage.getItem('app-settings');
      if (appSettings) {
        const settings = JSON.parse(appSettings);
        if (settings.customModels) {
          settings.customModels = settings.customModels.filter((m: CustomModel) => m.modelId !== id);
          localStorage.setItem('app-settings', JSON.stringify(settings));
        }
      }
      toast.success('Custom model deleted successfully');
    } else {
      // Delete default model by adding to deleted list
      const deletedModels = JSON.parse(localStorage.getItem('deleted-default-models') || '[]');
      const updatedDeleted = [...deletedModels, id];
      localStorage.setItem('deleted-default-models', JSON.stringify(updatedDeleted));
      toast.success('Default model removed from selection');
    }

    // If the deleted model is currently selected, switch to first available
    if (value === id) {
      loadAvailableModels();
      const remainingModels = availableModelOptions.filter(m => m.id !== id);
      if (remainingModels.length > 0) {
        onChange(remainingModels[0].id);
      }
    }

    if (onModelDelete) {
      onModelDelete(id, isCustom);
    }

    // Trigger custom event for same-window updates
    window.dispatchEvent(new CustomEvent('modelSettingsUpdated'));
    
    setDeleteDialogOpen(false);
    setPendingDeleteModel(null);
  };

  if (isCollapsed && !showDeleteIcons) {
    return null; // Hide in collapsed state when used in sidebar
  }

  return (
    <>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`w-full bg-background border-input text-sm ${className}`}>
          <SelectValue placeholder="Select Model">
            <span className="truncate">{getDisplayName(value)}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="z-50 bg-popover border border-border text-sm">
          {availableModelOptions.map((model) => (
            <SelectItem key={model.id} value={model.id} className="text-sm">
              <div className="flex items-center justify-between w-full group">
                <span className="truncate pr-2">{model.name}</span>
                {showDeleteIcons && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity ripple-button ml-2 flex-shrink-0"
                    onClick={(e) => handleDeleteRequest(e, model.id, model.name, model.isCustom || false)}
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

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Model"
        description={`Are you sure you want to delete "${pendingDeleteModel?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
};
