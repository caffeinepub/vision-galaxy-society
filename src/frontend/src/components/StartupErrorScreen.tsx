import { AlertCircle, RefreshCw, LogOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { hardReload } from '@/utils/hardReload';

interface StartupErrorScreenProps {
  onRetry: () => void;
  onLogout: () => void;
}

export default function StartupErrorScreen({ onRetry, onLogout }: StartupErrorScreenProps) {
  const handleHardReload = async () => {
    await hardReload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Unable to Load Application</CardTitle>
          <CardDescription>
            We couldn't load the required data to start the application. This might be due to a network issue or a temporary service problem.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Please try one of the recovery options below. If the problem persists, contact support.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            onClick={onRetry} 
            className="w-full"
            variant="default"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
          <Button 
            onClick={onLogout} 
            className="w-full"
            variant="outline"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
          <Button 
            onClick={handleHardReload} 
            className="w-full"
            variant="secondary"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Hard Reload
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
