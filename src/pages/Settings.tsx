
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Settings = () => {
  return (
    <div className="h-full flex flex-col p-6">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Application settings will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
