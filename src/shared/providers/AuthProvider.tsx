'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createSupabaseClient } from '@/shared/services/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { hasFeature, normalizePlan, type Feature, type Plan } from '@/shared/entitlements';

interface Profile {
  id: string;
  school_id?: string;
  role: string;
  name: string;
  phone?: string;
  email?: string;
}

interface School {
  id: string;
  name: string;
  status: string;
  plan: Plan;
  owner_id: string;
}

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  school: School | null;
  loading: boolean;
  isDev: boolean;
  schoolId: string | null;
  userRole: string | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  plan: Plan;
  canUse: (feature: Feature) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  profile: null,
  school: null,
  loading: true,
  isDev: false,
  schoolId: null,
  userRole: null,
  refreshProfile: async () => {},
  signOut: async () => {},
  plan: 'free',
  canUse: () => false,
});

// Pages that don't need auth
const PUBLIC_PATHS = ['/', '/login', '/register', '/register-student'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '?'));

  const fetchProfile = useCallback(async (userId: string) => {
    const supabase = createSupabaseClient();

    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !profileData) {
      return { profile: null, school: null };
    }

    // Fetch school if school_id exists
    let schoolData: School | null = null;
    if (profileData.school_id) {
      const { data: s } = await supabase
        .from('schools')
        .select('id, name, status, plan, owner_id')
        .eq('id', profileData.school_id)
        .maybeSingle();
      schoolData = s as School | null;
    }

    return { profile: profileData as Profile, school: schoolData };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    const { profile: p, school: s } = await fetchProfile(session.user.id);
    setProfile(p);
    setSchool(s);
  }, [session?.user, fetchProfile]);

  const signOut = useCallback(async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setSchool(null);
    // Hard redirect to break any middleware/auth loop
    window.location.href = '/login';
  }, []);

  useEffect(() => {
    const supabase = createSupabaseClient();

    // Initial session check
    (async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);

      if (initialSession?.user) {
        const { profile: p, school: s } = await fetchProfile(initialSession.user.id);
        setProfile(p);
        setSchool(s);
      }

      setLoading(false);
    })();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);

        if (newSession?.user) {
          const { profile: p, school: s } = await fetchProfile(newSession.user.id);
          setProfile(p);
          setSchool(s);
        } else {
          setProfile(null);
          setSchool(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // Redirect logic (only for non-public pages)
  useEffect(() => {
    if (loading || isPublicPage) return;

    if (!session) {
      router.replace('/login');
      return;
    }

    if (!profile) {
      router.replace('/onboarding');
      return;
    }

    // Extra safety: profile punya school_id tapi school blom ke-fetch
    if (profile.role !== 'dev' && profile.school_id && !school) {
      // FIX: Jangan redirect ke pending-approval, biarkan user di /overview
      // atau redirect ke onboarding jika profile belum lengkap
      if (!profile.name || !profile.role) {
        router.replace('/onboarding');
      }
      return;
    }

    // Check school status and redirect accordingly
    if (profile.role !== 'dev') {
      if (school?.status === 'pending') {
        router.replace('/pending-approval');
        return;
      }
      if (school?.status === 'rejected') {
        router.replace('/rejected');
        return;
      }
      if (school?.status !== 'active') {
        router.replace('/pending-approval');
        return;
      }
    }
  }, [loading, session, profile, school, router, isPublicPage]);

  const isDev = profile?.role === 'dev';
  const schoolId = profile?.school_id ?? null;
  const userRole = profile?.role ?? null;
  const plan = normalizePlan(school?.plan);
  const canUse = useCallback((feature: Feature) => isDev || hasFeature(plan, feature), [isDev, plan]);

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        school,
        loading,
        isDev,
        schoolId,
        userRole,
        refreshProfile,
        signOut,
        plan,
        canUse,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
