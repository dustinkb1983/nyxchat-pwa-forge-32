
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Edit, Plus, Trash2, Save, X } from 'lucide-react';
import { useMemory, type MemoryEntry } from '@/contexts/MemoryContext';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { useNavigate } from 'react-router-dom';

export const MemoryManager: React.FC = () => {
  const { memories, addMemory, updateMemory, deleteMemory } = useMemory();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const [newMemory, setNewMemory] = useState({
    content: '',
    category: 'personal' as const,
    importance: 5
  });

  const [editingMemory, setEditingMemory] = useState<MemoryEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteMemory, setPendingDeleteMemory] = useState<MemoryEntry | null>(null);

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

  const handleDeleteRequest = (memory: MemoryEntry) => {
    setPendingDeleteMemory(memory);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteMemory = async () => {
    if (!pendingDeleteMemory) return;

    try {
      await deleteMemory(pendingDeleteMemory.id);
      setDeleteDialogOpen(false);
      setPendingDeleteMemory(null);
      toast.success('Memory deleted successfully');
    } catch (error) {
      console.error('Error deleting memory:', error);
      toast.error('Failed to delete memory');
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
    <div className={`h-full flex flex-col ${isMobile ? 'p-2' : 'p-6'}`}>
      {/* Header with close button */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>Memory Manager</h1>
          <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-base'}`}>Manage AI memories for better context</p>
        </div>
        
        <div className="flex items-center gap-2">
          {memories.length > 0 && (
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              onClick={handleClearAll}
              className={`${isMobile ? 'text-xs px-2 py-1 h-7' : ''} text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 ripple-button`}
            >
              <Trash2 className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
              <span className={isMobile ? 'hidden sm:inline' : ''}>Clear All</span>
              <span className={isMobile ? 'sm:hidden' : 'hidden'}>Clear</span>
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className={`${isMobile ? 'h-7 w-7' : 'h-8 w-8'} ripple-button`}
          >
            <X className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
          </Button>
        </div>
      </div>

      <div className={`space-y-3 ${isMobile ? 'space-y-2' : ''}`}>
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search memories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={isMobile ? 'h-7 text-xs' : 'h-8 text-sm'}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className={`w-full sm:w-48 ${isMobile ? 'h-7 text-xs' : 'h-8 text-sm'}`}>
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
          <CardHeader className={isMobile ? 'pb-1 p-2' : 'pb-2 p-3'}>
            <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
              <Brain className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
              Add New Memory
            </CardTitle>
          </CardHeader>
          <CardContent className={`space-y-2 ${isMobile ? 'space-y-1 p-2' : 'p-3'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label htmlFor="category" className={isMobile ? 'text-xs' : 'text-sm'}>Category</Label>
                <Select 
                  value={newMemory.category} 
                  onValueChange={(value) => setNewMemory(prev => ({ ...prev, category: value as any }))}
                >
                  <SelectTrigger className={isMobile ? 'h-7 text-xs' : 'h-8 text-sm'}>
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
                <Label htmlFor="importance" className={isMobile ? 'text-xs' : 'text-sm'}>Importance (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newMemory.importance}
                  onChange={(e) => setNewMemory(prev => ({ 
                    ...prev, 
                    importance: Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
                  }))}
                  className={isMobile ? 'h-7 text-xs' : 'h-8 text-sm'}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="content" className={isMobile ? 'text-xs' : 'text-sm'}>Memory Content</Label>
              <Textarea
                id="content"
                placeholder="Enter memory content..."
                value={newMemory.content}
                onChange={(e) => setNewMemory(prev => ({ ...prev, content: e.target.value }))}
                className={`${isMobile ? 'min-h-12 text-xs' : 'min-h-16 text-sm'} resize-none`}
              />
            </div>
            <Button 
              onClick={handleAddMemory} 
              className={`w-full sm:w-auto ${isMobile ? 'h-7 text-xs' : 'h-8 text-sm'} ripple-button`}
              size={isMobile ? "sm" : "default"}
            >
              <Plus className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-3 w-3 mr-1'}`} />
              Add Memory
            </Button>
          </CardContent>
        </Card>

        {/* Memory List */}
        <div className="flex-1 overflow-hidden">
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium mb-2`}>
            Stored Memories ({filteredMemories.length})
          </h3>

          <ScrollArea className="h-96">
            <div className={`space-y-2 ${isMobile ? 'space-y-1' : ''}`}>
              {filteredMemories.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  {searchTerm || categoryFilter !== 'all' 
                    ? 'No memories match your filters.' 
                    : 'No memories stored yet. Add your first memory above!'
                  }
                </div>
              ) : (
                filteredMemories.map((memory) => (
                  <Card key={memory.id} className={isMobile ? 'text-xs' : 'text-sm'}>
                    <CardContent className={`p-2 ${isMobile ? 'p-1.5' : ''}`}>
                      {editingMemory?.id === memory.id ? (
                        <div className={`space-y-2 ${isMobile ? 'space-y-1' : ''}`}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Select 
                              value={editingMemory.category} 
                              onValueChange={(value) => setEditingMemory(prev => 
                                prev ? { ...prev, category: value as any } : null
                              )}
                            >
                              <SelectTrigger className={isMobile ? 'h-7 text-xs' : 'h-8 text-sm'}>
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
                              className={isMobile ? 'h-7 text-xs' : 'h-8 text-sm'}
                            />
                          </div>
                          <Textarea
                            value={editingMemory.content}
                            onChange={(e) => setEditingMemory(prev => 
                              prev ? { ...prev, content: e.target.value } : null
                            )}
                            className={`${isMobile ? 'min-h-12 text-xs' : 'min-h-16 text-sm'} resize-none`}
                          />
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              onClick={handleUpdateMemory}
                              className={`${isMobile ? 'h-6 text-xs px-2' : 'h-7 text-xs'} ripple-button`}
                            >
                              <Save className={`${isMobile ? 'h-2 w-2 mr-1' : 'h-3 w-3 mr-1'}`} />
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setEditingMemory(null)}
                              className={`${isMobile ? 'h-6 text-xs px-2' : 'h-7 text-xs'} ripple-button`}
                            >
                              <X className={`${isMobile ? 'h-2 w-2 mr-1' : 'h-3 w-3 mr-1'}`} />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex flex-wrap items-center gap-1">
                              <Badge variant="secondary" className={isMobile ? 'text-xs px-1 py-0' : 'text-xs'}>
                                {memory.category}
                              </Badge>
                              <Badge 
                                variant={memory.importance >= 7 ? "default" : "outline"}
                                className={isMobile ? 'text-xs px-1 py-0' : 'text-xs'}
                              >
                                Priority: {memory.importance}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingMemory(memory)}
                                className={`${isMobile ? 'h-5 w-5 p-0' : 'h-6 w-6 p-0'} ripple-button`}
                              >
                                <Edit className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteRequest(memory)}
                                className={`${isMobile ? 'h-5 w-5 p-0' : 'h-6 w-6 p-0'} text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 ripple-button`}
                              >
                                <Trash2 className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
                              </Button>
                            </div>
                          </div>
                          <p className={`text-foreground leading-relaxed mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            {memory.content}
                          </p>
                          <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Memory"
        description={`Are you sure you want to delete this memory? This action cannot be undone.`}
        onConfirm={confirmDeleteMemory}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
};
