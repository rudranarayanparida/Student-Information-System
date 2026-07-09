import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="bg-muted/30 p-6 rounded-full mb-6">
        <AlertCircle className="h-16 w-16 text-muted-foreground" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved. Check the URL or navigate back.
      </p>
      <Link href="/">
        <Button size="lg" className="font-medium">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
