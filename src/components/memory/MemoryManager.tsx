import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Trash2, Edit3, X } from 'lucide-react';
import { useMemory } from '@/contexts/MemoryContext';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

interface Memory {
  id: string;
  title: string;
  content: string;
  tags: string[];
  timestamp: number;
  type: 'user' | 'ai' | 'general';
}

export const MemoryManager = () => {
  const { memories, addMemory, updateMemory, deleteMemory, clearAllMemories } = useMemory();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showNewMemoryForm, setShowNewMemoryForm] = useState(false);
  
  const [newMemory, setNewMemory] = useState({
    title: '',
    content: '',
    tags: '',
    type: 'general' as const
  });

  const [editMemory, setEditMemory] = useState({
    title: '',
    content: '',
    tags: '',
    type: 'general' as const
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState<string | null>(null);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);

  useEffect(() => {
    // Load memories from local storage on component mount
    const storedMemories = localStorage.getItem('memories');
    if (storedMemories) {
      try {
        const parsedMemories = JSON.parse(storedMemories) as Memory[];
        // Ensure that the loaded memories are valid
        if (Array.isArray(parsedMemories)) {
          // Dispatch each memory individually to ensure the context is updated correctly
          parsedMemories.forEach(memory => {
            addMemory(memory);
          });
        } else {
          console.error('Invalid memories data in local storage:', parsedMemories);
        }
      } catch (error) {
        console.error('Error parsing memories from local storage:', error);
      }
    }
  }, [addMemory]);

  useEffect(() => {
    // Save memories to local storage whenever memories change
    localStorage.setItem('memories', JSON.stringify(memories));
  }, [memories]);

  const filteredMemories = memories.filter(memory =>
    memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    memory.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    memory.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddMemory = () => {
    if (!newMemory.title.trim() || !newMemory.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required.",
        variant: "destructive"
      });
      return;
    }

    const tags = newMemory.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const memory: Omit<Memory, 'id' | 'timestamp'> = {
      title: newMemory.title,
      content: newMemory.content,
      tags,
      type: newMemory.type
    };

    addMemory(memory);
    setNewMemory({ title: '', content: '', tags: '', type: 'general' });
    setShowNewMemoryForm(false);
    
    toast({
      title: "Memory Added",
      description: "New memory has been saved successfully."
    });
  };

  const handleUpdateMemory = () => {
    if (!selectedMemory || !editMemory.title.trim() || !editMemory.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required.",
        variant: "destructive"
      });
      return;
    }

    const tags = editMemory.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const updatedMemory: Memory = {
      ...selectedMemory,
      title: editMemory.title,
      content: editMemory.content,
      tags,
      type: editMemory.type
    };

    updateMemory(selectedMemory.id, updatedMemory);
    setSelectedMemory(updatedMemory);
    setIsEditing(false);
    
    toast({
      title: "Memory Updated",
      description: "Memory has been updated successfully."
    });
  };

  const handleDeleteRequest = (memoryId: string) => {
    setMemoryToDelete(memoryId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (memoryToDelete) {
      deleteMemory(memoryToDelete);
      if (selectedMemory?.id === memoryToDelete) {
        setSelectedMemory(null);
        setIsEditing(false);
      }
      setDeleteDialogOpen(false);
      setMemoryToDelete(null);
      
      toast({
        title: "Memory Deleted",
        description: "Memory has been deleted successfully."
      });
    }
  };

  const handleClearAllRequest = () => {
    setClearAllDialogOpen(true);
  };

  const confirmClearAll = () => {
    clearAllMemories();
    setSelectedMemory(null);
    setIsEditing(false);
    setClearAllDialogOpen(false);
    
    toast({
      title: "All Memories Cleared",
      description: "All memories have been deleted successfully."
    });
  };

  const handleEditStart = (memory: Memory) => {
    setEditMemory({
      title: memory.title,
      content: memory.content,
      tags: memory.tags.join(', '),
      type: memory.type
    });
    setIsEditing(true);
  };

  return (
    <div className={`h-full flex flex-col no-horizontal-scroll ${isMobile ? 'p-2' : 'p-6'}`}>
      {/* Header with close button - single X */}
      <div className="flex items-center justify-between mb-3">
        <h1 className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>Memory Manager</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className={`${isMobile ? 'h-7 w-7' : 'h-8 w-8'} ripple-button`}
        >
          <X className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
        </Button>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${isMobile ? 'space-y-2' : 'grid grid-cols-1 lg:grid-cols-2 gap-6'} min-h-0`}>
        {/* Left Panel - Memory List */}
        <Card className="flex flex-col min-h-0">
          <CardHeader className={isMobile ? 'pb-2 p-3' : 'pb-4'}>
            <div className="flex items-center justify-between">
              <CardTitle className={isMobile ? 'text-base' : 'text-lg'}>
                Memories ({filteredMemories.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowNewMemoryForm(true)}
                  size={isMobile ? "sm" : "default"}
                  className={`${isMobile ? 'h-7 w-7 text-xs' : 'h-8 w-8'} ripple-button`}
                >
                  <Plus className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                </Button>
                <Button
                  onClick={handleClearAllRequest}
                  variant="destructive"
                  size={isMobile ? "sm" : "default"}
                  className={`${isMobile ? 'h-7 text-xs' : 'h-8 text-sm'} ripple-button`}
                  disabled={memories.length === 0}
                >
                  Clear All
                </Button>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
              <Input
                placeholder="Search memories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${isMobile ? 'pl-8 h-7 text-xs' : 'pl-10 h-9'}`}
              />
            </div>
          </CardHeader>

          <CardContent className={`flex-1 overflow-hidden ${isMobile ? 'p-3' : 'p-6'}`}>
            <div className="h-full overflow-y-auto space-y-2">
              {showNewMemoryForm && (
                <Card className="border-dashed">
                  <CardContent className={`${isMobile ? 'p-3 space-y-2' : 'p-4 space-y-3'}`}>
                    <Input
                      placeholder="Memory title..."
                      value={newMemory.title}
                      onChange={(e) => setNewMemory(prev => ({ ...prev, title: e.target.value }))}
                      className={isMobile ? 'h-7 text-xs' : 'h-8'}
                    />
                    <Textarea
                      placeholder="Memory content..."
                      value={newMemory.content}
                      onChange={(e) => setNewMemory(prev => ({ ...prev, content: e.target.value }))}
                      className={`resize-none ${isMobile ? 'min-h-16 text-xs' : 'min-h-20'}`}
                    />
                    <Input
                      placeholder="Tags (comma-separated)..."
                      value={newMemory.tags}
                      onChange={(e) => setNewMemory(prev => ({ ...prev, tags: e.target.value }))}
                      className={isMobile ? 'h-7 text-xs' : 'h-8'}
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddMemory}
                        size={isMobile ? "sm" : "default"}
                        className={`${isMobile ? 'h-7 text-xs' : 'h-8'} ripple-button`}
                      >
                        Add
                      </Button>
                      <Button 
                        onClick={() => setShowNewMemoryForm(false)}
                        variant="outline"
                        size={isMobile ? "sm" : "default"}
                        className={`${isMobile ? 'h-7 text-xs' : 'h-8'} ripple-button`}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {filteredMemories.map((memory) => (
                <Card 
                  key={memory.id} 
                  className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                    selectedMemory?.id === memory.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedMemory(memory)}
                >
                  <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium truncate ${isMobile ? 'text-sm' : 'text-base'}`}>
                          {memory.title}
                        </h3>
                        <p className={`text-muted-foreground mt-1 line-clamp-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                          {memory.content}
                        </p>
                        {memory.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {memory.tags.map((tag, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className={isMobile ? 'text-xs px-1 py-0' : 'text-xs'}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRequest(memory.id);
                        }}
                        variant="ghost"
                        size="icon"
                        className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} ripple-button ml-2 flex-shrink-0`}
                      >
                        <Trash2 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredMemories.length === 0 && (
                <div className="text-center py-8">
                  <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>
                    {searchTerm ? 'No memories found matching your search.' : 'No memories yet. Create your first memory!'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Memory Details (Desktop only) */}
        {!isMobile && (
          <Card className="flex flex-col min-h-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {selectedMemory ? (isEditing ? 'Edit Memory' : 'Memory Details') : 'Select a Memory'}
                </CardTitle>
                {selectedMemory && !isEditing && (
                  <Button
                    onClick={() => handleEditStart(selectedMemory)}
                    variant="outline"
                    size="sm"
                    className="h-8 ripple-button"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-6">
              {selectedMemory ? (
                <div className="h-full overflow-y-auto">
                  {isEditing ? (
                    <div className="space-y-4">
                      <Input
                        placeholder="Memory title..."
                        value={editMemory.title}
                        onChange={(e) => setEditMemory(prev => ({ ...prev, title: e.target.value }))}
                        className="h-8"
                      />
                      <Textarea
                        placeholder="Memory content..."
                        value={editMemory.content}
                        onChange={(e) => setEditMemory(prev => ({ ...prev, content: e.target.value }))}
                        className="resize-none min-h-32"
                      />
                      <Input
                        placeholder="Tags (comma-separated)..."
                        value={editMemory.tags}
                        onChange={(e) => setEditMemory(prev => ({ ...prev, tags: e.target.value }))}
                        className="h-8"
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleUpdateMemory}
                          className="h-8 ripple-button"
                        >
                          Save Changes
                        </Button>
                        <Button 
                          onClick={() => setIsEditing(false)}
                          variant="outline"
                          className="h-8 ripple-button"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-xl font-semibold mb-2">{selectedMemory.title}</h2>
                        <Badge variant="outline" className="text-xs mb-4">
                          {selectedMemory.type}
                        </Badge>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Content</h3>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {selectedMemory.content}
                        </p>
                      </div>
                      
                      {selectedMemory.tags.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">Tags</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedMemory.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h3 className="font-medium mb-2">Created</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedMemory.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Select a memory to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Memory"
        description="Are you sure you want to delete this memory? This action cannot be undone."
        onConfirm={confirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      <ConfirmationDialog
        open={clearAllDialogOpen}
        onOpenChange={setClearAllDialogOpen}
        title="Clear All Memories"
        description="Are you sure you want to delete all memories? This action cannot be undone."
        onConfirm={confirmClearAll}
        confirmText="Clear All"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
};
