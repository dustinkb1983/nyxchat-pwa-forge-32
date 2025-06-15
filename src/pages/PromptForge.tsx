
import React from 'react';
import { Download, Plus, Wrench, Edit, Copy, Trash, Search, List, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ProfileSelector } from '@/components/promptforge/ProfileSelector';
import { PromptCard } from '@/components/promptforge/PromptCard';
import { dbManager } from '@/lib/indexedDB';

const templates = [
  { value: '', label: 'No Template' },
  { value: 'creative_writer', label: 'Creative Writer' },
  { value: 'therapist', label: 'Therapist' },
  { value: 'coder', label: 'Coding Assistant' },
  { value: 'business', label: 'Business Analyst' }
];

const creativityOptions = [
  { value: 'conservative', label: 'Conservative' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'creative', label: 'Creative' }
];

const focusOptions = [
  { value: 'clarity', label: 'Clarity' },
  { value: 'detail', label: 'Detail' },
  { value: 'structure', label: 'Structure' }
];

const filterTags = [
  { label: 'All', value: 'all' },
  { label: 'Writing', value: 'writing' },
  { label: 'Coding', value: 'coding' },
  { label: 'Analysis', value: 'analysis' },
  { label: 'Creative', value: 'creative' },
  { label: 'Business', value: 'business' }
];

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'alpha', label: 'A-Z' },
  { value: 'used', label: 'Most Used' }
];

// Helper to generate fake "enhanced prompts" (simulate AI for now)
function generatePrompt({basePrompt, template, creativity, focus}: {
  basePrompt: string, template: string, creativity: string, focus: string
}) {
  let prefix = '';
  if (template === 'creative_writer') prefix = 'As a creative writer, ';
  if (template === 'therapist') prefix = 'As a thoughtful therapist, ';
  if (template === 'coder') prefix = 'As a coding assistant, ';
  if (template === 'business') prefix = 'As a business analyst, ';
  let creativityDesc = '';
  if (creativity === 'conservative') creativityDesc = 'Be concise and literal. ';
  if (creativity === 'balanced') creativityDesc = 'Be clear and moderately creative. ';
  if (creativity === 'creative') creativityDesc = 'Be as imaginative and open-ended as possible. ';
  let focusDesc = '';
  if (focus === 'clarity') focusDesc = 'Focus on clarity. ';
  if (focus === 'detail') focusDesc = 'Add detailed explanations. ';
  if (focus === 'structure') focusDesc = 'Organize answers in a well-structured manner. ';
  return `${prefix}${creativityDesc}${focusDesc}${basePrompt}`;
}

function getPromptTitle(basePrompt: string, template: string) {
  if (!basePrompt) return '';
  if (template && template !== '') return `[${templates.find(t=>t.value===template)?.label}] ${basePrompt.slice(0, 28)}`;
  return basePrompt.slice(0, 32);
}

type PromptType = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  profile: string;
  usage: number;
  createdAt: string;
  updatedAt: string;
};

