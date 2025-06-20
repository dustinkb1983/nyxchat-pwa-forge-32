
import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

const MainLayout: React.FC = () => {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen bg-gradient-to-br from-background via-background to-background/95" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
        <AppSidebar />
        <main className="flex-1 flex flex-col bg-card/30 backdrop-blur-sm shadow-lg transition-all duration-300 overflow-hidden relative rounded-none md:rounded-l-2xl border-l border-border/50">
          <div className="flex-1 overflow-hidden">
            <div
              key={location.pathname}
              className="h-full w-full opacity-0 animate-in fade-in duration-500"
            >
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
