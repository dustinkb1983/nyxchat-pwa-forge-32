
import React, { useState, useMemo } from "react";
import { useMemory } from "@/contexts/MemoryContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collapse } from "framer-motion";
import { Pin, Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    pinned: true,
    recent: true,
    byProfile: false,
    timeline: false
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [profileFilter, setProfileFilter] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newMem, setNewMem] = useState({
    type: "fact",
    content: "",
    importance: 5,
    tags: "",
    profileId: "",
  });
  const [clearConfirm, setClearConfirm] = useState(false);

  // Filtered and grouped
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

  // Timeline - all, sorted by time
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
      importance:
        (entry.importance || 5) >= 8 ? 5 : 10,
      lastAccessed: new Date(),
    });
  };
  const handleDelete = async (id: string) => {
    await deleteMemory(id);
  };
  const handleAdd = async () => {
    if (!newMem.content?.trim()) return;
    await addMemory({
      ...newMem,
      tags: [
        ...(newMem.tags ? newMem.tags.split(",").map(t => t.trim()) : []),
        newMem.profileId ? `profile:${newMem.profileId}` : "",
      ].filter(Boolean),
    });
    setNewMem({ type: "fact", content: "", importance: 5, tags: "", profileId: "" });
    setAdding(false);
    refreshMemories();
  };
  const handleClearAll = async () => {
    // destructive, needs confirmation
    setClearConfirm(true);
  };

  const confirmClearAll = async () => {
    // delete all memories in filteredMemories
    await Promise.all(filteredMemories.map(m => deleteMemory(m.id)));
    setClearConfirm(false);
    refreshMemories();
  };

  // Collapsible section
  const CollapseSection: React.FC<{ label: string; expandedKey: string; children: React.ReactNode; count?: number; icon?: React.ReactNode }> = ({
    label, expandedKey, children, count, icon
  }) => (
    <div className="border-b last:border-none">
      <button
        className="flex items-center w-full px-2 py-2 hover:bg-muted/40 transition-colors"
        onClick={() => setExpanded(e => ({ ...e, [expandedKey]: !e[expandedKey] }))}
        aria-expanded={expanded[expandedKey]}
      >
        {icon}
        <span className="flex-1 text-left font-medium">{label}</span>
        {count !== undefined && (
          <span className="ml-1 rounded px-1 text-xs bg-muted">{count}</span>
        )}
        {expanded[expandedKey] ? <ChevronUp className="ml-2 w-4 h-4" /> : <ChevronDown className="ml-2 w-4 h-4" />}
      </button>
      <div className="overflow-hidden">
        {expanded[expandedKey] && (
          <div className="animate-fade-in">{children}</div>
        )}
      </div>
    </div>
  );

  // Memory entry card
  const MemoryEntryCard: React.FC<{ entry: typeof memories[0] }> = ({ entry }) => (
    <div className="flex gap-2 items-start py-1 px-2 group hover:bg-muted/30 rounded transition-colors animate-fade-in">
      <div className="flex flex-col items-center pt-2">
        <button
          className={`p-1 rounded hover:bg-muted focus:outline-none`}
          onClick={() => handlePinToggle(entry)}
          title={entry.importance >= 8 ? "Unpin" : "Pin"}
        >
          <Pin className={`w-4 h-4 ${entry.importance >= 8 ? "fill-primary" : "text-muted-foreground"}`} />
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex gap-1 items-center">
          <span className="text-xs uppercase tracking-wide">{memoryTypeMap[entry.type]}</span>
          <span className="mx-2 text-muted-foreground text-xs">· {formatDistanceToNow(entry.createdAt, { addSuffix: true })}</span>
          {entry.tags?.map((t) =>
            t.startsWith("profile:") ?
              <span key={t} className="ml-1 px-1 text-[10px] uppercase bg-muted rounded">{profiles.find(p => p.id === t.slice(8))?.name || "?"}</span> : null
          )}
        </div>
        {editingId === entry.id ? (
          <form onSubmit={e => { e.preventDefault(); handleEditSave(entry); }}>
            <Textarea
              value={editValue}
              className="w-full bg-background border mt-1 text-sm"
              autoFocus
              minRows={2}
              onChange={e => setEditValue(e.target.value)}
            />
            <Button
              type="submit"
              size="sm"
              className="mt-2"
              disabled={!editValue.trim()}
            >Save</Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="mt-2 ml-2"
              onClick={() => setEditingId(null)}
            >Cancel</Button>
          </form>
        ) : (
          <button className="text-left text-sm w-full" onClick={() => handleEdit(entry.id, entry.content)}>
            {entry.content}
          </button>
        )}
        <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
          <span>Source: {entry.tags?.includes("manual") ? "Manual" : "Auto"}</span>
          <span>Last edited: {formatDistanceToNow(entry.lastAccessed, { addSuffix: true })}</span>
        </div>
      </div>
      <button className="p-1 rounded hover:bg-destructive/20 opacity-70 group-hover:opacity-100"
        onClick={() => handleDelete(entry.id)}
        title="Delete memory"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  // --- Modal content ---
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full animate-scale-in">
        <DialogHeader>
          <DialogTitle>Memory Manager</DialogTitle>
          <DialogDescription>
            View, edit, pin, and organize what NyxChat remembers. <span className="hidden md:inline">(Auto and manual notes, all persistent.)</span>
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[65vh] overflow-y-auto transition-all">
          <CollapseSection expandedKey="pinned" label="Pinned" icon={<Pin className="w-4 h-4" />} count={pinned.length}>
            {pinned.length === 0 && <div className="p-2 text-muted-foreground text-sm">No pinned memories yet.</div>}
            {pinned.map(entry => (
              <MemoryEntryCard key={entry.id} entry={entry} />
            ))}
          </CollapseSection>
          <CollapseSection expandedKey="recent" label="Recent" icon={<ChevronDown className="w-4 h-4" />} count={recent.length}>
            {recent.length === 0 && <div className="p-2 text-muted-foreground text-sm">No recent memories.</div>}
            {recent.map(entry => (
              <MemoryEntryCard key={entry.id} entry={entry} />
            ))}
          </CollapseSection>
          <CollapseSection expandedKey="byProfile" label="By Profile" icon={<ChevronDown className="w-4 h-4" />}>
            <div className="flex flex-col gap-2 px-1">
              {Object.entries(byProfileGroups).map(([profileId, entries]) =>
                <div key={profileId} className="mb-2">
                  <div className="font-semibold text-xs mb-1">
                    {profileId === "none" ? "Other" : (profiles.find(p => p.id === profileId)?.name || profileId)}
                  </div>
                  {entries.map(entry => (
                    <MemoryEntryCard key={entry.id} entry={entry} />
                  ))}
                </div>
              )}
            </div>
          </CollapseSection>
          <CollapseSection expandedKey="timeline" label="Memory Timeline" icon={<ChevronDown className="w-4 h-4" />}>
            <div className="flex flex-col gap-1 px-2">
              {timeline.map(entry => (
                <div key={entry.id} className="border-l-2 border-muted pl-3 relative">
                  <span className="absolute left-[-11px] top-2 w-2 h-2 rounded-full bg-muted-foreground" />
                  < span className="text-xs text-muted-foreground">{formatDistanceToNow(entry.createdAt, { addSuffix: true })}</span>
                  <div className="text-sm">{entry.content}</div>
                </div>
              ))}
            </div>
          </CollapseSection>
        </div>
        <DialogFooter className="flex flex-col gap-2 mt-4">
          <div className="flex items-center gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdding(v => !v)}
              leftIcon={<Plus />}
            >New Memory</Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAll}
              disabled={filteredMemories.length === 0}
            >Clear All</Button>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs mr-2">Filter by Profile</span>
              <Select value={profileFilter ?? "all"} onValueChange={v => setProfileFilter(v)}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {profiles.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {adding && (
            <form className="flex flex-col gap-1 p-2 bg-muted rounded" onSubmit={e => { e.preventDefault(); handleAdd(); }}>
              <div className="flex gap-2">
                <Input
                  placeholder="Memory content"
                  value={newMem.content}
                  onChange={e => setNewMem(v => ({ ...v, content: e.target.value }))}
                  className="flex-1"
                />
                <Select value={newMem.type} onValueChange={v => setNewMem(m => ({ ...m, type: v }))}>
                  <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fact">Fact</SelectItem>
                    <SelectItem value="preference">Preference</SelectItem>
                    <SelectItem value="goal">Goal</SelectItem>
                    <SelectItem value="context">Context</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Tags (optional, comma separated)"
                  value={newMem.tags}
                  onChange={e => setNewMem(m => ({ ...m, tags: e.target.value }))}
                  className="w-32"
                />
              </div>
              <div className="flex justify-end gap-2 mt-1">
                <Button variant="secondary" size="sm" type="button" onClick={() => setAdding(false)}>Cancel</Button>
                <Button size="sm" type="submit" disabled={!newMem.content.trim()}>Add</Button>
              </div>
            </form>
          )}
        </DialogFooter>
        {/* Confirm clear */}
        {clearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-background border rounded shadow-xl p-6 flex flex-col gap-2 w-full max-w-xs">
              <span className="font-bold">Clear all memories?</span>
              <span className="text-xs text-muted-foreground">This cannot be undone. All visible memories will be deleted.</span>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="secondary" onClick={() => setClearConfirm(false)}>Cancel</Button>
                <Button size="sm" variant="destructive" onClick={confirmClearAll}>Yes, Clear</Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
