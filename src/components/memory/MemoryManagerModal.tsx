
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { MemoryManager } from './MemoryManager';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface MemoryManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profiles: { id: string; name: string }[];
}

export const MemoryManagerModal: React.FC<MemoryManagerModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-hidden p-0" // Removed [&>button]:hidden to show close button
        aria-describedby="memory-manager-description"
      >
        <VisuallyHidden>
          <DialogTitle>Memory Manager</DialogTitle>
          <div id="memory-manager-description">
            Manage your AI memory settings and stored information
          </div>
        </VisuallyHidden>
        <MemoryManager />
      </DialogContent>
    </Dialog>
  );
};
