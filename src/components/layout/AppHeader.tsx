
import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export function AppHeader() {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <header className="flex items-center h-14 px-4 border-b shrink-0">
      {isCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="mr-4"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}
      <div className="flex items-center gap-2 font-semibold">
        NYX <span className="text-green-500">●</span>
      </div>
    </header>
  );
}
