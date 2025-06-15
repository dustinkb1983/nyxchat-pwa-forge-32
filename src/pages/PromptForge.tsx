
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PromptForge = () => {
  return (
    <div className="h-full flex flex-col p-6">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Prompt Forge</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Prompt library and management system will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptForge;
