
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  MessageSquare,
  Wrench,
  Brain,
  Settings,
  Plus,
  Trash2,
  User,
  Moon,
  Sun,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useChat } from '@/contexts/ChatContext';
import { useTheme } from '@/contexts/ThemeContext';
import { MemoryManagerModal } from "@/components/memory/MemoryManagerModal";
import { useEffect } from "react";

const staticMenuItems = [
  { title: 'PromptForge', url: '/prompt-forge', icon: Wrench },
  { title: 'Memory', url: '/memory', icon: Brain },
  { title: 'Profiles', url: '/profiles', icon: User },
  { title: 'Settings', url: '/settings', icon: Settings }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { conversations, currentConversation, newConversation, loadConversation, deleteConversation } = useChat();
  const { theme, setTheme } = useTheme();
  const [memoryModalOpen, setMemoryModalOpen] = useState(false);

  // Profile list for modal (loaded from localStorage for now; see ProfileSelector logic)
  const [profiles, setProfiles] = useState<{ id: string, name: string }[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem('ai-profiles');
    if (saved) {
      const parsed = JSON.parse(saved);
      setProfiles(parsed.map((p: any) => ({ id: p.id, name: p.name })));
    }
  }, []);

  const isCollapsed = state === 'collapsed';

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      deleteConversation(id);
    }
  };

  return (
    <>
      <Sidebar className={`bg-sidebar rounded-xl m-2 shadow group/sidebar ${isCollapsed ? 'w-14' : 'w-60'} transition-all duration-300`} collapsible="icon">
        <SidebarTrigger className="m-2 self-end" />
        <SidebarContent>
          <div className="flex flex-col h-full">
            {/* Logo/Header */}
            <div className="p-4 border-b flex items-center gap-2 mb-2 justify-center">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center select-none">
                <span className="font-bold text-primary text-lg">N</span>
              </div>
              {!isCollapsed && <h2 className="font-semibold ml-2">NyxChat</h2>}
            </div>

            {/* New Chat Button */}
            <div className="px-2 mb-4">
              <Button
                onClick={newConversation}
                className="w-full justify-start rounded-md"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                {!isCollapsed && <span className="ml-2">New Chat</span>}
              </Button>
            </div>

            {/* Conversations - Scrollable */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
              <SidebarGroup>
                <SidebarGroupLabel>Conversations</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {conversations.map((conversation) => (
                      <SidebarMenuItem key={conversation.id}>
                        <SidebarMenuButton asChild>
                          <button
                            onClick={() => loadConversation(conversation.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors w-full text-left group/item ${
                              currentConversation?.id === conversation.id
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-accent hover:text-accent-foreground'
                            }`}
                          >
                            <MessageSquare className="h-4 w-4 flex-shrink-0" />
                            {!isCollapsed && (
                              <>
                                <span className="truncate flex-1">{conversation.title}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                  onClick={(e) => handleDeleteConversation(e, conversation.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </div>

            {/* Static menu anchored at bottom */}
            <div className="border-t pt-2 px-2 pb-2 bg-background/70">
              <SidebarMenu>
                {staticMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      {item.title !== "Memory" ? (
                        <NavLink
                          to={item.url}
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-accent hover:text-accent-foreground'
                            }`
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </NavLink>
                      ) : (
                        <button
                          type="button"
                          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground w-full ${memoryModalOpen ? 'bg-primary text-primary-foreground' : ''}`}
                          onClick={() => setMemoryModalOpen(true)}
                        >
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </button>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground w-full"
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      {!isCollapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
      <MemoryManagerModal
        open={memoryModalOpen}
        onOpenChange={setMemoryModalOpen}
        profiles={profiles}
      />
    </>
  );
}
