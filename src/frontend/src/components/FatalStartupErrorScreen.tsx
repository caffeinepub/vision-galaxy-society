import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';
import { hardReload } from '@/utils/hardReload';

interface FatalStartupErrorScreenProps {
  error?: Error;
}

export default function FatalStartupErrorScreen({ error }: FatalStartupErrorScreenProps) {
  const handleReload = () => {
    window.location.reload();
  };

  const handleHardReload = () => {
    hardReload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Failed to Start</CardTitle>
          <CardDescription className="text-base">
            The application encountered an error during startup and cannot continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-muted text-sm font-mono break-all">
              {error.message || 'Unknown error'}
            </div>
          )}

          <div className="space-y-2">
            <Button 
              onClick={handleReload}
              className="w-full"
              size="lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload
            </Button>
            
            <Button 
              onClick={handleHardReload}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Hard Reload (Clear Cache)
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground pt-2">
            If the problem persists, try clearing your browser cache or contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
