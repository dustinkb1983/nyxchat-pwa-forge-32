
import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

const MainLayout: React.FC = () => {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex w-full bg-background" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
        <AppSidebar />
        <main className="flex-1 flex flex-col bg-card shadow transition-colors duration-300 overflow-hidden relative">
          <div className="flex-1 overflow-hidden">
            <div
              key={location.pathname}
              className="h-full w-full opacity-0 animate-in fade-in duration-300"
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
