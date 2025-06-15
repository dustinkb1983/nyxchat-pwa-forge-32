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
  Download
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
  useSidebar,
  SidebarInput,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useChat, type Conversation } from '@/contexts/ChatContext';
import { useTheme } from '@/contexts/ThemeContext';
import { MemoryManagerModal } from "@/components/memory/MemoryManagerModal";

const staticMenuItems = [
  { title: 'PromptForge', url: '/prompt-forge', icon: Wrench },
  { title: 'Memory', url: '/memory', icon: Brain },
  { title: 'Profiles', url: '/profiles', icon: User },
  { title: 'Settings', url: '/settings', icon: Settings }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { conversations, currentConversation, newConversation, loadConversation, deleteConversation } = useChat();
  const { theme } = useTheme();
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

  const handleDownloadConversation = (e: React.MouseEvent, conversation: Conversation) => {
    e.preventDefault();
    e.stopPropagation();

    const jsonString = JSON.stringify(conversation, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${conversation.title}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Conversation search/filter state
  const [search, setSearch] = useState('');
  const filteredConversations = search.trim().length === 0
    ? conversations
    : conversations.filter((c) =>
        c.title.toLowerCase().includes(search.trim().toLowerCase())
      );

  return (
    <>
      <Sidebar collapsible="icon" className={`bg-sidebar rounded-xl m-2 shadow group/sidebar ${isCollapsed ? 'w-14' : 'w-60'} transition-all duration-300`}>
        <SidebarContent>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className={`flex items-center p-2 ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
              <SidebarTrigger />
            </div>

            {/* New Chat Button */}
            <div className="px-2 mb-3">
              <Button
                onClick={newConversation}
                className="w-full justify-start rounded-md"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                {!isCollapsed && <span className="ml-2">New Chat</span>}
              </Button>
            </div>

            {/* Conversation Search Input */}
            {!isCollapsed && (
              <div className="px-2 mb-2">
                <SidebarInput
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-md bg-background"
                />
              </div>
            )}

            {/* Conversations - Scrollable */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
              <SidebarGroup>
                <SidebarGroupLabel>Conversations</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filteredConversations.length === 0 ? (
                      <div className={`px-3 py-2 text-xs text-muted-foreground ${isCollapsed ? 'hidden' : ''}`}>
                        No conversations found.
                      </div>
                    ) : (
                      filteredConversations.map((conversation) => (
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
                                  <div className="flex items-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={(e) => handleDownloadConversation(e, conversation)}
                                      title="Download conversation"
                                    >
                                      <Download className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={(e) => handleDeleteConversation(e, conversation.id)}
                                      title="Delete conversation"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </>
                              )}
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))
                    )}
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
