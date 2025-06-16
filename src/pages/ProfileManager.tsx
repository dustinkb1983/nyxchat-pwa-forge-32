import React, { useState, useEffect } from 'react';
import { availableModels } from '@/constants/models';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BackToChatButton } from "@/components/ui/BackToChatButton";

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
  const { toast } = useToast();
  
  // New: add error state for form
  const [formError, setFormError] = useState<string | null>(null);

  // Confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  // Enhance live validation (name and systemPrompt)
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
    
    setFormData({ name: '', systemPrompt: '', model: 'openai/gpt-4o', temperature: 0.7 });
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
    setFormData({ name: '', systemPrompt: '', model: 'openai/gpt-4o', temperature: 0.7 });
    
    toast({
      title: "Profile Updated",
      description: `Profile "${updatedProfile.name}" has been updated successfully.`
    });
  };

  // Profile delete with confirmation
  const handleDeleteProfileRequest = (profileId: string) => {
    setPendingDeleteId(profileId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProfile = () => {
    if (!pendingDeleteId) return;
    // If deleting current profile, switch to another available
    if (profiles.length <= 1) return;
    let nextProfileId = 'default';
    if (pendingDeleteId === (localStorage.getItem('current-profile') || 'default')) {
      const fallback = profiles.find((p) => p.id !== pendingDeleteId);
      nextProfileId = fallback ? fallback.id : 'default';
      localStorage.setItem('current-profile', nextProfileId);
      // If the app uses a context or function, also update it:
      if (typeof window !== "undefined" && window.dispatchEvent) {
        window.dispatchEvent(new Event("profile-changed")); // let other components know
      }
    }
    const updatedProfiles = profiles.filter(p => p.id !== pendingDeleteId);
    saveProfiles(updatedProfiles);
    setPendingDeleteId(null);
    setDeleteDialogOpen(false);
    toast({
      title: "Profile Deleted",
      description: "Profile has been deleted successfully."
    });
  };

  const cancelDeleteProfile = () => {
    setPendingDeleteId(null);
    setDeleteDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({ name: '', systemPrompt: '', model: 'openai/gpt-4o', temperature: 0.7 });
    setEditingProfile(null);
  };

  const getModelName = (modelId: string) => {
    const model = availableModels.find(m => m.id === modelId);
    return model ? model.name : modelId;
  };

  // Filter available models to ensure no empty IDs
  const validModels = availableModels.filter(model => model.id && model.id.trim() !== '');

  const renderModelSelect = () => (
    <Select value={formData.model} onValueChange={(value) => setFormData(prev => ({ ...prev, model: value }))}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {validModels.map(model => (
          <SelectItem key={model.id} value={model.id}>
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="h-full flex flex-col p-6">
      <BackToChatButton />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Profile Manager</h1>
          <p className="text-muted-foreground">Create and manage AI profiles for different use cases</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              New Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Profile Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Creative Writer, Code Assistant"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">System Prompt</label>
                <Textarea
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  placeholder="Describe how the AI should behave..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">AI Model</label>
                {renderModelSelect()}
              </div>
              
              <div>
                <label className="text-sm font-medium">Temperature: {formData.temperature}</label>
                <Slider
                  value={[formData.temperature]}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, temperature: value[0] }))}
                  max={1}
                  min={0}
                  step={0.1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>More Predictable</span>
                  <span>More Creative</span>
                </div>
              </div>
              
              {formError && <div className="text-sm text-destructive">{formError}</div>}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreateProfile} disabled={!!formError}>
                  Create Profile
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {profiles.map(profile => (
          <Card key={profile.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {profile.name}
                    {profile.id === 'default' && <Badge variant="secondary">Default</Badge>}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {getModelName(profile.model)} • Temperature: {profile.temperature}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditProfile(profile)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteProfileRequest(profile.id)}
                    disabled={profiles.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{profile.systemPrompt}</p>
              <div className="flex gap-4 text-xs text-muted-foreground mt-3">
                <span>Created: {profile.createdAt.toLocaleDateString()}</span>
                <span>Updated: {profile.updatedAt.toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Profile</DialogTitle>
          </DialogHeader>
          <div>
            Are you sure you want to delete this profile? You cannot undo this action.
          </div>
          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="destructive" onClick={confirmDeleteProfile}>Delete</Button>
            <Button variant="outline" onClick={cancelDeleteProfile}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingProfile} onOpenChange={() => setEditingProfile(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Profile Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Creative Writer, Code Assistant"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">System Prompt</label>
              <Textarea
                value={formData.systemPrompt}
                onChange={(e) => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
                placeholder="Describe how the AI should behave..."
                className="min-h-[100px]"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">AI Model</label>
              {renderModelSelect()}
            </div>
            
            <div>
              <label className="text-sm font-medium">Temperature: {formData.temperature}</label>
              <Slider
                value={[formData.temperature]}
                onValueChange={(value) => setFormData(prev => ({ ...prev, temperature: value[0] }))}
                max={1}
                min={0}
                step={0.1}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>More Predictable</span>
                <span>More Creative</span>
              </div>
            </div>
            
            {formError && <div className="text-sm text-destructive">{formError}</div>}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleUpdateProfile}
                disabled={!!formError}
              >
                Update Profile
              </Button>
              <Button variant="outline" onClick={() => setEditingProfile(null)}>
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
