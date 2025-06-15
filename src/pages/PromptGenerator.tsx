
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PromptGenerator = () => {
  return (
    <div className="h-full flex flex-col p-6">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Prompt Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            AI prompt generation tool will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptGenerator;
