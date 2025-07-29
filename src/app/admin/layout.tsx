"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/auth-context';
import Sidebar from "@/components/admin/sidebar";
import { Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, UserCircle } from 'lucide-react';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-16 w-16 animate-spin" />
        </div>
    );
  }

  if (!user && pathname !== '/admin/login') {
    return null; 
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
       <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
           <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="sm:max-w-xs">
                <Sidebar />
              </SheetContent>
            </Sheet>
             <div className="relative ml-auto flex-1 md:grow-0">
               <div className="flex items-center gap-2">
                <UserCircle className="h-6 w-6 text-muted-foreground"/>
                <span className="text-sm text-muted-foreground">{user?.email}</span>
               </div>
            </div>
        </header>
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8">
            {children}
        </main>
      </div>
    </div>
  );
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
