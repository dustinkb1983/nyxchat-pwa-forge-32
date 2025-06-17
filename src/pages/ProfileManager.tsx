import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BackToChatButton } from "@/components/ui/BackToChatButton";
import { ModelSelector } from '@/components/ui/ModelSelector';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { availableModels } from '@/constants/models';

interface Profile {
  id: string;
  name: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileManager = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    systemPrompt: '',
    model: 'openai/gpt-4o',
    temperature: 0.7
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteProfile, setPendingDeleteProfile] = useState<Profile | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadProfiles();
    
    // Listen for storage changes to update models dynamically
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app-settings' || e.key === 'deleted-default-models') {
        // Reload profiles to check model validity
        loadProfiles();
      }
    };
    
    const handleModelUpdate = () => {
      loadProfiles();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('modelSettingsUpdated', handleModelUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('modelSettingsUpdated', handleModelUpdate);
    };
  }, []);

  const isModelValid = (modelId: string): boolean => {
    // Check if model exists in available models or custom models
    const appSettings = localStorage.getItem('app-settings');
    const deletedDefaultModels = JSON.parse(localStorage.getItem('deleted-default-models') || '[]');
    
    // Check default models
    const validDefaultModels = availableModels.filter((m: any) => !deletedDefaultModels.includes(m.id));
    if (validDefaultModels.some((m: any) => m.id === modelId)) return true;
    
    // Check custom models
    if (appSettings) {
      const settings = JSON.parse(appSettings);
      if (settings.customModels && Array.isArray(settings.customModels)) {
        return settings.customModels.some((m: any) => m.modelId === modelId);
      }
    }
    
    return false;
  };

  useEffect(() => {
    if (!formData.name.trim()) {
      setFormError('Profile name is required.');
      return;
    }
    if (!formData.systemPrompt.trim()) {
      setFormError('System prompt is required.');
      return;
    }
    // Check for duplicate name (other than currently editing)
    const duplicate = profiles.some(
      (p) =>
        p.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
        (!editingProfile || p.id !== editingProfile.id)
    );
    if (duplicate) {
      setFormError('Profile name must be unique.');
      return;
    }
    setFormError(null);
  }, [formData, profiles, editingProfile]);

  const loadProfiles = () => {
    const savedProfiles = localStorage.getItem('ai-profiles');
    if (savedProfiles) {
      const parsed = JSON.parse(savedProfiles);
      // Filter out profiles with invalid IDs
      const validProfiles = parsed.filter((p: any) => p.id && p.id.trim() !== '');
      setProfiles(validProfiles.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
      })));
    } else {
      // Create default profile
      const defaultProfile: Profile = {
        id: 'default',
        name: 'Default Assistant',
        systemPrompt: 'You are a helpful AI assistant. Be concise, accurate, and friendly.',
        model: 'openai/gpt-4o',
        temperature: 0.7,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setProfiles([defaultProfile]);
      saveProfiles([defaultProfile]);
    }
  };

  const saveProfiles = (updatedProfiles: Profile[]) => {
    localStorage.setItem('ai-profiles', JSON.stringify(updatedProfiles));
    setProfiles(updatedProfiles);
  };

  const handleCreateProfile = () => {
    if (formError) return;
    
    if (!formData.name.trim() || !formData.systemPrompt.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and system prompt are required.",
        variant: "destructive"
      });
      return;
    }

    const newProfile: Profile = {
      id: crypto.randomUUID(),
      name: formData.name.trim(),
      systemPrompt: formData.systemPrompt.trim(),
      model: formData.model,
      temperature: formData.temperature,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedProfiles = [...profiles, newProfile];
    saveProfiles(updatedProfiles);
    
    resetForm();
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Profile Created",
      description: `Profile "${newProfile.name}" has been created successfully.`
    });
  };

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      systemPrompt: profile.systemPrompt,
      model: profile.model,
      temperature: profile.temperature
    });
  };

  const handleUpdateProfile = () => {
    if (formError) return;
    
    if (!editingProfile || !formData.name.trim() || !formData.systemPrompt.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and system prompt are required.",
        variant: "destructive"
      });
      return;
    }

    const updatedProfile: Profile = {
      ...editingProfile,
      name: formData.name.trim(),
      systemPrompt: formData.systemPrompt.trim(),
      model: formData.model,
      temperature: formData.temperature,
      updatedAt: new Date()
    };

    const updatedProfiles = profiles.map(p => p.id === editingProfile.id ? updatedProfile : p);
    saveProfiles(updatedProfiles);
    
    setEditingProfile(null);
    resetForm();
    
    toast({
      title: "Profile Updated",
      description: `Profile "${updatedProfile.name}" has been updated successfully.`
    });
  };

  const handleDeleteRequest = (profile: Profile) => {
    setPendingDeleteProfile(profile);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProfile = () => {
    if (!pendingDeleteProfile) return;
    
    if (profiles.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "At least one profile must remain.",
        variant: "destructive"
      });
      return;
    }

    // If deleting current profile, switch to another available
    const currentProfile = localStorage.getItem('current-profile') || 'default';
    if (pendingDeleteProfile.id === currentProfile) {
      const fallback = profiles.find((p) => p.id !== pendingDeleteProfile.id);
      if (fallback) {
        localStorage.setItem('current-profile', fallback.id);
        window.dispatchEvent(new Event("profile-changed"));
      }
    }
    
    const updatedProfiles = profiles.filter(p => p.id !== pendingDeleteProfile.id);
    saveProfiles(updatedProfiles);
    
    setDeleteDialogOpen(false);
    setPendingDeleteProfile(null);
    
    toast({
      title: "Profile Deleted",
      description: "Profile has been deleted successfully."
    });
  };

  const resetForm = () => {
    setFormData({ name: '', systemPrompt: '', model: 'openai/gpt-4o', temperature: 0.7 });
    setEditingProfile(null);
  };

  const getModelName = (modelId: string) => {
    // Get model name from available models or return the ID
    return modelId;
  };

  return (
    <div className={`h-full flex flex-col ${isMobile ? 'p-3' : 'p-6'}`}>
      <BackToChatButton />
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>Profile Manager</h1>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>Create and manage AI profiles for different use cases</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => resetForm()}
              size={isMobile ? "sm" : "default"}
              className={`${isMobile ? 'text-xs px-2 py-1 h-8' : ''} ripple-button`}
            >
              <Plus className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
              <span className={isMobile ? 'hidden sm:inline' : ''}>New Profile</span>
              <span className={isMobile ? 'sm:hidden' : 'hidden'}>New</span>
            </Button>
          </DialogTrigger>
          <DialogContent className={`${isMobile ? 'max-w-[95vw] w-full mx-2' : 'max-w-2xl'}`}>
            <DialogHeader>
              <DialogTitle className={isMobile ? 'text-lg' : 'text-xl'}>Create New Profile</DialogTitle>
            </DialogHeader>
            <div className={`${isMobile ? 'space-y-2' : 'space-y-3'}`}>
              <div>
                <label className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Profile Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Creative Writer, Code Assistant"
                  className={isMobile ? 'text-sm h-8' : ''}
                />
              </div>
              
              <div>
                <label className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>System Prompt</label>
                <Textarea
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  placeholder="Describe how the AI should behave..."
                  className={`${isMobile ? 'min-h-[60px] text-sm' : 'min-h-[80px]'}`}
                />
              </div>
              
              <div>
                <label className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>AI Model</label>
                <ModelSelector
                  value={formData.model}
                  onChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
                  className={isMobile ? 'h-8' : ''}
                />
              </div>
              
              <div>
                <label className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Temperature: {formData.temperature}</label>
                <Slider
                  value={[formData.temperature]}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, temperature: value[0] }))}
                  max={1}
                  min={0}
                  step={0.1}
                  className="mt-2"
                />
                <div className={`flex justify-between ${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground mt-1`}>
                  <span>More Predictable</span>
                  <span>More Creative</span>
                </div>
              </div>
              
              {formError && <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-destructive`}>{formError}</div>}
              <div className={`flex gap-2 ${isMobile ? 'pt-1' : 'pt-2'}`}>
                <Button 
                  onClick={handleCreateProfile} 
                  disabled={!!formError}
                  size={isMobile ? "sm" : "default"}
                  className="ripple-button"
                >
                  Create Profile
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  size={isMobile ? "sm" : "default"}
                  className="ripple-button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className={`grid gap-2 ${isMobile ? '' : 'gap-3'}`}>
        {profiles.map(profile => (
          <Card key={profile.id} className={`${!isModelValid(profile.model) ? 'border-orange-500 bg-orange-50/10' : ''} ${isMobile ? 'text-sm' : ''}`}>
            <CardHeader className={isMobile ? 'pb-2 p-3' : 'pb-3'}>
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                    <span className="truncate">{profile.name}</span>
                    {profile.id === 'default' && <Badge variant="secondary" className={isMobile ? 'text-xs' : ''}>Default</Badge>}
                    {!isModelValid(profile.model) && (
                      <Badge variant="destructive" className={`flex items-center gap-1 ${isMobile ? 'text-xs' : ''}`}>
                        <AlertTriangle className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
                        Invalid Model
                      </Badge>
                    )}
                  </CardTitle>
                  <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {getModelName(profile.model)} • Temperature: {profile.temperature}
                    {!isModelValid(profile.model) && (
                      <span className="text-orange-600 ml-2">(Model no longer available)</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size={isMobile ? "sm" : "sm"} 
                    onClick={() => handleEditProfile(profile)}
                    className={`${isMobile ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'} ripple-button`}
                  >
                    <Edit className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size={isMobile ? "sm" : "sm"} 
                    onClick={() => handleDeleteRequest(profile)}
                    disabled={profiles.length <= 1}
                    className={`${isMobile ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'} ripple-button`}
                  >
                    <Trash2 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className={isMobile ? 'pt-0 p-3' : ''}>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} line-clamp-3`}>{profile.systemPrompt}</p>
              <div className={`flex gap-4 ${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground ${isMobile ? 'mt-1' : 'mt-2'}`}>
                <span>Created: {profile.createdAt.toLocaleDateString()}</span>
                <span>Updated: {profile.updatedAt.toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Profile"
        description={`Are you sure you want to delete "${pendingDeleteProfile?.name}"? This action cannot be undone.`}
        onConfirm={confirmDeleteProfile}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      {/* Edit Dialog */}
      <Dialog open={!!editingProfile} onOpenChange={() => setEditingProfile(null)}>
        <DialogContent className={`${isMobile ? 'max-w-[95vw] w-full mx-2' : 'max-w-2xl'}`}>
          <DialogHeader>
            <DialogTitle className={isMobile ? 'text-lg' : 'text-xl'}>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className={`${isMobile ? 'space-y-2' : 'space-y-3'}`}>
            <div>
              <label className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Profile Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Creative Writer, Code Assistant"
                className={isMobile ? 'text-sm h-8' : ''}
              />
            </div>
            
            <div>
              <label className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>System Prompt</label>
              <Textarea
                value={formData.systemPrompt}
                onChange={(e) => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
                placeholder="Describe how the AI should behave..."
                className={`${isMobile ? 'min-h-[60px] text-sm' : 'min-h-[80px]'}`}
              />
            </div>
            
            <div>
              <label className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>AI Model</label>
              <ModelSelector
                value={formData.model}
                onChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
                className={isMobile ? 'h-8' : ''}
              />
            </div>
            
            <div>
              <label className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Temperature: {formData.temperature}</label>
              <Slider
                value={[formData.temperature]}
                onValueChange={(value) => setFormData(prev => ({ ...prev, temperature: value[0] }))}
                max={1}
                min={0}
                step={0.1}
                className="mt-2"
              />
              <div className={`flex justify-between ${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground mt-1`}>
                <span>More Predictable</span>
                <span>More Creative</span>
              </div>
            </div>
            
            {formError && <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-destructive`}>{formError}</div>}
            <div className={`flex gap-2 ${isMobile ? 'pt-1' : 'pt-2'}`}>
              <Button
                onClick={handleUpdateProfile}
                disabled={!!formError}
                size={isMobile ? "sm" : "default"}
                className="ripple-button"
              >
                Update Profile
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditingProfile(null)}
                size={isMobile ? "sm" : "default"}
                className="ripple-button"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileManager;
