"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithPopup,
    GoogleAuthProvider, 
    signOut as firebaseSignOut,
    User
} from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
       setUser(currentUser);
       setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      const credentialUser = result.user;
      if (credentialUser.email !== ADMIN_EMAIL) {
        setError("You are not authorized to access this admin panel.");
        await firebaseSignOut(auth);
      } else {
        router.push('/admin');
      }
    } catch (err: any) {
       if (err.code === 'auth/popup-closed-by-user') {
          setError("Sign-in cancelled. Please try again.");
       } else {
          console.error("Firebase Auth Error:", err);
          setError(err.message);
       }
    } finally {
        setLoading(false);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setError(null);
    router.push('/admin/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
