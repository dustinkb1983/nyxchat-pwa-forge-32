
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MemoryManager = () => {
  return (
    <div className="h-full flex flex-col p-6">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Memory Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Memory management interface will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemoryManager;
