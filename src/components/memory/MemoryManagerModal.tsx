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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Brain, Edit, Plus, Trash2, User, Eye, Save, X } from 'lucide-react';
import { useMemory, type MemoryEntry } from '@/contexts/MemoryContext';
import { MemoryVisualization } from '@/components/memory/MemoryVisualization';
import { MemoryInsights } from '@/components/memory/MemoryInsights';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface MemoryManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profiles: { id: string; name: string }[];
}

export const MemoryManagerModal: React.FC<MemoryManagerModalProps> = ({ 
  open, 
  onOpenChange,
  profiles 
}) => {
  const { memories, addMemory, updateMemory, deleteMemory } = useMemory();
  const isMobile = useIsMobile();
  
  const [newMemory, setNewMemory] = useState({
    content: '',
    category: 'personal' as const,
    importance: 5
  });

  const [editingMemory, setEditingMemory] = useState<MemoryEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedProfile, setSelectedProfile] = useState<string>('all');

  const categories = ['personal', 'preferences', 'context', 'knowledge', 'other'] as const;

  const handleAddMemory = async () => {
    if (!newMemory.content.trim()) {
      toast.error('Memory content cannot be empty');
      return;
    }

    try {
      await addMemory({
        content: newMemory.content,
        category: newMemory.category,
        importance: newMemory.importance
      });
      
      setNewMemory({
        content: '',
        category: 'personal',
        importance: 5
      });
      
      toast.success('Memory added successfully');
    } catch (error) {
      console.error('Error adding memory:', error);
      toast.error('Failed to add memory');
    }
  };

  const handleUpdateMemory = async () => {
    if (!editingMemory) return;

    try {
      await updateMemory(editingMemory.id, {
        content: editingMemory.content,
        category: editingMemory.category,
        importance: editingMemory.importance
      });
      
      setEditingMemory(null);
      toast.success('Memory updated successfully');
    } catch (error) {
      console.error('Error updating memory:', error);
      toast.error('Failed to update memory');
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (confirm('Are you sure you want to delete this memory?')) {
      try {
        await deleteMemory(id);
        toast.success('Memory deleted successfully');
      } catch (error) {
        console.error('Error deleting memory:', error);
        toast.error('Failed to delete memory');
      }
    }
  };

  const handleClearAll = async () => {
    if (confirm('This will delete all memories. Are you sure?')) {
      try {
        for (const memory of memories) {
          await deleteMemory(memory.id);
        }
        toast.success('All memories cleared successfully');
      } catch (error) {
        console.error('Error clearing memories:', error);
        toast.error('Failed to clear memories');
      }
    }
  };

  const filteredMemories = memories.filter(memory => {
    const matchesSearch = memory.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || memory.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`modal-unified ${isMobile ? 'memory-modal-mobile' : ''} max-w-4xl max-h-[90vh] overflow-hidden`}>
        <DialogHeader className="modal-header px-6 py-4">
          <DialogTitle className="modal-title flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Memory Manager
          </DialogTitle>
        </DialogHeader>

        <div className="modal-body flex-1 overflow-hidden">
          <Tabs defaultValue="memories" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mx-6">
              <TabsTrigger value="memories">Memories</TabsTrigger>
              <TabsTrigger value="visualization">Insights</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="memories" className="flex-1 overflow-hidden">
              <div className="p-6 h-full flex flex-col gap-4">
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search memories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Add New Memory */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Add New Memory</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select 
                          value={newMemory.category} 
                          onValueChange={(value) => setNewMemory(prev => ({ ...prev, category: value as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="importance">Importance (1-10)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={newMemory.importance}
                          onChange={(e) => setNewMemory(prev => ({ 
                            ...prev, 
                            importance: Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
                          }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="content">Memory Content</Label>
                      <Textarea
                        id="content"
                        placeholder="Enter memory content..."
                        value={newMemory.content}
                        onChange={(e) => setNewMemory(prev => ({ ...prev, content: e.target.value }))}
                        className="min-h-20 custom-scrollbar"
                      />
                    </div>
                    <Button onClick={handleAddMemory} className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Memory
                    </Button>
                  </CardContent>
                </Card>

                {/* Memory List */}
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Stored Memories ({filteredMemories.length})</h3>
                    {memories.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleClearAll}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>
                    )}
                  </div>

                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {filteredMemories.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          {searchTerm || categoryFilter !== 'all' 
                            ? 'No memories match your filters.' 
                            : 'No memories stored yet. Add your first memory above!'
                          }
                        </div>
                      ) : (
                        filteredMemories.map((memory) => (
                          <Card key={memory.id} className="mobile-card">
                            <CardContent className="p-4">
                              {editingMemory?.id === memory.id ? (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Select 
                                      value={editingMemory.category} 
                                      onValueChange={(value) => setEditingMemory(prev => 
                                        prev ? { ...prev, category: value as any } : null
                                      )}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {categories.map(category => (
                                          <SelectItem key={category} value={category}>
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Input
                                      type="number"
                                      min="1"
                                      max="10"
                                      value={editingMemory.importance}
                                      onChange={(e) => setEditingMemory(prev => 
                                        prev ? { 
                                          ...prev, 
                                          importance: Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
                                        } : null
                                      )}
                                    />
                                  </div>
                                  <Textarea
                                    value={editingMemory.content}
                                    onChange={(e) => setEditingMemory(prev => 
                                      prev ? { ...prev, content: e.target.value } : null
                                    )}
                                    className="min-h-20 custom-scrollbar"
                                  />
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={handleUpdateMemory}>
                                      <Save className="h-4 w-4 mr-2" />
                                      Save
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => setEditingMemory(null)}
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Badge variant="secondary" className="text-xs">
                                        {memory.category}
                                      </Badge>
                                      <Badge 
                                        variant={memory.importance >= 7 ? "default" : "outline"}
                                        className="text-xs"
                                      >
                                        Priority: {memory.importance}
                                      </Badge>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditingMemory(memory)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteMemory(memory.id)}
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-sm text-foreground leading-relaxed mb-2">
                                    {memory.content}
                                  </p>
                                  <div className="text-xs text-muted-foreground">
                                    Created: {new Date(memory.createdAt).toLocaleDateString()}
                                    {memory.lastAccessed && (
                                      <> • Last accessed: {new Date(memory.lastAccessed).toLocaleDateString()}</>
                                    )}
                                  </div>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="visualization" className="flex-1 overflow-hidden">
              <div className="p-6 h-full">
                <MemoryVisualization 
                  memories={memories} 
                  onSelectMemory={(memory) => {
                    // Switch to memories tab and highlight the selected memory
                  }}
                />
                <Separator className="my-6" />
                <MemoryInsights memories={memories} />
              </div>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 overflow-hidden">
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Memory Settings</h3>
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Data Management
                          </CardTitle>
                          <CardDescription>
                            Manage your stored memories and data.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Button 
                            variant="outline" 
                            onClick={handleClearAll}
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-800"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear All Memories
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
