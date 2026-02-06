import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, loginStatus, clear } = useInternetIdentity();
  const [error, setError] = useState<string>('');

  const handleLogin = async () => {
    setError('');
    try {
      await login();
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="absolute inset-0 bg-[url('/assets/generated/vision-galaxy-bg.dim_1920x1080.png')] bg-cover bg-center opacity-5" />
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-24 h-24 mb-2">
            <img 
              src="/assets/generated/vision-galaxy-logo.dim_512x512.png" 
              alt="Vision Galaxy Society" 
              className="w-full h-full object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-bold">Vision Galaxy Society</CardTitle>
          <CardDescription className="text-base">
            Society Management System
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button 
              onClick={handleLogin}
              disabled={loginStatus === 'logging-in'}
              className="w-full h-11 text-base font-semibold"
              size="lg"
            >
              {loginStatus === 'logging-in' ? 'Logging in...' : 'Login with Internet Identity'}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Use Internet Identity to securely access your account
            </p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              First time? You'll be asked to set up your profile after logging in.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
