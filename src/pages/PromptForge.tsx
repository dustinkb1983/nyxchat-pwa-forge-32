
import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, SortAsc, Copy, Edit, Trash, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ProfileSelector } from '@/components/promptforge/ProfileSelector';
import { PromptCard } from '@/components/promptforge/PromptCard';
import { dbManager, PromptTemplate } from '@/lib/indexedDB';

const TEMPLATES = [
  { value: 'none', label: 'No Template' },
  { value: 'writer', label: 'Creative Writer' },
  { value: 'therapist', label: 'Therapist' },
  { value: 'coding', label: 'Coding Assistant' },
  { value: 'business', label: 'Business Analyst' },
];

const CREATIVITY_LEVELS = [
  { value: 'conservative', label: 'Conservative' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'creative', label: 'Creative' },
];

const FOCUS_OPTIONS = [
  { value: 'clarity', label: 'Clarity' },
  { value: 'detail', label: 'Detail' },
  { value: 'structure', label: 'Structure' },
];

const TAGS = ['All', 'Writing', 'Coding', 'Analysis', 'Creative', 'Business'];

const PromptForge = () => {
  const [profile, setProfile] = useState('default');
  const [basePrompt, setBasePrompt] = useState('');
  const [template, setTemplate] = useState('none');
  const [creativity, setCreativity] = useState('balanced');
  const [focus, setFocus] = useState('clarity');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [savedPrompts, setSavedPrompts] = useState<PromptTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      const prompts = await dbManager.getPrompts();
      setSavedPrompts(prompts);
    } catch (error) {
      console.error('Failed to load prompts:', error);
    }
  };

  const generatePrompt = async () => {
    if (!basePrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a base prompt first.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI prompt generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let enhancedPrompt = basePrompt;
      
      if (template !== 'none') {
        const templateLabel = TEMPLATES.find(t => t.value === template)?.label;
        enhancedPrompt = `As a ${templateLabel}, ${enhancedPrompt}`;
      }
      
      if (creativity === 'creative') {
        enhancedPrompt += ' Be innovative and think outside the box.';
      } else if (creativity === 'conservative') {
        enhancedPrompt += ' Provide well-established and proven approaches.';
      }
      
      if (focus === 'detail') {
        enhancedPrompt += ' Include comprehensive details and examples.';
      } else if (focus === 'structure') {
        enhancedPrompt += ' Organize your response with clear structure and headings.';
      } else {
        enhancedPrompt += ' Provide a clear and concise response.';
      }
      
      setGeneratedPrompt(enhancedPrompt);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate prompt.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const savePrompt = async () => {
    if (!generatedPrompt.trim()) {
      toast({
        title: 'Error',
        description: 'No prompt to save.',
        variant: 'destructive',
      });
      return;
    }

    const promptToSave: PromptTemplate = {
      id: crypto.randomUUID(),
      name: basePrompt.substring(0, 50) + (basePrompt.length > 50 ? '...' : ''),
      content: generatedPrompt,
      tags: [template !== 'none' ? template : 'general'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await dbManager.savePrompt(promptToSave);
      await loadPrompts();
      toast({
        title: 'Success',
        description: 'Prompt saved to library!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save prompt.',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Success',
        description: 'Copied to clipboard!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const filteredAndSortedPrompts = () => {
    let filtered = savedPrompts.filter(prompt => {
      const matchesSearch = searchQuery === '' || 
        prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTag = selectedTag === 'All' || 
        prompt.tags?.some(tag => tag.toLowerCase() === selectedTag.toLowerCase());
      
      return matchesSearch && matchesTag;
    });

    // Sort prompts
    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
    }

    return filtered.map(p => ({
      id: p.id,
      title: p.name,
      content: p.content,
      tags: p.tags || [],
      usage: 0, // We'll implement usage tracking later
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  };

  const handleEdit = (id: string) => {
    const prompt = savedPrompts.find(p => p.id === id);
    if (prompt) {
      setEditingPrompt(prompt);
      setBasePrompt(prompt.content);
      setGeneratedPrompt(prompt.content);
    }
  };

  const handleCopy = (id: string) => {
    const promptData = filteredAndSortedPrompts().find(p => p.id === id);
    if (promptData) {
      copyToClipboard(promptData.content);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      try {
        await dbManager.deletePrompt(id);
        await loadPrompts();
        toast({
          title: 'Success',
          description: 'Prompt deleted successfully.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete prompt.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-2xl font-bold">PromptForge</h1>
        <ProfileSelector value={profile} onChange={setProfile} />
      </header>

      <div className="flex-1 overflow-hidden p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
          {/* Left Panel - AI Prompt Generator */}
          <div className="space-y-6">
            <Card className="p-6 bg-card">
              <h2 className="text-xl font-semibold mb-4">AI Prompt Generator</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Base Prompt</label>
                  <Textarea
                    placeholder="Enter your base idea or prompt..."
                    value={basePrompt}
                    onChange={(e) => setBasePrompt(e.target.value)}
                    rows={4}
                    className="bg-background"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Template</label>
                    <select
                      value={template}
                      onChange={(e) => setTemplate(e.target.value)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      {TEMPLATES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Creativity</label>
                    <select
                      value={creativity}
                      onChange={(e) => setCreativity(e.target.value)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      {CREATIVITY_LEVELS.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Focus</label>
                    <select
                      value={focus}
                      onChange={(e) => setFocus(e.target.value)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      {FOCUS_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  onClick={generatePrompt}
                  disabled={isGenerating || !basePrompt.trim()}
                  className="w-full"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate Enhanced Prompt'}
                </Button>
              </div>
            </Card>

            {/* Generated Prompt */}
            {generatedPrompt && (
              <Card className="p-6 bg-card">
                <h3 className="text-lg font-semibold mb-3">Enhanced Prompt</h3>
                <div className="bg-muted/50 p-4 rounded-md mb-4">
                  <p className="text-sm whitespace-pre-wrap">{generatedPrompt}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => copyToClipboard(generatedPrompt)} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={savePrompt}>
                    <Plus className="h-4 w-4 mr-2" />
                    Save to Library
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Right Panel - Prompt Library */}
          <div className="space-y-6">
            <Card className="p-6 bg-card">
              <h2 className="text-xl font-semibold mb-4">Prompt Library</h2>
              
              {/* Search and Filters */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search prompts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {TAGS.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTag(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <SortAsc className="h-4 w-4" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-md border bg-background px-3 py-1 text-sm"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Prompt Cards */}
            <div className="space-y-4 overflow-y-auto">
              {filteredAndSortedPrompts().map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onEdit={handleEdit}
                  onCopy={handleCopy}
                  onDelete={handleDelete}
                />
              ))}
              
              {filteredAndSortedPrompts().length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No prompts found. Generate and save your first prompt!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptForge;
