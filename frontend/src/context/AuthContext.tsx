import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  birth_date?: string;
  birth_place?: string;
}

export const mapSupabaseUser = (sbUser: any): User => ({
  id:    sbUser.id,
  name:  sbUser.user_metadata?.full_name
         || sbUser.email?.split('@')[0]
         || 'Voyageur',
  email: sbUser.email || '',
  role:  sbUser.email === 'admin@casamancetour.sn' ? 'admin' : 'user',
});

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(mapSupabaseUser(session.user));
        setToken(session.access_token);
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(mapSupabaseUser(session.user));
        setToken(session.access_token);
      } else {
        setUser(null);
        setToken(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      setUser(mapSupabaseUser(data.user));
      setToken(data.session?.access_token ?? null);
    }
  };

  const register = async ({ name, email, password, birth_date, birth_place }: RegisterData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name:   name,
          birth_date:  birth_date  || null,
          birth_place: birth_place || null,
        },
      },
    });
    if (error) throw error;
    if (data.user) {
      // Create profile row (non-blocking)
      supabase.from('profiles').upsert({
        id:        data.user.id,
        full_name: name,
        role:      'user',
      }).then(() => {});
      setUser(mapSupabaseUser(data.user));
      setToken(data.session?.access_token ?? null);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
