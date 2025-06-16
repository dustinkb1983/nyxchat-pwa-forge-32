import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Save, Plus, Download, Upload, X } from 'lucide-react';
import { useMemory } from '@/contexts/MemoryContext';
import { toast } from 'sonner';
import { MemoryVisualization } from './MemoryVisualization';
import { MemoryInsights } from './MemoryInsights';
import { useIsMobile } from '@/hooks/use-mobile';

interface Profile {
  id: string;
  name: string;
}

interface MemoryManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profiles: Profile[];
}

export const MemoryManagerModal: React.FC<MemoryManagerModalProps> = ({
  open,
  onOpenChange,
  profiles
}) => {
  const { memories, addMemory, updateMemory, deleteMemory, clearAllMemories } = useMemory();
  const isMobile = useIsMobile();
  
  const [selectedProfile, setSelectedProfile] = useState<string>('global');
  const [newMemory, setNewMemory] = useState({
    title: '',
    content: '',
    tags: '',
    profileId: 'global'
  });
  const [editingMemory, setEditingMemory] = useState<string | null>(null);

  const handleAddMemory = async () => {
    if (!newMemory.title.trim() || !newMemory.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    const success = await addMemory({
      title: newMemory.title.trim(),
      content: newMemory.content.trim(),
      tags: newMemory.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      profileId: newMemory.profileId
    });

    if (success) {
      setNewMemory({ title: '', content: '', tags: '', profileId: 'global' });
      toast.success('Memory added successfully!');
    }
  };

  const handleUpdateMemory = async (id: string, updates: Partial<typeof newMemory>) => {
    const success = await updateMemory(id, {
      ...updates,
      tags: updates.tags ? updates.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined
    });

    if (success) {
      setEditingMemory(null);
      toast.success('Memory updated successfully!');
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (confirm('Are you sure you want to delete this memory?')) {
      const success = await deleteMemory(id);
      if (success) {
        toast.success('Memory deleted successfully!');
      }
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to delete ALL memories? This cannot be undone.')) {
      const success = await clearAllMemories();
      if (success) {
        toast.success('All memories cleared successfully!');
      }
    }
  };

  const handleExportMemories = () => {
    const dataStr = JSON.stringify(memories, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'nyx-memories.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Memories exported successfully!');
  };

  const handleImportMemories = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedMemories = JSON.parse(e.target?.result as string);
        
        for (const memory of importedMemories) {
          if (memory.title && memory.content) {
            await addMemory({
              title: memory.title,
              content: memory.content,
              tags: memory.tags || [],
              profileId: memory.profileId || 'global'
            });
          }
        }
        
        toast.success(`Imported ${importedMemories.length} memories successfully!`);
      } catch (error) {
        toast.error('Failed to import memories. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  const filteredMemories = memories.filter(memory => 
    selectedProfile === 'all' || memory.profileId === selectedProfile
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`modal-unified max-w-4xl max-h-[90vh] overflow-hidden ${isMobile ? 'memory-modal-mobile mx-2 w-[calc(100vw-1rem)]' : ''}`}>
        <DialogHeader className="modal-header">
          <DialogTitle className="modal-title">Memory Palace</DialogTitle>
        </DialogHeader>
        
        <div className={`modal-body flex-1 overflow-y-auto custom-scrollbar ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
          {/* Memory Statistics */}
          <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-3 gap-4'}`}>
            <div className={`bg-muted/50 rounded-lg p-3 ${isMobile ? 'text-center' : ''}`}>
              <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-primary`}>{memories.length}</div>
              <div className={`text-xs ${isMobile ? '' : 'text-sm'} text-muted-foreground`}>Total Memories</div>
            </div>
            <div className={`bg-muted/50 rounded-lg p-3 ${isMobile ? 'text-center' : ''}`}>
              <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-primary`}>
                {new Set(memories.flatMap(m => m.tags)).size}
              </div>
              <div className={`text-xs ${isMobile ? '' : 'text-sm'} text-muted-foreground`}>Unique Tags</div>
            </div>
            {!isMobile && (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-primary">
                  {new Set(memories.map(m => m.profileId)).size}
                </div>
                <div className="text-sm text-muted-foreground">Profiles</div>
              </div>
            )}
          </div>

          {/* Memory Insights */}
          <MemoryInsights memories={memories} />
          
          {/* Memory Visualization */}
          {!isMobile && <MemoryVisualization memories={memories} />}

          {/* Controls */}
          <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'flex-wrap gap-2'} items-center justify-between`}>
            <div className={`flex ${isMobile ? 'w-full' : ''} gap-2`}>
              <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                <SelectTrigger className={`${isMobile ? 'flex-1 text-sm' : 'w-40'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Profiles</SelectItem>
                  <SelectItem value="global">Global</SelectItem>
                  {profiles.map(profile => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {isMobile && (
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  disabled={memories.length === 0}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-800"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className={`flex ${isMobile ? 'w-full justify-between' : ''} gap-2`}>
              <Button variant="outline" onClick={handleExportMemories} size={isMobile ? "sm" : "default"}>
                <Download className="h-4 w-4 mr-1" />
                {!isMobile && 'Export'}
              </Button>
              
              <label className="cursor-pointer">
                <Button variant="outline" size={isMobile ? "sm" : "default"} asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-1" />
                    {!isMobile && 'Import'}
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportMemories}
                  className="hidden"
                />
              </label>
              
              {!isMobile && (
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  disabled={memories.length === 0}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-800"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Add New Memory */}
          <div className={`border rounded-lg p-4 bg-muted/20 ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>Add New Memory</h3>
            
            <div className={`${isMobile ? 'space-y-3' : 'grid grid-cols-2 gap-4'}`}>
              <Input
                placeholder="Memory title..."
                value={newMemory.title}
                onChange={(e) => setNewMemory(prev => ({ ...prev, title: e.target.value }))}
                className={isMobile ? 'text-sm' : ''}
              />
              
              <Select 
                value={newMemory.profileId} 
                onValueChange={(value) => setNewMemory(prev => ({ ...prev, profileId: value }))}
              >
                <SelectTrigger className={isMobile ? 'text-sm' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global</SelectItem>
                  {profiles.map(profile => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Textarea
              placeholder="Memory content..."
              value={newMemory.content}
              onChange={(e) => setNewMemory(prev => ({ ...prev, content: e.target.value }))}
              className={`${isMobile ? 'min-h-[80px] text-sm' : 'min-h-[100px]'} resize-none custom-scrollbar`}
            />
            
            <div className={`${isMobile ? 'space-y-3' : 'flex gap-4 items-end'}`}>
              <div className="flex-1">
                <Input
                  placeholder="Tags (comma-separated)..."
                  value={newMemory.tags}
                  onChange={(e) => setNewMemory(prev => ({ ...prev, tags: e.target.value }))}
                  className={isMobile ? 'text-sm' : ''}
                />
              </div>
              <Button onClick={handleAddMemory} size={isMobile ? "sm" : "default"}>
                <Plus className="h-4 w-4 mr-2" />
                Add Memory
              </Button>
            </div>
          </div>

          {/* Existing Memories */}
          <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>
              Memories ({filteredMemories.length})
            </h3>
            
            {filteredMemories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className={`${isMobile ? 'text-base' : 'text-lg'} font-medium mb-2`}>No memories found</div>
                <div className={`${isMobile ? 'text-sm' : ''}`}>
                  {selectedProfile === 'all' 
                    ? 'Create your first memory above'
                    : `No memories for ${selectedProfile === 'global' ? 'Global' : profiles.find(p => p.id === selectedProfile)?.name || selectedProfile}`
                  }
                </div>
              </div>
            ) : (
              <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
                {filteredMemories.map((memory) => (
                  <div key={memory.id} className={`border rounded-lg p-4 bg-card mobile-fix-overlap ${isMobile ? 'space-y-2' : ''}`}>
                    {editingMemory === memory.id ? (
                      <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
                        <Input
                          value={memory.title}
                          onChange={(e) => updateMemory(memory.id, { title: e.target.value })}
                          className={isMobile ? 'text-sm font-medium' : 'font-medium'}
                        />
                        <Textarea
                          value={memory.content}
                          onChange={(e) => updateMemory(memory.id, { content: e.target.value })}
                          className={`${isMobile ? 'min-h-[80px] text-sm' : 'min-h-[100px]'} resize-none custom-scrollbar`}
                        />
                        <Input
                          value={memory.tags.join(', ')}
                          onChange={(e) => updateMemory(memory.id, { tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                          placeholder="Tags (comma-separated)"
                          className={isMobile ? 'text-sm' : ''}
                        />
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => setEditingMemory(null)} 
                            size={isMobile ? "sm" : "default"}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setEditingMemory(null)}
                            size={isMobile ? "sm" : "default"}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-medium truncate`}>
                              {memory.title}
                            </h4>
                            <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                              {memory.profileId === 'global' ? 'Global' : 
                               profiles.find(p => p.id === memory.profileId)?.name || memory.profileId}
                              {' • '}
                              {new Date(memory.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingMemory(memory.id)}
                              className={isMobile ? 'h-8 w-8 p-0' : ''}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMemory(memory.id)}
                              className={`text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 ${isMobile ? 'h-8 w-8 p-0' : ''}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className={`${isMobile ? 'text-sm' : ''} text-muted-foreground mt-2`}>
                          {memory.content}
                        </p>
                        
                        {memory.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {memory.tags.map((tag, index) => (
                              <span
                                key={index}
                                className={`inline-block bg-primary/10 text-primary px-2 py-1 rounded-full ${isMobile ? 'text-xs' : 'text-sm'}`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
