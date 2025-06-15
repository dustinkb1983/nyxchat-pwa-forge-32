
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  Wrench, 
  Sparkles, 
  Brain, 
  Settings, 
  Moon, 
  Sun,
  Plus
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useChat } from '@/contexts/ChatContext';

const navigationItems = [
  { title: 'Chat', url: '/', icon: MessageSquare },
  { title: 'Prompt Forge', url: '/prompt-forge', icon: Wrench },
  { title: 'Prompt Generator', url: '/prompt-generator', icon: Sparkles },
  { title: 'Memory', url: '/memory', icon: Brain },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { conversations, newConversation } = useChat();
  
  const isCollapsed = state === 'collapsed';
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <Sidebar className={isCollapsed ? 'w-14' : 'w-60'} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent>
        {/* Header with New Chat */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-6 w-6 text-primary" />
            {!isCollapsed && <h2 className="font-semibold">NyxChat</h2>}
          </div>
          <Button 
            onClick={newConversation}
            className="w-full justify-start"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            {!isCollapsed && <span>New Chat</span>}
          </Button>
        </div>

        {/* Conversations List */}
        <SidebarGroup>
          <SidebarGroupLabel>Conversations</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="max-h-64 overflow-y-auto">
              <SidebarMenu>
                {conversations.map((conversation) => (
                  <SidebarMenuItem key={conversation.id}>
                    <SidebarMenuButton asChild>
                      <button 
                        onClick={() => {/* TODO: Load conversation */}}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground w-full text-left"
                      >
                        <MessageSquare className="h-4 w-4" />
                        {!isCollapsed && (
                          <span className="truncate">{conversation.title}</span>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => 
                        `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-accent hover:text-accent-foreground'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Theme Toggle at Bottom */}
        <div className="mt-auto p-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleTheme}
            className="w-full justify-start"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {!isCollapsed && <span className="ml-2">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
