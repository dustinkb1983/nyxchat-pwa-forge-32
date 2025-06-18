
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AnimatePresence, motion } from 'framer-motion';

const MainLayout = () => {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background flex-col">
        <div className="flex flex-1 w-full">
          <AppSidebar />
          <main className="flex-1 flex flex-col items-stretch mx-2 md:mx-4 my-2 rounded-xl bg-card shadow transition-colors duration-300 overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ 
                    duration: 0.25, 
                    ease: [0.4, 0, 0.2, 1],
                    opacity: { duration: 0.2 },
                    y: { duration: 0.25 }
                  }}
                  className="h-full w-full"
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
