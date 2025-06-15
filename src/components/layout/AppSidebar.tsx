import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  Wrench,
  Brain,
  Settings,
  Plus,
  ArrowRight,
  ArrowLeft // in case needed
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

const staticMenuItems = [
  { title: 'PromptForge', url: '/prompt-forge', icon: Wrench },
  { title: 'Profiles', url: '/profiles', icon: ArrowRight }, // Placeholder, route as needed.
  { title: 'Memory', url: '/memory', icon: Brain },
  { title: 'Settings', url: '/settings', icon: Settings }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { conversations, newConversation } = useChat();
  const { theme } = useTheme();

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className={`bg-sidebar rounded-xl m-2 shadow group/sidebar ${isCollapsed ? 'w-14' : 'w-60'} transition-all duration-300`} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />
      <SidebarContent>
        <div className="flex flex-col h-full">
          {/* Logo/Header - use image logo in dark/light mode */}
          <div className="p-4 border-b flex items-center gap-2 mb-2 justify-center">
            <img
              src={theme === 'dark' ? '/logo.png' : '/logo2.png'}
              alt="NyxChat Logo"
              className="w-8 h-8 object-contain rounded-xl select-none"
              style={{ background: 'none' }}
              draggable={false}
            />
            {!isCollapsed && <h2 className="font-semibold ml-2">NyxChat</h2>}
          </div>
          {/* Independent scroll for conversations */}
          <div className="flex-1 overflow-y-auto rounded-md px-1 pb-2">
            <SidebarGroup>
              <SidebarGroupLabel>Conversations</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {conversations.map((conversation) => (
                    <SidebarMenuItem key={conversation.id}>
                      <SidebarMenuButton asChild>
                        <button
                          onClick={() => {/* TODO: Load conversation logic */}}
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
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
          {/* Static menu always anchored at bottom */}
          <div className="border-t pt-2 px-2 pb-2 rounded-b-xl bg-background/70 relative z-10">
            <Button
              onClick={newConversation}
              className="w-full justify-start mb-2 rounded-md"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              {!isCollapsed && <span>New Chat</span>}
            </Button>
            <SidebarMenu>
              {staticMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
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
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
