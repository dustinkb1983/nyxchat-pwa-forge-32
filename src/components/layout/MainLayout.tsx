
import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

const MainLayout: React.FC = () => {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background flex-col">
        <div className="flex flex-1 w-full">
          <AppSidebar />
          <main className="flex-1 flex flex-col items-stretch mx-2 md:mx-4 my-2 rounded-xl bg-card shadow transition-colors duration-300 overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <div
                key={location.pathname}
                className="h-full w-full opacity-0 animate-in fade-in duration-300"
              >
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
