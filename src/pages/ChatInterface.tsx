
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ChatInterface = () => {
  return (
    <div className="h-full flex flex-col p-6">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Chat Interface</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Chat interface will be implemented here with OpenRouter integration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;
