
import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { MemoryManager } from './MemoryManager';

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <MemoryManager />
      </DialogContent>
    </Dialog>
  );
};
