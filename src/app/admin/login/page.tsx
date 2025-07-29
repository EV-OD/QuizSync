
"use client";

import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FcGoogle } from 'react-icons/fc';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { signIn, user, loading, error, signOut, setError } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if(!loading && user) {
        router.push('/admin');
    }
  }, [user, loading, router])

  const handleSignIn = () => {
    setError(null);
    signIn();
  }
  
  const handleTryAgain = () => {
    setError(null);
    // We sign out to clear any corrupted state before trying again.
    signOut();
  }

  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">Admin Login</CardTitle>
            <CardDescription>Sign in to access the dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
                 <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Authentication Error</AlertTitle>
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                     <Button onClick={handleTryAgain} variant="secondary" className="w-full mt-4">
                        Try with a different account
                    </Button>
                </Alert>
            )}
            
            {!error && (
                <Button onClick={handleSignIn} className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <FcGoogle className="mr-2 h-5 w-5" />
                  )}
                  Sign in with Google
                </Button>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
