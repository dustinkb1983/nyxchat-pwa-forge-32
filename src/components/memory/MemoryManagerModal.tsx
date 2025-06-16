import React, { useState, useMemo } from "react";
import { useMemory } from "@/contexts/MemoryContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Pin, Trash2, Plus, ChevronDown, Brain, BarChart3, History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type MemoryEntry } from "@/lib/indexedDB";
import { MemoryVisualization } from "./MemoryVisualization";
import { MemoryInsights } from "./MemoryInsights";
import { motion, AnimatePresence } from "framer-motion";

interface MemoryManagerModalProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  profiles: { id: string; name: string }[];
}

const memoryTypeMap: Record<string, string> = {
  fact: "Fact",
  preference: "Preference",
  goal: "Goal",
  context: "Context",
};

export const MemoryManagerModal: React.FC<MemoryManagerModalProps> = ({
  open,
  onOpenChange,
  profiles,
}) => {
  const { memories, addMemory, updateMemory, deleteMemory, refreshMemories } = useMemory();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [profileFilter, setProfileFilter] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'organize' | 'insights' | 'timeline'>(
    'organize'
  );
  const [newMem, setNewMem] = useState<{
    type: MemoryEntry['type'];
    content: string;
    importance: number;
    tags: string;
    profileId: string;
  }>({
    type: "fact",
    content: "",
    importance: 5,
    tags: "",
    profileId: "",
  });
  const [clearConfirm, setClearConfirm] = useState(false);

  const filteredMemories = useMemo(() => {
    let data = memories;
    if (profileFilter && profileFilter !== "all") {
      data = data.filter(m => m.tags?.includes(`profile:${profileFilter}`));
    }
    return data;
  }, [memories, profileFilter]);

  const pinned = filteredMemories.filter(m => (m.importance ?? 5) >= 8);
  const recent = filteredMemories
    .filter(m => m.importance < 8)
    .sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime())
    .slice(0, 14);

  const byProfileGroups = useMemo(() => {
    const groups: Record<string, typeof memories> = {};
    filteredMemories.forEach(m => {
      const prof = (m.tags || []).find(t => t.startsWith("profile:"))?.slice(8) || "none";
      if (!groups[prof]) groups[prof] = [];
      groups[prof].push(m);
    });
    return groups;
  }, [filteredMemories]);

  const timeline = [...filteredMemories].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const handleEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditValue(content);
  };
  
  const handleEditSave = async (entry: typeof memories[0]) => {
    await updateMemory(entry.id, { content: editValue.trim() });
    setEditingId(null);
    setEditValue("");
  };
  
  const handlePinToggle = async (entry: typeof memories[0]) => {
    await updateMemory(entry.id, {
      importance: (entry.importance || 5) >= 8 ? 5 : 10,
      lastAccessed: new Date(),
    });
  };
  
  const handleDelete = async (id: string) => {
    await deleteMemory(id);
  };
  
  const handleAdd = async () => {
    if (!newMem.content?.trim()) return;
    const memoryToAdd: Omit<MemoryEntry, 'id' | 'createdAt' | 'lastAccessed'> = {
        content: newMem.content,
        type: newMem.type,
        importance: newMem.importance,
        tags: [
            ...(newMem.tags ? newMem.tags.split(",").map(t => t.trim()) : []),
            newMem.profileId ? `profile:${newMem.profileId}` : "",
        ].filter(Boolean),
    };
    await addMemory(memoryToAdd);
    setNewMem({ type: "fact", content: "", importance: 5, tags: "", profileId: "" });
    setAdding(false);
    refreshMemories();
  };
  
  const handleClearAll = async () => {
    setClearConfirm(true);
  };

  const confirmClearAll = async () => {
    await Promise.all(filteredMemories.map(m => deleteMemory(m.id)));
    setClearConfirm(false);
    refreshMemories();
  };

  const handleSelectMemory = (memory: MemoryEntry) => {
    setActiveTab('organize');
    // Scroll to memory or highlight it
  };

  const MemoryEntryCard: React.FC<{ entry: typeof memories[0] }> = ({ entry }) => (
    <motion.div 
      className="flex gap-2 items-start py-2 px-3 group hover:bg-muted/30 rounded-lg transition-all duration-200 border border-transparent hover:border-primary/20"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 2 }}
    >
      <div className="flex flex-col items-center pt-2">
        <button
          className={`p-1.5 rounded-full hover:bg-muted focus:outline-none transition-colors ${
            entry.importance >= 8 ? 'bg-primary/20' : ''
          }`}
          onClick={() => handlePinToggle(entry)}
          title={entry.importance >= 8 ? "Unpin" : "Pin"}
        >
          <Pin className={`w-4 h-4 transition-colors ${
            entry.importance >= 8 ? "fill-primary text-primary" : "text-muted-foreground"
          }`} />
        </button>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex gap-2 items-center mb-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            entry.type === 'fact' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
            entry.type === 'preference' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
            entry.type === 'goal' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
            'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
          }`}>
            {memoryTypeMap[entry.type]}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(entry.createdAt, { addSuffix: true })}
          </span>
          {entry.tags?.map((t) =>
            t.startsWith("profile:") ?
              <span key={t} className="px-1.5 py-0.5 text-[10px] font-medium bg-muted rounded-full">
                {profiles.find(p => p.id === t.slice(8))?.name || "?"}
              </span> : null
          )}
        </div>
        
        {editingId === entry.id ? (
          <form onSubmit={e => { e.preventDefault(); handleEditSave(entry); }} className="space-y-2">
            <Textarea
              value={editValue}
              className="w-full bg-background border text-sm"
              autoFocus
              rows={2}
              onChange={e => setEditValue(e.target.value)}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={!editValue.trim()}>
                Save
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setEditingId(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <button 
            className="text-left text-sm w-full p-2 rounded hover:bg-muted/20 transition-colors" 
            onClick={() => handleEdit(entry.id, entry.content)}
          >
            {entry.content}
          </button>
        )}
        
        <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
          <span>Source: {entry.tags?.includes("auto-extracted") ? "Auto" : "Manual"}</span>
          <span>Importance: {entry.importance}/10</span>
          <span>Last accessed: {formatDistanceToNow(entry.lastAccessed, { addSuffix: true })}</span>
        </div>
      </div>
      
      <button 
        className="p-1.5 rounded-full hover:bg-destructive/20 opacity-70 group-hover:opacity-100 transition-all"
        onClick={() => handleDelete(entry.id)}
        title="Delete memory"
      >
        <Trash2 className="w-4 h-4 text-destructive" />
      </button>
    </motion.div>
  );

  const tabs = [
    { id: 'organize', label: 'Organize', icon: Brain },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'timeline', label: 'Timeline', icon: History },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-destructive max-w-4xl w-full max-h-[90vh] flex flex-col">
        <DialogHeader className="modal-header">
          <DialogTitle className="modal-title flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Memory Palace
          </DialogTitle>
          <DialogDescription className="modal-description">
            Your AI's persistent memory system — view, edit, and organize what it remembers about you.
          </DialogDescription>
        </DialogHeader>

        <div className="modal-body flex-1 overflow-hidden space-y-4">
          <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === 'organize' && (
                <motion.div
                  key="organize"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full overflow-y-auto space-y-4"
                >
                  <Collapsible defaultOpen className="border rounded-lg">
                    <CollapsibleTrigger className="flex items-center w-full px-4 py-3 text-sm font-medium hover:bg-muted/50 group">
                        <Pin className="h-4 w-4 mr-2 text-primary" />
                        <span className="flex-1 text-left">Pinned Memories</span>
                        <span className="ml-auto mr-2 rounded-md bg-primary/20 px-2 py-0.5 text-xs">
                            {pinned.length}
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4">
                        {pinned.length === 0 ? (
                          <div className="p-4 text-muted-foreground text-sm text-center">
                            No pinned memories yet. Pin important memories to keep them easily accessible.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {pinned.map(entry => (
                              <MemoryEntryCard key={entry.id} entry={entry} />
                            ))}
                          </div>
                        )}
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible defaultOpen className="border rounded-lg">
                    <CollapsibleTrigger className="flex items-center w-full px-4 py-3 text-sm font-medium hover:bg-muted/50 group">
                        <ChevronDown className="h-4 w-4 mr-2" />
                        <span className="flex-1 text-left">Recent Memories</span>
                        <span className="ml-auto mr-2 rounded-md bg-muted px-2 py-0.5 text-xs">
                            {recent.length}
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4">
                        {recent.length === 0 ? (
                          <div className="p-4 text-muted-foreground text-sm text-center">
                            No recent memories found.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {recent.map(entry => (
                              <MemoryEntryCard key={entry.id} entry={entry} />
                            ))}
                          </div>
                        )}
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible className="border rounded-lg">
                    <CollapsibleTrigger className="flex items-center w-full px-4 py-3 text-sm font-medium hover:bg-muted/50 group">
                        <ChevronDown className="h-4 w-4 mr-2" />
                        <span className="flex-1 text-left">By Profile</span>
                        <ChevronDown className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4">
                      <div className="space-y-4">
                        {Object.entries(byProfileGroups).map(([profileId, entries]) =>
                          <div key={profileId} className="space-y-2">
                            <div className="font-semibold text-sm text-muted-foreground border-b pb-1">
                              {profileId === "none" ? "General" : (profiles.find(p => p.id === profileId)?.name || profileId)}
                            </div>
                            <div className="space-y-2">
                              {entries.map(entry => (
                                <MemoryEntryCard key={entry.id} entry={entry} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </motion.div>
              )}

              {activeTab === 'insights' && (
                <motion.div
                  key="insights"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full overflow-y-auto space-y-6 p-4"
                >
                  <MemoryInsights memories={filteredMemories} />
                  <MemoryVisualization memories={filteredMemories} onSelectMemory={handleSelectMemory} />
                </motion.div>
              )}

              {activeTab === 'timeline' && (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full overflow-y-auto p-4"
                >
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium">Memory Timeline</h4>
                    <div className="space-y-4">
                      {timeline.map((entry, index) => (
                        <motion.div 
                          key={entry.id} 
                          className="border-l-2 border-primary/30 pl-4 relative"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <span className="absolute left-[-9px] top-3 w-4 h-4 rounded-full bg-primary/30 border-2 border-background" />
                          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-medium">{formatDistanceToNow(entry.createdAt, { addSuffix: true })}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                entry.type === 'fact' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                entry.type === 'preference' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                entry.type === 'goal' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                              }`}>
                                {memoryTypeMap[entry.type]}
                              </span>
                            </div>
                            <div className="text-sm">{entry.content}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <DialogFooter className="modal-footer flex flex-col gap-3">
          <div className="flex items-center gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdding(v => !v)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Memory
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAll}
              disabled={filteredMemories.length === 0}
            >
              Clear All
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Filter:</span>
              <Select value={profileFilter ?? "all"} onValueChange={v => setProfileFilter(v === "all" ? null : v)}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Profiles</SelectItem>
                  {profiles.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <AnimatePresence>
            {adding && (
              <motion.form 
                className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg border" 
                onSubmit={e => { e.preventDefault(); handleAdd(); }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex gap-2">
                  <Input
                    placeholder="What should I remember?"
                    value={newMem.content}
                    onChange={e => setNewMem(v => ({ ...v, content: e.target.value }))}
                    className="flex-1"
                  />
                  <Select value={newMem.type} onValueChange={v => setNewMem(m => ({ ...m, type: v as MemoryEntry['type'] }))}>
                    <SelectTrigger className="w-28 h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fact">Fact</SelectItem>
                      <SelectItem value="preference">Preference</SelectItem>
                      <SelectItem value="goal">Goal</SelectItem>
                      <SelectItem value="context">Context</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Tags (comma separated)"
                    value={newMem.tags}
                    onChange={e => setNewMem(m => ({ ...m, tags: e.target.value }))}
                    className="flex-1"
                  />
                  <Select value={newMem.profileId} onValueChange={v => setNewMem(m => ({ ...m, profileId: v }))}>
                    <SelectTrigger className="w-32 h-9 text-xs">
                      <SelectValue placeholder="Profile" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">General</SelectItem>
                      {profiles.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" type="button" onClick={() => setAdding(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" disabled={!newMem.content.trim()}>
                    Save Memory
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </DialogFooter>
        
        {clearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div 
              className="modal-destructive w-full max-w-sm mx-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-center">
                <h3 className="font-bold text-lg">Clear All Memories?</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  This will permanently delete all visible memories. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1" onClick={() => setClearConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" className="flex-1" onClick={confirmClearAll}>
                  Delete All
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