export default function PromptForge() {
  // Generator state
  const [profile, setProfile] = React.useState('default');
  const [selectedTemplate, setSelectedTemplate] = React.useState('');
  const [creativity, setCreativity] = React.useState('balanced');
  const [focus, setFocus] = React.useState('clarity');
  const [basePrompt, setBasePrompt] = React.useState('');
  const [enhancedPrompt, setEnhancedPrompt] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);

  // Library state
  const [prompts, setPrompts] = React.useState<PromptType[]>([]);
  const [search, setSearch] = React.useState('');
  const [activeTag, setActiveTag] = React.useState('all');
  const [sortOrder, setSortOrder] = React.useState('newest');
  const [gridView, setGridView] = React.useState(true);

  // Editing state
  const [editingPromptId, setEditingPromptId] = React.useState<string | null>(null);

  // Fetch prompts on mount/profile change
  React.useEffect(() => {
    dbManager.getPrompts().then((allPrompts) => {
      setPrompts(
        allPrompts
          .filter((p: PromptType) => (profile === 'default' ? true : p.profile === profile))
          .map((p: PromptType) => ({ ...p }))
      );
    });
  }, [profile]);

  // Helpers for prompt handling
  const handleGenerate = () => {
    if (!basePrompt.trim()) {
      toast({ title: "Base prompt required", description: "Type your base idea or question." });
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setEnhancedPrompt(
        generatePrompt({ basePrompt, template: selectedTemplate, creativity, focus })
      );
      setIsGenerating(false);
    }, 350);
  };

  const handleSave = async () => {
    if (!enhancedPrompt) return;
    const now = new Date();
    const newPrompt: PromptType = {
      id: Math.random().toString(36).slice(2, 12),
      title: getPromptTitle(basePrompt, selectedTemplate),
      content: enhancedPrompt,
      tags: [templates.find(t=>t.value===selectedTemplate)?.label || 'Freeform', creativityOptions.find(c=>c.value===creativity)?.label || '', focusOptions.find(f=>f.value===focus)?.label || ''],
      profile: profile,
      usage: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    await dbManager.savePrompt(newPrompt);
    setPrompts((prompts) => [newPrompt, ...prompts]);
    toast({ title: "Prompt saved!", description: "Added to your PromptForge library." });
  };

  const handleCopy = async () => {
    if (!enhancedPrompt) return;
    await navigator.clipboard.writeText(enhancedPrompt);
    toast({ title: "Copied!", description: "Prompt copied to clipboard." });
  };

  // Library actions
  const handleCardCopy = async (id: string) => {
    const prompt = prompts.find((p) => p.id === id);
    if (prompt) {
      await navigator.clipboard.writeText(prompt.content);
      toast({ title: "Copied to clipboard", description: "Prompt content copied." });
      // update usage count
      handlePromptUsed(id);
    }
  };

  const handleCardEdit = (id: string) => {
    setEditingPromptId(id);
    const prompt = prompts.find((p) => p.id === id);
    if (prompt) {
      setBasePrompt(prompt.title.replace(/^\[.*?\] /, ''));
      setEnhancedPrompt(prompt.content);
      setSelectedTemplate('');
    }
  };

  const handleCardDelete = async (id: string) => {
    if (!window.confirm('Delete this prompt?')) return;
    await dbManager.deletePrompt(id);
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Prompt deleted", description: "Removed from your library." });
  };

  // Update usage stats
  const handlePromptUsed = async (id: string) => {
    const prompt = prompts.find((p) => p.id === id);
    if (!prompt) return;
    const updatedPrompt = { ...prompt, usage: (prompt.usage || 0) + 1, updatedAt: new Date().toISOString() };
    await dbManager.savePrompt(updatedPrompt);
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? updatedPrompt : p))
    );
  };

  // Filtering, searching, sorting
  const filteredPrompts = prompts
    .filter((p) =>
      activeTag === 'all' ? true : p.tags.some(t => t.toLowerCase().includes(activeTag))
    )
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });

  const sortedPrompts = filteredPrompts.sort((a, b) => {
    if (sortOrder === 'newest') return b.createdAt.localeCompare(a.createdAt);
    if (sortOrder === 'oldest') return a.createdAt.localeCompare(b.createdAt);
    if (sortOrder === 'used') return (b.usage || 0) - (a.usage || 0);
    if (sortOrder === 'alpha') return a.title.localeCompare(b.title);
    return 0;
  });

  // ----------- UI -------------
  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <header className="flex items-center justify-between py-4 px-5 bg-card rounded-t-xl shadow border-b z-10">
        <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">PromptForge</h1>
          </div>
          <div className="ml-auto flex gap-4">
            <ProfileSelector value={profile} onChange={setProfile} />
            <Button size="icon" variant="ghost" aria-label="Download/Export" className="rounded-md">
              <Download className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-2 md:px-6 py-6 rounded-b-xl bg-background shadow-inner">
        {/* --- AI Prompt Generator --- */}
        <section className="mb-6 rounded-xl bg-card shadow-lg p-6 border">
          <div className="mb-4 flex flex-col md:flex-row md:items-end gap-6">
            <div className="flex-1">
              <label className="block font-medium mb-1" htmlFor="basePrompt">
                Base Prompt
              </label>
              <textarea
                id="basePrompt"
                className="rounded-lg border p-3 min-h-[68px] w-full bg-background text-foreground"
                placeholder="Start by typing any idea, question, or prompt here..."
                value={basePrompt}
                onChange={e => setBasePrompt(e.target.value)}
                disabled={isGenerating}
                maxLength={220}
              />
            </div>
            <div className="flex flex-col gap-2 min-w-[210px]">
              <div>
                <label className="font-medium text-xs">Template</label>
                <select
                  value={selectedTemplate}
                  onChange={e => setSelectedTemplate(e.target.value)}
                  className="rounded-lg border bg-background p-1.5 mt-1 w-full"
                >
                  {templates.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                </select>
              </div>
              <div>
                <label className="font-medium text-xs">Creativity</label>
                <select
                  value={creativity}
                  onChange={e => setCreativity(e.target.value)}
                  className="rounded-lg border bg-background p-1.5 mt-1 w-full"
                >
                  {creativityOptions.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
                </select>
              </div>
              <div>
                <label className="font-medium text-xs">Focus</label>
                <select
                  value={focus}
                  onChange={e => setFocus(e.target.value)}
                  className="rounded-lg border bg-background p-1.5 mt-1 w-full"
                >
                  {focusOptions.map((f) => (<option key={f.value} value={f.value}>{f.label}</option>))}
                </select>
              </div>
              <Button onClick={handleGenerate} className="rounded-lg mt-2 w-full" disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate Enhanced Prompt"}
              </Button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-3 mt-2">
            <textarea
              className="rounded-lg border p-3 flex-1 min-h-[68px] bg-background text-foreground"
              placeholder="Generated enhanced prompt will appear here..."
              value={enhancedPrompt}
              readOnly
            />
            <div className="flex-shrink-0 flex flex-col gap-2 mt-2 md:mt-0 md:ml-2">
              <Button className="rounded-lg" onClick={handleSave} disabled={!enhancedPrompt}>
                <Plus className="h-4 w-4 mr-2" />
                Save to Library
              </Button>
              <Button className="rounded-lg" variant="outline" onClick={handleCopy} disabled={!enhancedPrompt}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>
        </section>

        {/* --- Prompt Library Manager --- */}
        <section className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex items-center w-[240px]">
            <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <input
              className="rounded-lg border p-2 pl-8 min-w-[180px] w-full bg-background text-foreground"
              placeholder="Search prompts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              type="text"
            />
          </div>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            className="rounded-lg border bg-background p-2 font-medium"
          >
            {sortOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <Button
            size="icon"
            className={`rounded-full ${gridView ? 'bg-accent text-accent-foreground' : ''}`}
            variant="outline"
            onClick={() => setGridView(true)}
            aria-label="Grid view"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            className={`rounded-full ${!gridView ? 'bg-accent text-accent-foreground' : ''}`}
            variant="outline"
            onClick={() => setGridView(false)}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
          <div className="flex flex-wrap gap-2 ml-auto">
            {filterTags.map(tag => (
              <Button
                key={tag.value}
                onClick={() => setActiveTag(tag.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors duration-200 ${
                  activeTag === tag.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card hover:bg-accent hover:text-accent-foreground'
                }`}
                variant="outline"
              >
                {tag.label}
              </Button>
            ))}
          </div>
        </section>

        {/* Prompt cards */}
        <section>
          <h2 className="font-semibold mb-2">Your Prompts</h2>
          <div className={
            gridView
              ? "grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-3"
          }>
            {sortedPrompts.length === 0 && (
              <div className="text-muted-foreground text-center col-span-full bg-card py-12 rounded-xl shadow border">
                No prompts yet.
              </div>
            )}
            {sortedPrompts.map(prompt => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onEdit={handleCardEdit}
                onCopy={handleCardCopy}
                onDelete={handleCardDelete}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
