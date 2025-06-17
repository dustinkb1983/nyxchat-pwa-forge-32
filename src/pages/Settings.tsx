
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from "@/components/ui/slider";
import { Moon, Sun, LightbulbOff } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { BackToChatButton } from "@/components/ui/BackToChatButton";
import { ModelSelector } from '@/components/ui/ModelSelector';
import { availableModels } from '@/constants/models';
import { useIsMobile } from '@/hooks/use-mobile';

interface CustomModel {
  id: string;
  name: string;
  modelId: string;
}

interface AppSettings {
  theme: 'light' | 'dark';
  selectedModel: string;
  customModels: CustomModel[];
  systemPrompt: string;
  maxContextLength: number;
  apiKey: string;
  temperature: number;
}

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    selectedModel: 'openai/gpt-4o',
    customModels: [],
    systemPrompt: '',
    maxContextLength: 20,
    apiKey: '',
    temperature: 0.7
  });

  const [customModelForm, setCustomModelForm] = useState({
    name: '',
    modelId: ''
  });

  const [deletedDefaultModels, setDeletedDefaultModels] = useState<string[]>([]);

  useEffect(() => {
    loadSettings();
    loadDeletedDefaultModels();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(prev => ({
        ...prev,
        ...parsed,
        temperature: parsed?.temperature ?? 0.7,
      }));
    } else {
      setSettings(prev => ({ ...prev, temperature: 0.7 }));
    }

    // Load API key separately for security
    const apiKey = localStorage.getItem('openrouter-api-key') || '';
    setSettings(prev => ({ ...prev, apiKey }));
  };

  const loadDeletedDefaultModels = () => {
    const deleted = localStorage.getItem('deleted-default-models');
    if (deleted) {
      setDeletedDefaultModels(JSON.parse(deleted));
    }
  };

  const saveSettings = (updatedSettings: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updatedSettings };
    setSettings(newSettings);

    // Save most settings except for apiKey
    const { apiKey, ...settingsToSave } = newSettings;
    localStorage.setItem('app-settings', JSON.stringify(settingsToSave));

    // Save API key separately
    if (apiKey) {
      localStorage.setItem('openrouter-api-key', apiKey);
    }

    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully."
    });
  };

  const saveDeletedDefaultModels = (deletedIds: string[]) => {
    localStorage.setItem('deleted-default-models', JSON.stringify(deletedIds));
    setDeletedDefaultModels(deletedIds);
  };

  const addCustomModel = () => {
    if (!customModelForm.name.trim() || !customModelForm.modelId.trim()) {
      toast({
        title: "Validation Error",
        description: "Both name and model ID are required for custom models.",
        variant: "destructive"
      });
      return;
    }

    const newModel: CustomModel = {
      id: crypto.randomUUID(),
      name: customModelForm.name.trim(),
      modelId: customModelForm.modelId.trim(),
    };

    const updatedCustomModels = [...settings.customModels, newModel];
    saveSettings({ customModels: updatedCustomModels });

    setCustomModelForm({ name: '', modelId: '' });

    toast({
      title: "Custom Model Added",
      description: `Model "${newModel.name}" has been added successfully.`
    });
  };

  const handleModelDelete = (modelId: string, isCustom: boolean) => {
    if (isCustom) {
      // Delete custom model
      const updatedCustomModels = settings.customModels.filter(m => m.modelId !== modelId);
      saveSettings({ customModels: updatedCustomModels });
      
      toast({
        title: "Custom Model Deleted",
        description: "Custom model has been removed successfully."
      });
    } else {
      // Delete default model
      const newDeleted = [...deletedDefaultModels, modelId];
      saveDeletedDefaultModels(newDeleted);

      // If the deleted model is selected, auto-switch to first available
      if (settings.selectedModel === modelId) {
        const allDefaults = availableModels.filter(d => !newDeleted.includes(d.id));
        const newSelected =
          allDefaults.length > 0
            ? allDefaults[0].id
            : settings.customModels[0]?.modelId || 'openai/gpt-4o';
        setSettings(prev => ({ ...prev, selectedModel: newSelected }));
        saveSettings({ selectedModel: newSelected });
      }

      toast({
        title: "Default Model Deleted",
        description: "Default model has been removed from the selection list."
      });
    }
  };

  const handleSaveSettings = () => {
    saveSettings(settings);
  };

  return (
    <div className={`h-full flex flex-col no-horizontal-scroll ${isMobile ? 'settings-mobile' : 'p-6'}`}>
      <BackToChatButton />
      <Card className={`modal-unified flex-1 ${isMobile ? 'mobile-card' : ''}`}>
        <CardHeader className={`modal-header ${isMobile ? 'card-header' : ''}`}>
          <CardTitle className="modal-title flex items-center gap-2">
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className={`modal-body ${isMobile ? 'mobile-tight-spacing card-content' : 'space-y-6'}`}>
          {/* Instructional/Tips Area */}
          <div className="rounded-md bg-muted/30 px-4 py-3 text-muted-foreground text-sm flex items-center gap-2 select-none">
            <LightbulbOff className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            <span className={isMobile ? 'text-xs' : ''}>
              Tip: Use <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> to send, <kbd className="px-2 py-1 bg-muted rounded text-xs">Shift+Enter</kbd> for new line.
            </span>
          </div>
          
          {/* Theme Settings */}
          <div className="space-y-3">
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium`}>Theme Settings</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span className={isMobile ? 'text-sm' : ''}>AMOLED Theme</span>
              </div>
              <Switch 
                checked={theme === 'dark'} 
                onCheckedChange={toggleTheme}
                className="ripple-button"
              />
            </div>
          </div>

          {/* AI Model Selection */}
          <div className="space-y-3">
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium`}>AI Model Selection</h3>
            <ModelSelector
              value={settings.selectedModel}
              onChange={(value) => setSettings(prev => ({ ...prev, selectedModel: value }))}
              className={isMobile ? 'mobile-select' : ''}
              showDeleteIcons={true}
              onModelDelete={handleModelDelete}
            />
          </div>

          {/* Custom Model Management */}
          <div className="space-y-3">
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium`}>Add Custom Model</h3>
            <div className={`${isMobile ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 gap-3'}`}>
              <Input
                placeholder="Model Name (e.g. Meta)"
                value={customModelForm.name}
                onChange={(e) => setCustomModelForm(prev => ({ ...prev, name: e.target.value }))}
                className={isMobile ? 'mobile-input' : ''}
              />
              <Input
                placeholder="Model ID (e.g. meta-llama/llama-3.3-70b-instruct:free)"
                value={customModelForm.modelId}
                onChange={(e) => setCustomModelForm(prev => ({ ...prev, modelId: e.target.value }))}
                className={isMobile ? 'mobile-input' : ''}
              />
            </div>
            <Button 
              onClick={addCustomModel}
              disabled={!customModelForm.name.trim() || !customModelForm.modelId.trim()}
              className={`${isMobile ? 'mobile-button' : ''} ripple-button elegant-transition`}
            >
              Add Model
            </Button>
          </div>

          {/* System Prompt Configuration */}
          <div className="space-y-3">
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium`}>System Prompt Configuration</h3>
            <Textarea
              placeholder="Enter system prompt to customize AI behavior..."
              value={settings.systemPrompt}
              onChange={(e) => setSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
              className={`${isMobile ? 'min-h-[80px] mobile-input' : 'min-h-[100px]'} resize-none custom-scrollbar`}
            />
          </div>

          {/* Temperature Control */}
          <div className="space-y-3">
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium`}>Model Creativity (Temperature)</h3>
            <label className={`${isMobile ? 'text-sm' : ''} font-medium`}>Temperature: {settings.temperature.toFixed(2)}</label>
            <Slider
              value={[settings.temperature]}
              onValueChange={(value) =>
                setSettings((prev) => ({
                  ...prev,
                  temperature: value[0],
                }))
              }
              max={1}
              min={0}
              step={0.01}
              className="mt-2"
            />
            <div className={`flex justify-between ${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground mt-1`}>
              <span>More Predictable</span>
              <span>More Creative</span>
            </div>
          </div>

          {/* Context Settings */}
          <div className="space-y-3">
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium`}>Context Settings</h3>
            <div>
              <label className={`${isMobile ? 'text-sm' : ''} font-medium`}>Max Context Length</label>
              <Input
                type="number"
                min="1"
                max="50"
                value={settings.maxContextLength}
                onChange={(e) => setSettings(prev => ({ ...prev, maxContextLength: parseInt(e.target.value) || 20 }))}
                className={isMobile ? 'mobile-input' : ''}
              />
            </div>
          </div>

          {/* API Configuration */}
          <div className="space-y-3">
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium`}>API Configuration</h3>
            <Input
              type="password"
              placeholder="Enter your API key..."
              value={settings.apiKey}
              onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
              className={isMobile ? 'mobile-input' : ''}
            />
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSaveSettings}
              className={`${isMobile ? 'mobile-button' : ''} ripple-button elegant-transition`}
            >
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
