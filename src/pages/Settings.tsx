import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from "@/components/ui/slider";
import { Trash2, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { BackToChatButton } from "@/components/ui/BackToChatButton";

interface CustomModel {
  id: string;
  name: string;
  modelId: string;
  provider: string;
}

interface AppSettings {
  theme: 'light' | 'dark';
  selectedModel: string;
  customModels: CustomModel[];
  systemPrompt: string;
  maxContextLength: number;
  apiKey: string;
  temperature: number; // New field
}

const defaultModels = [
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic' },
];

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    selectedModel: 'openai/gpt-4o',
    customModels: [],
    systemPrompt: '',
    maxContextLength: 20,
    apiKey: '',
    temperature: 0.7 // Default value
  });

  const [customModelForm, setCustomModelForm] = useState({
    name: '',
    modelId: '',
    provider: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(prev => ({
        ...prev,
        ...parsed,
        temperature: parsed?.temperature ?? 0.7, // fallback for old settings
      }));
    } else {
      setSettings(prev => ({ ...prev, temperature: 0.7 }));
    }

    // Load API key separately for security
    const apiKey = localStorage.getItem('openrouter-api-key') || '';
    setSettings(prev => ({ ...prev, apiKey }));
  };

  const saveSettings = (updatedSettings: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updatedSettings };
    setSettings(newSettings);

    // Save most settings
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

  const addCustomModel = () => {
    if (!customModelForm.name.trim() || !customModelForm.modelId.trim() || !customModelForm.provider.trim()) {
      toast({
        title: "Validation Error",
        description: "All fields are required for custom models.",
        variant: "destructive"
      });
      return;
    }

    const newModel: CustomModel = {
      id: crypto.randomUUID(),
      name: customModelForm.name.trim(),
      modelId: customModelForm.modelId.trim(),
      provider: customModelForm.provider.trim()
    };

    const updatedCustomModels = [...settings.customModels, newModel];
    saveSettings({ customModels: updatedCustomModels });

    setCustomModelForm({ name: '', modelId: '', provider: '' });

    toast({
      title: "Custom Model Added",
      description: `Model "${newModel.name}" has been added successfully.`
    });
  };

  const deleteCustomModel = (modelId: string) => {
    const updatedCustomModels = settings.customModels.filter(m => m.id !== modelId);
    saveSettings({ customModels: updatedCustomModels });

    toast({
      title: "Custom Model Deleted",
      description: "Custom model has been removed successfully."
    });
  };

  const handleSaveSettings = () => {
    saveSettings(settings);
  };

  const allModels = [...defaultModels, ...settings.customModels.map(m => ({
    id: m.modelId,
    name: m.name,
    provider: m.provider,
    isCustom: true
  }))];

  return (
    <div className="h-full flex flex-col p-6">
      <BackToChatButton />
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructional/Tips Area */}
          <div className="rounded-md bg-muted/30 px-4 py-3 text-muted-foreground text-sm flex items-center gap-2 select-none">
            <span className="text-xl">💡</span>
            <span>
              Tip: Use <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> to send, <kbd className="px-2 py-1 bg-muted rounded text-xs">Shift+Enter</kbd> for new line.
            </span>
          </div>
          {/* Theme Settings */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Theme Settings</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span>AMOLED Theme</span>
              </div>
              <Switch 
                checked={theme === 'dark'} 
                onCheckedChange={toggleTheme}
              />
            </div>
          </div>

          {/* AI Model Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">AI Model Selection</h3>
            <Select 
              value={settings.selectedModel} 
              onValueChange={(value) => setSettings(prev => ({ ...prev, selectedModel: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allModels.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      {model.name} ({model.provider})
                      {(model as any).isCustom && <span className="text-xs bg-primary/20 px-1 rounded">Custom</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Model Management */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Custom Model Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Model Name"
                value={customModelForm.name}
                onChange={(e) => setCustomModelForm(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Model ID"
                value={customModelForm.modelId}
                onChange={(e) => setCustomModelForm(prev => ({ ...prev, modelId: e.target.value }))}
              />
              <Input
                placeholder="Provider"
                value={customModelForm.provider}
                onChange={(e) => setCustomModelForm(prev => ({ ...prev, provider: e.target.value }))}
              />
            </div>
            <Button 
              onClick={addCustomModel}
              disabled={!customModelForm.name.trim() || !customModelForm.modelId.trim() || !customModelForm.provider.trim()}
            >
              Add Model
            </Button>
            
            {settings.customModels.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Custom Models:</h4>
                {settings.customModels.map(model => (
                  <div key={model.id} className="flex items-center justify-between p-2 border rounded">
                    <span>{model.name} ({model.provider})</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteCustomModel(model.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Prompt Configuration */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">System Prompt Configuration</h3>
            <Textarea
              placeholder="Enter system prompt to customize AI behavior..."
              value={settings.systemPrompt}
              onChange={(e) => setSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Temperature Control */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Model Creativity (Temperature)</h3>
            <label className="text-sm font-medium">Temperature: {settings.temperature.toFixed(2)}</label>
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
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>More Predictable</span>
              <span>More Creative</span>
            </div>
          </div>

          {/* Context Settings */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Context Settings</h3>
            <div>
              <label className="text-sm font-medium">Max Context Length</label>
              <Input
                type="number"
                min="1"
                max="50"
                value={settings.maxContextLength}
                onChange={(e) => setSettings(prev => ({ ...prev, maxContextLength: parseInt(e.target.value) || 20 }))}
              />
            </div>
          </div>

          {/* API Configuration */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">API Configuration</h3>
            <Input
              type="password"
              placeholder="Enter your API key..."
              value={settings.apiKey}
              onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
            />
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
