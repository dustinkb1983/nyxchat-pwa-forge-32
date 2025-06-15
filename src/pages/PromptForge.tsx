
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Plus, Save, Search, Hammer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

const PromptForge = () => {
  const navigate = useNavigate();
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const templates = [
    { value: 'creative_writer', label: 'Creative Writer' },
    { value: 'therapist', label: 'Therapist' },
    { value: 'code_reviewer', label: 'Code Reviewer' },
    { value: 'business_analyst', label: 'Business Analyst' },
  ];

  const filterTags = [
    { value: 'all', label: 'All' },
    { value: 'writing', label: 'Writing' },
    { value: 'coding', label: 'Coding' },
    { value: 'analysis', label: 'Analysis' },
    { value: 'creative', label: 'Creative' },
    { value: 'business', label: 'Business' },
  ];

  const handleTemplateSelect = (templateValue: string) => {
    const templatePrompts = {
      creative_writer: "You are a creative writing assistant. Help users craft compelling stories, develop characters, and improve their writing style. Be encouraging and provide specific, actionable feedback.",
      therapist: "You are a supportive and empathetic listener. Provide thoughtful responses that help users explore their feelings and thoughts. Always maintain boundaries and suggest professional help when appropriate.",
      code_reviewer: "You are an experienced software engineer. Review code for best practices, security issues, and performance optimizations. Provide clear explanations and suggest improvements.",
      business_analyst: "You are a business analyst who helps users understand market trends, analyze data, and make strategic decisions. Provide data-driven insights and practical recommendations."
    };
    
    setGeneratedPrompt(templatePrompts[templateValue as keyof typeof templatePrompts] || '');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Hammer className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold">PromptForge</h1>
          </div>
        </div>
        
        <Button variant="ghost" size="sm">
          <Download className="h-4 w-4" />
        </Button>
      </motion.div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Prompt Generator Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Prompt Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Select onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.value} value={template.value}>
                          {template.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-3">
                <Textarea
                  value={generatedPrompt}
                  onChange={(e) => setGeneratedPrompt(e.target.value)}
                  placeholder="Generated prompt will appear here..."
                  className="min-h-32 resize-none"
                />
                <Button 
                  disabled={!generatedPrompt.trim()}
                  className="w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save to PromptForge
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* New Prompt Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Button variant="outline" className="w-full h-16 text-lg">
            <Plus className="h-5 w-5 mr-2" />
            New Prompt
          </Button>
        </motion.section>

        {/* Search & Filter Controls */}
        <motion.section
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts..."
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filterTags.map((tag) => (
              <Button
                key={tag.value}
                variant={activeFilter === tag.value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(tag.value)}
              >
                {tag.label}
              </Button>
            ))}
          </div>
        </motion.section>

        {/* Prompts Section */}
        <motion.section
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold">Your Prompts</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Placeholder for prompt cards */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base">Sample Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This is a sample prompt card. Your saved prompts will appear here.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default PromptForge;
