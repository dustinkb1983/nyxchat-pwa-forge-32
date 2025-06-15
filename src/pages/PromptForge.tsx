
import React from 'react';
import { Download, Plus, Wrench, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Template select and local state mocks
const templates = [
  { value: '', label: 'Select Template...' },
  { value: 'creative_writer', label: 'Creative Writer' },
  { value: 'therapist', label: 'Therapist' }
];

const filterTags = [
  { label: 'All', value: 'all' },
  { label: 'Writing', value: 'writing' },
  { label: 'Coding', value: 'coding' },
  { label: 'Analysis', value: 'analysis' },
  { label: 'Creative', value: 'creative' },
  { label: 'Business', value: 'business' }
];

const PromptForge: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [activeTag, setActiveTag] = React.useState('all');
  const [prompt, setPrompt] = React.useState('');
  // Mock prompt cards
  const prompts = [];

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center justify-between py-4 px-5 bg-background rounded-t-xl shadow-sm border-b z-10">
        <div className="flex items-center gap-2">
          <Wrench className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">PromptForge</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" aria-label="Download/Export" className="rounded-md">
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-2 md:px-6 py-6 rounded-b-xl bg-card shadow">
        {/* Prompt Generator Section */}
        <section className="mb-6 rounded-lg bg-background p-5 shadow">
          <div className="mb-2 flex items-center gap-4">
            <h2 className="font-semibold text-lg">Prompt Generator</h2>
            <select
              className="rounded-md border px-2 py-1 ml-2"
              value={selectedTemplate}
              onChange={e => setSelectedTemplate(e.target.value)}
            >
              {templates.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <textarea
              className="rounded-md border p-2 flex-1 min-h-[80px]"
              placeholder="Generated prompt will appear here..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
            <Button className="rounded-md mt-2 md:mt-0 md:ml-2 flex-shrink-0" disabled>
              <Plus className="h-4 w-4 mr-2" />
              Save to PromptForge
            </Button>
          </div>
        </section>

        {/* New Prompt Section */}
        <section className="mb-4">
          <Button className="rounded-md">
            <Plus className="h-4 w-4 mr-2" />
            New Prompt
          </Button>
        </section>

        {/* Controls Section */}
        <section className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex items-center">
            <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <input
              className="rounded-md border p-2 pl-8 min-w-[180px]"
              placeholder="Search prompts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              type="text"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filterTags.map(tag => (
              <Button
                key={tag.value}
                onClick={() => setActiveTag(tag.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium border ${activeTag === tag.value ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}`}
                variant="outline"
              >
                {tag.label}
              </Button>
            ))}
          </div>
        </section>

        {/* Prompts Section */}
        <section>
          <h2 className="font-semibold mb-2">Your Prompts</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Prompt cards go here when available */}
            {prompts.length === 0 && (
              <div className="text-muted-foreground text-center col-span-full">
                No prompts yet.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PromptForge;
