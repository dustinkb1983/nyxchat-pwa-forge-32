
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AnimatePresence, motion } from 'framer-motion';

const MainLayout = () => {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background flex-col">
        {/* Header with always-visible SidebarTrigger */}
        <header className="flex items-center gap-2 px-4 border-b h-12 bg-card/50 sticky top-0 z-20">
          <SidebarTrigger className="mr-2" />
          <span className="text-base font-semibold">NYX</span>
        </header>
        <div className="flex flex-1 w-full">
          <AppSidebar />
          {/* AnimatePresence and motion.div for smooth transitions */}
          <main className="flex-1 flex flex-col items-stretch mx-2 md:mx-4 my-2 rounded-xl bg-card shadow transition-colors duration-300 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.32, ease: 'easeOut' }}
                className="h-full w-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
